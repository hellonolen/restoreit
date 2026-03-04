// R2 Client — reads/writes objects via internal Worker API proxy

const WORKER_URL = process.env.WORKER_URL ?? ''
const WORKER_SECRET = process.env.WORKER_SECRET ?? ''

function headers(): Record<string, string> {
  return {
    'Authorization': `Bearer ${WORKER_SECRET}`,
    'Content-Type': 'application/json',
  }
}

export async function getObject(key: string): Promise<Uint8Array | null> {
  const response = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ action: 'r2_get', key }),
  })

  if (response.status === 404) return null
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`R2 get failed (${response.status}): ${text}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

export async function putObject(key: string, body: Uint8Array | string, contentType?: string): Promise<void> {
  const data = typeof body === 'string' ? new TextEncoder().encode(body) : body

  const response = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${WORKER_SECRET}`,
      'Content-Type': contentType ?? 'application/octet-stream',
      'X-R2-Key': key,
    },
    body: Buffer.from(data),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`R2 put failed (${response.status}): ${text}`)
  }
}

export async function listObjects(prefix: string): Promise<string[]> {
  const response = await fetch(`${WORKER_URL}/api/internal`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ action: 'r2_list', prefix }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`R2 list failed (${response.status}): ${text}`)
  }

  const data = (await response.json()) as { keys: string[] }
  return data.keys
}
