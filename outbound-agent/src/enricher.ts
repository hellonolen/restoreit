import { eq } from 'drizzle-orm';
import { leads } from './schema';
import * as cheerio from 'cheerio';
import type { Env } from './index';

// Native Website Scraper (Cost-effective, built to replace Hunter.io)
export async function runEnricherLoop(db: any, env: Env) {
    console.log('[Enricher] Initiating Native Website Email Extraction...');

    try {
        // Grab up to 50 new leads that need emails
        const pendingLeads = await db.select().from(leads).where(eq(leads.status, 'new')).limit(50);

        if (pendingLeads.length === 0) {
            console.log('[Enricher] No new leads to process.');
            return;
        }

        let enrichedCount = 0;

        for (const lead of pendingLeads) {
            try {
                console.log(`[Enricher] Scanning ${lead.website}...`);

                // 1. Fetch the homepage
                const response = await fetch(lead.website, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });

                if (!response.ok) {
                    // Mark as dead if the website is permanently down
                    await db.update(leads).set({ status: 'dead' }).where(eq(leads.id, lead.id));
                    continue;
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                let emailFound = null;

                // 2. Strategy A: Look for explicit mailto links
                $('a[href^="mailto:"]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href) {
                        const potentialEmail = href.replace('mailto:', '').split('?')[0].trim();
                        if (validateEmail(potentialEmail)) emailFound = potentialEmail;
                    }
                });

                // 3. Strategy B: Broad Regex scan of the body text if Strategy A failed
                if (!emailFound) {
                    const bodyText = $('body').text();
                    // Regex for basic email format
                    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                    const matches = bodyText.match(emailRegex);

                    if (matches && matches.length > 0) {
                        // Filter out common false positives (e.g., image.jpg@2x)
                        const validMatches = matches.filter(validateEmail);
                        if (validMatches.length > 0) emailFound = validMatches[0];
                    }
                }

                if (emailFound) {
                    console.log(`[Enricher] Found email for ${lead.businessName}: ${emailFound}`);
                    await db.update(leads).set({
                        email: emailFound,
                        status: 'enriched'
                    }).where(eq(leads.id, lead.id));
                    enrichedCount++;
                } else {
                    console.log(`[Enricher] No email found for ${lead.businessName}.`);
                    // We could optionally set status to 'failed_enrichment', but for now we leave it
                    // or mark it dead so it doesn't get re-processed endlessly.
                    await db.update(leads).set({ status: 'dead' }).where(eq(leads.id, lead.id));
                }

            } catch (e) {
                console.error(`[Enricher] Failed to process ${lead.website}:`, (e as Error).message);
                await db.update(leads).set({ status: 'dead' }).where(eq(leads.id, lead.id));
            }
        }

        console.log(`[Enricher] Run complete. Enriched ${enrichedCount} out of ${pendingLeads.length} leads.`);

    } catch (err) {
        console.error(`[Enricher] Critical failure:`, err);
    }
}

// Basic validation to avoid false positives from the regex
function validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && !email.toLowerCase().endsWith('.png') && !email.toLowerCase().endsWith('.jpg');
}
