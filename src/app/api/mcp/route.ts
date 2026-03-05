/**
 * restoreit MCP (Model Context Protocol) Server
 * 
 * Streamable HTTP transport endpoint for AI tool integration.
 * Mirrors the REST API with the same Bearer token auth.
 * 
 * Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http
 */

import { getDb } from '@/db'
import { apiJobs, apiUsage, cloudFiles } from '@/db/schema'
import { eq, and, desc, gte, sql } from 'drizzle-orm'
import { authenticateApiKey } from '@/lib/api-auth'
import type {
    PartnerContext,
    CreateJobRequest,
    JobStatusResponse,
    RestoredFile,
} from '@/lib/api-types'

// ---------------------------------------------------------------------------
// JSON-RPC types
// ---------------------------------------------------------------------------
interface JsonRpcRequest {
    jsonrpc: '2.0'
    id?: string | number | null
    method: string
    params?: Record<string, unknown>
}

interface JsonRpcResponse {
    jsonrpc: '2.0'
    id: string | number | null
    result?: unknown
    error?: { code: number; message: string; data?: unknown }
}

function rpcSuccess(id: string | number | null, result: unknown): JsonRpcResponse {
    return { jsonrpc: '2.0', id, result }
}

function rpcError(id: string | number | null, code: number, message: string, data?: unknown): JsonRpcResponse {
    return { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined ? { data } : {}) } }
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
const TOOLS = [
    {
        name: 'create_restore_job',
        description: 'Create a new forensic restore job. Returns a job ID and estimated wait time.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                image_url: { type: 'string', description: 'URL to fetch the disk image from' },
                r2_key: { type: 'string', description: 'R2 object key if already uploaded' },
                scan_mode: { type: 'string', enum: ['quick', 'deep'], description: 'Scan depth (default: deep)' },
                file_types: { type: 'array', items: { type: 'string' }, description: 'Filter by file extensions, e.g. ["jpg","pdf"]' },
                callback_url: { type: 'string', description: 'Webhook URL for job completion' },
                external_ref: { type: 'string', description: 'Your internal reference ID for this job' },
            },
            required: [],
        },
    },
    {
        name: 'list_restore_jobs',
        description: 'List all restore jobs for your partner account. Supports pagination.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                limit: { type: 'number', description: 'Max results (default 20, max 100)' },
                offset: { type: 'number', description: 'Pagination offset (default 0)' },
            },
            required: [],
        },
    },
    {
        name: 'get_restore_job',
        description: 'Get detailed status for a specific restore job.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                job_id: { type: 'string', description: 'The job ID (e.g. rj_abc123)' },
            },
            required: ['job_id'],
        },
    },
    {
        name: 'list_restored_files',
        description: 'List all recovered files for a completed restore job, with file type, size, confidence, and download URLs.',
        inputSchema: {
            type: 'object' as const,
            properties: {
                job_id: { type: 'string', description: 'The job ID to list files for' },
            },
            required: ['job_id'],
        },
    },
    {
        name: 'get_usage',
        description: 'Get your current billing period usage: jobs created, GB scanned, files restored, and remaining quota.',
        inputSchema: {
            type: 'object' as const,
            properties: {},
            required: [],
        },
    },
]

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------
async function handleCreateJob(partner: PartnerContext, params: Record<string, unknown>) {
    const body = params as unknown as CreateJobRequest

    if (!body.image_url && !body.r2_key) {
        return { error: 'Either image_url or r2_key is required' }
    }

    const scanMode = body.scan_mode ?? 'deep'
    if (scanMode !== 'quick' && scanMode !== 'deep') {
        return { error: 'scan_mode must be "quick" or "deep"' }
    }

    if (body.callback_url) {
        try { new URL(body.callback_url) } catch {
            return { error: 'callback_url must be a valid URL' }
        }
    }

    const db = await getDb()
    const jobId = `rj_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
    const now = new Date()

    await db.insert(apiJobs).values({
        id: jobId,
        partnerId: partner.id,
        externalRef: (body.external_ref as string) ?? null,
        imageUrl: (body.image_url as string) ?? null,
        scanMode,
        fileTypes: body.file_types ? JSON.stringify(body.file_types) : null,
        status: 'queued',
        callbackUrl: (body.callback_url as string) ?? null,
        scanId: null,
        createdAt: now,
    })

    await db.insert(apiUsage).values({
        id: crypto.randomUUID(),
        partnerId: partner.id,
        apiJobId: jobId,
        event: 'job_created',
        quantity: 1,
        recordedAt: now,
    })

    return {
        job_id: jobId,
        status: 'queued',
        estimated_wait: scanMode === 'quick' ? '1-3 minutes' : '2-10 minutes',
    }
}

async function handleListJobs(partner: PartnerContext, params: Record<string, unknown>) {
    const limit = Math.min(Number(params.limit ?? 20), 100)
    const offset = Number(params.offset ?? 0)

    const db = await getDb()
    const jobs = await db
        .select({
            id: apiJobs.id, externalRef: apiJobs.externalRef, status: apiJobs.status,
            filesFound: apiJobs.filesFound, dataRecovered: apiJobs.dataRecovered,
            error: apiJobs.error, createdAt: apiJobs.createdAt, completedAt: apiJobs.completedAt,
        })
        .from(apiJobs)
        .where(eq(apiJobs.partnerId, partner.id))
        .orderBy(desc(apiJobs.createdAt))
        .limit(limit)
        .offset(offset)

    const formatted: JobStatusResponse[] = jobs.map(j => ({
        job_id: j.id,
        external_ref: j.externalRef,
        status: j.status as JobStatusResponse['status'],
        files_found: j.filesFound,
        data_restored: j.dataRecovered,
        error: j.error,
        created_at: j.createdAt instanceof Date ? j.createdAt.toISOString() : new Date(j.createdAt as unknown as number).toISOString(),
        completed_at: j.completedAt instanceof Date ? j.completedAt.toISOString() : j.completedAt ? new Date(j.completedAt as unknown as number).toISOString() : null,
    }))

    return { jobs: formatted, total: formatted.length, limit, offset }
}

async function handleGetJob(partner: PartnerContext, params: Record<string, unknown>) {
    const jobId = params.job_id as string
    if (!jobId) return { error: 'job_id is required' }

    const db = await getDb()
    const rows = await db.select().from(apiJobs)
        .where(and(eq(apiJobs.id, jobId), eq(apiJobs.partnerId, partner.id)))
        .limit(1)

    if (rows.length === 0) return { error: 'Job not found' }

    const j = rows[0]
    return {
        job_id: j.id,
        external_ref: j.externalRef,
        status: j.status,
        files_found: j.filesFound,
        data_restored: j.dataRecovered,
        error: j.error,
        created_at: j.createdAt instanceof Date ? j.createdAt.toISOString() : new Date(j.createdAt as unknown as number).toISOString(),
        completed_at: j.completedAt instanceof Date ? j.completedAt.toISOString() : j.completedAt ? new Date(j.completedAt as unknown as number).toISOString() : null,
    }
}

async function handleListFiles(partner: PartnerContext, params: Record<string, unknown>) {
    const jobId = params.job_id as string
    if (!jobId) return { error: 'job_id is required' }

    const db = await getDb()
    const jobRows = await db.select({ scanId: apiJobs.scanId })
        .from(apiJobs)
        .where(and(eq(apiJobs.id, jobId), eq(apiJobs.partnerId, partner.id)))
        .limit(1)

    if (jobRows.length === 0) return { error: 'Job not found' }

    if (!jobRows[0].scanId) return { job_id: jobId, files: [], total: 0 }

    const files = await db.select({
        id: cloudFiles.id, fileName: cloudFiles.fileName, fileType: cloudFiles.fileType,
        sizeBytes: cloudFiles.sizeBytes, confidence: cloudFiles.confidence,
        integrity: cloudFiles.integrity, sha256: cloudFiles.sha256,
    }).from(cloudFiles).where(eq(cloudFiles.scanId, jobRows[0].scanId))

    const formatted: RestoredFile[] = files.map(f => ({
        file_id: f.id,
        file_name: f.fileName,
        file_type: f.fileType,
        size_bytes: f.sizeBytes,
        confidence: f.confidence,
        integrity: f.integrity as RestoredFile['integrity'],
        sha256: f.sha256,
        download_url: `/api/v1/restore/jobs/${jobId}/files/${f.id}/download`,
    }))

    return { job_id: jobId, files: formatted, total: formatted.length }
}

async function handleGetUsage(partner: PartnerContext) {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const db = await getDb()
    const usageRows = await db
        .select({ event: apiUsage.event, total: sql<number>`SUM(${apiUsage.quantity})`.as('total') })
        .from(apiUsage)
        .where(and(eq(apiUsage.partnerId, partner.id), gte(apiUsage.recordedAt, periodStart)))
        .groupBy(apiUsage.event)

    const usageMap = new Map(usageRows.map(r => [r.event, r.total ?? 0]))
    const gbScanned = usageMap.get('gb_scanned') ?? 0

    return {
        partner_id: partner.id,
        tier: partner.tier,
        period,
        jobs_created: usageMap.get('job_created') ?? 0,
        gb_scanned: gbScanned,
        files_restored: usageMap.get('files_restored') ?? 0,
        rate_limit: partner.rateLimit,
        monthly_gb_limit: partner.monthlyGbLimit,
        gb_remaining: partner.monthlyGbLimit !== null ? Math.max(0, partner.monthlyGbLimit - gbScanned) : null,
    }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
        return Response.json(rpcError(null, -32700, 'Content-Type must be application/json'), { status: 400 })
    }

    // Authenticate
    const auth = await authenticateApiKey(request)
    if ('error' in auth) {
        return Response.json(rpcError(null, -32001, 'Unauthorized: invalid or missing API key'), { status: 401 })
    }

    const { partner } = auth

    let body: JsonRpcRequest
    try {
        body = await request.json() as JsonRpcRequest
    } catch {
        return Response.json(rpcError(null, -32700, 'Parse error: invalid JSON'), { status: 400 })
    }

    if (body.jsonrpc !== '2.0' || !body.method) {
        return Response.json(rpcError(body.id ?? null, -32600, 'Invalid JSON-RPC 2.0 request'), { status: 400 })
    }

    const id = body.id ?? null
    const params = (body.params ?? {}) as Record<string, unknown>

    // MCP protocol methods
    switch (body.method) {
        case 'initialize': {
            return Response.json(rpcSuccess(id, {
                protocolVersion: '2025-03-26',
                capabilities: { tools: { listChanged: false } },
                serverInfo: { name: 'restoreit', version: '1.0.0' },
            }))
        }

        case 'tools/list': {
            return Response.json(rpcSuccess(id, { tools: TOOLS }))
        }

        case 'tools/call': {
            const toolName = params.name as string
            const toolArgs = (params.arguments ?? {}) as Record<string, unknown>

            let result: unknown
            try {
                switch (toolName) {
                    case 'create_restore_job':
                        result = await handleCreateJob(partner, toolArgs)
                        break
                    case 'list_restore_jobs':
                        result = await handleListJobs(partner, toolArgs)
                        break
                    case 'get_restore_job':
                        result = await handleGetJob(partner, toolArgs)
                        break
                    case 'list_restored_files':
                        result = await handleListFiles(partner, toolArgs)
                        break
                    case 'get_usage':
                        result = await handleGetUsage(partner)
                        break
                    default:
                        return Response.json(rpcError(id, -32601, `Unknown tool: ${toolName}`))
                }
            } catch (err) {
                return Response.json(rpcError(id, -32603, 'Internal error executing tool', String(err)))
            }

            // Check if tool handler returned an error
            if (result && typeof result === 'object' && 'error' in result) {
                return Response.json(rpcSuccess(id, {
                    content: [{ type: 'text', text: JSON.stringify(result) }],
                    isError: true,
                }))
            }

            return Response.json(rpcSuccess(id, {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            }))
        }

        case 'notifications/initialized':
        case 'ping': {
            return Response.json(rpcSuccess(id, {}))
        }

        default:
            return Response.json(rpcError(id, -32601, `Method not found: ${body.method}`))
    }
}

// GET for server metadata (MCP discovery)
export async function GET() {
    return Response.json({
        name: 'restoreit',
        version: '1.0.0',
        description: 'restoreit-as-a-Service MCP — forensic data recovery tools for AI agents',
        protocolVersion: '2025-03-26',
        tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    })
}
