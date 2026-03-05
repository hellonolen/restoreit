const EMAILIT_API_URL = 'https://api.emailit.com/v1/emails'
const FROM_ADDRESS = 'noreply@restoreit.app'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = FROM_ADDRESS }: SendEmailParams) {
  const apiKey = process.env.EMAILIT_API_KEY
  if (!apiKey) {
    throw new Error('EMAILIT_API_KEY not configured')
  }

  const response = await fetch(EMAILIT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Unknown error' }))) as { message?: string }
    throw new Error(`EmailIt error: ${error.message}`)
  }

  return response.json() as Promise<Record<string, unknown>>
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to restoreit',
    html: `
      <h1>Welcome, ${firstName}!</h1>
      <p>Your restoreit account is ready. You can now restore deleted files safely from any drive.</p>
      <p>Get started at <a href="https://restoreit.app/restore">restoreit.app/restore</a></p>
    `,
  })
}

export async function sendRestoreCompleteEmail(email: string, fileCount: number) {
  return sendEmail({
    to: email,
    subject: 'Your files are ready to download',
    html: `
      <h1>Restoration Complete</h1>
      <p>We restored <strong>${fileCount} files</strong> from your drive.</p>
      <p>View and download your files at <a href="https://restoreit.app/account/cloud">restoreit Cloud</a>.</p>
    `,
  })
}

export async function sendSubscriptionConfirmedEmail(email: string, firstName: string) {
  return sendEmail({
    to: email,
    subject: 'restoreit Protection Plan activated',
    html: `
      <h1>Protection Plan Active</h1>
      <p>Hi ${firstName}, your $29/month Protection Plan is now active.</p>
      <p>You now have priority restore queue, extended cloud retention, and continuous disk monitoring.</p>
    `,
  })
}
