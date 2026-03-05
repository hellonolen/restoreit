import { eq } from 'drizzle-orm';
import { leads } from './schema';
import type { Env } from './index';
// @ts-expect-error - cloudflare:email is a runtime-only binding
import { EmailMessage } from "cloudflare:email";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Native Cloudflare Send Email Binding
export async function runPostmanLoop(db: any, env: Env) {
    console.log('[Postman] Initiating Outbound Dispatch...');

    if (!env.SEND_EMAIL) {
        console.log('[Postman] Missing SEND_EMAIL binding. Sleeping...');
        return;
    }

    try {
        // strict limit of 1 to ensure a slow drip, protecting the primary spam reputation of the domain
        const readySend = await db.select().from(leads).where(eq(leads.status, 'ready_to_send')).limit(1);

        if (readySend.length === 0) {
            console.log('[Postman] No completed drafts waiting in queue.');
            return;
        }

        const lead = readySend[0];

        // Safety check just in case Encricher brought in a bad email
        if (!lead.email || !lead.generatedSubject || !lead.generatedBody) {
            console.log(`[Postman] Lead ${lead.businessName} missing critical data. Marking as dead.`);
            await db.update(leads).set({ status: 'dead' }).where(eq(leads.id, lead.id));
            return;
        }

        console.log(`[Postman] Dispatching slow-drip email to: ${lead.email} (${lead.businessName})`);

        const sender = `restoreit <team@restoreit.app>`;

        // Construct raw RFC 2822 email
        const boundary = "restoreit_b2b_marketing_boundary";
        const messageId = `<${crypto.randomUUID()}@restoreit.app>`;
        const date = new Date().toUTCString();

        const rawMessage = [
            `From: ${sender}`,
            `To: ${lead.email}`,
            `Subject: ${lead.generatedSubject}`,
            `Date: ${date}`,
            `Message-ID: ${messageId}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            ``,
            lead.generatedBody,
            ``,
            `--${boundary}--`
        ].join('\r\n');

        // Create the Cloudflare Native EmailMessage
        const msg = new EmailMessage(
            "team@restoreit.app",
            lead.email,
            rawMessage
        );

        // Dispatch via Cloudflare backend Native Email Sending
        await env.SEND_EMAIL.send(msg);

        console.log(`[Postman] Successfully sent pitch to ${lead.email} via Cloudflare Native Email.`);

        // Mark as sent and update the timestamp
        await db.update(leads).set({
            status: 'sent',
            lastContactedAt: new Date()
        }).where(eq(leads.id, lead.id));

    } catch (err: unknown) {
        const errorStr = err instanceof Error ? err.message : String(err);
        console.error(`[Postman] Critical loop failure:`, errorStr);
    }
}
