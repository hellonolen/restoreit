const WORKER_URL = process.env.WORKER_URL
const WORKER_SECRET = process.env.WORKER_SECRET
const headers = { Authorization: `Bearer ${WORKER_SECRET}`, 'Content-Type': 'application/json' }

const res = await fetch(`${WORKER_URL}/api/internal`, {
  method: 'POST', headers,
  body: JSON.stringify({ action: 'd1_query', sql: "SELECT sql FROM sqlite_master WHERE type='table'", params: [] })
})
const data = await res.json()
for (const row of data.results ?? []) console.log(row.sql + '\n')
