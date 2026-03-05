import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { leads } from './schema';
import { runScoutLoop } from './scout';
import { runEnricherLoop } from './enricher';
import { runAgenticLoop } from './researcher';
import { runPostmanLoop } from './postman';
import { sql, count, eq } from 'drizzle-orm';

export interface Env {
    DB: D1Database;
    GCP_PLACES_KEY: string;
    GEMINI_API_KEY: string;
    SEND_EMAIL: SendEmail;
    ADMIN_SECRET: string;
}

export default {
    // HTTP handler — serves pipeline data to the admin dashboard
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // CORS headers for the dashboard
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Authenticate with the shared secret
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (token !== env.ADMIN_SECRET) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (url.pathname === '/api/pipeline') {
            const db = drizzle(env.DB, { schema });

            // Get counts by status
            const statusRows = await db
                .select({ status: leads.status, total: count() })
                .from(leads)
                .groupBy(leads.status);

            const stats: Record<string, number> = { total: 0 };
            for (const row of statusRows) {
                stats[row.status] = row.total;
                stats.total += row.total;
            }

            // Get 50 most recent leads
            const recentLeads = await db
                .select({
                    id: leads.id,
                    businessName: leads.businessName,
                    website: leads.website,
                    email: leads.email,
                    status: leads.status,
                    generatedSubject: leads.generatedSubject,
                    lastContactedAt: leads.lastContactedAt,
                    createdAt: leads.createdAt,
                })
                .from(leads)
                .orderBy(sql`${leads.createdAt} DESC`)
                .limit(50);

            return new Response(JSON.stringify({ stats, leads: recentLeads }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (url.pathname === '/api/trigger') {
            const type = url.searchParams.get('type');
            const db = drizzle(env.DB, { schema });
            const logPrefix = `[TRIGGER] ${type?.toUpperCase()}`;
            console.log(`${logPrefix} Manual trigger initiated.`);

            try {
                switch (type) {
                    case 'scout':
                        await runScoutLoop(db, env);
                        break;
                    case 'enricher':
                        await runEnricherLoop(db, env);
                        break;
                    case 'brain':
                        await runAgenticLoop(db, env);
                        break;
                    case 'postman':
                        await runPostmanLoop(db, env);
                        break;
                    case 'full':
                        // Run a small batch of everything sequentially
                        await runScoutLoop(db, env);
                        await runEnricherLoop(db, env);
                        await runAgenticLoop(db, env);
                        // Postman will run on its next 5-min cycle or can be triggered again
                        break;
                    default:
                        return new Response(JSON.stringify({ error: 'Invalid trigger type. Use scout, enricher, brain, postman, or full.' }), {
                            status: 400,
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        });
                }
                return new Response(JSON.stringify({ success: true, message: `${type} completed.` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (err) {
                console.error(`${logPrefix} Failed:`, err);
                return new Response(JSON.stringify({ error: String(err) }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        if (url.pathname === '/api/debug') {
            return new Response(JSON.stringify({
                has_db: !!env.DB,
                has_places_key: !!env.GCP_PLACES_KEY,
                has_gemini_key: !!env.GEMINI_API_KEY,
                has_email: !!env.SEND_EMAIL,
                has_admin_secret: !!env.ADMIN_SECRET,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    },
    // Inbound email handler — makes this worker visible in Cloudflare Email Routing
    async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
        const logPrefix = `[EMAIL] ${message.from} → ${message.to}`;
        try {
            // Forward all inbound replies to backup Gmail
            await message.forward("savantrockgroup@gmail.com");
            console.log(`${logPrefix} Forwarded to backup inbox.`);
        } catch (error) {
            console.error(`${logPrefix} Forward failed:`, error);
        }
    },

    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        const db = drizzle(env.DB, { schema });

        // Cloudflare triggers pass the CRON string that initiated the run
        console.log(`[CRON] Engine awakened by schedule: ${event.cron}`);

        try {
            switch (event.cron) {
                case '0 0 * * SUN':
                    // 1. Weekly Scout: Finds the local businesses
                    await runScoutLoop(db, env);
                    break;
                case '*/15 * * * *':
                    // 2. 15-Min Enricher: Native website scraping for emails
                    await runEnricherLoop(db, env);
                    break;
                case '*/5 * * * *':
                    // 3. 5-Min Agentic Brain: AI Research, Memory, and Pitch generation
                    await runAgenticLoop(db, env);
                    break;
                case '* 9-17 * * Mon-Fri':
                    // 4. Working Hours Postman: Slowly dispatches the emails
                    await runPostmanLoop(db, env);
                    break;
                default:
                    console.log(`[CRON] Unhandled schedule pattern: ${event.cron}`);
            }
        } catch (e) {
            console.error(`[CRON] Engine failure during ${event.cron}:`, e);
        }
    },
};
