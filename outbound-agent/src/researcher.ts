import { eq } from 'drizzle-orm';
import { leads, partnerBriefings, brandMemory } from './schema';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { Env } from './index';
import * as cheerio from 'cheerio';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function runAgenticLoop(db: any, env: Env) {
    console.log('[Agentic Brain] Initiating Research & Copywriter Loop...');

    if (!env.GEMINI_API_KEY) {
        console.log('[Agentic Brain] Missing GEMINI_API_KEY. Sleeping...');
        return;
    }

    // Initialize Vercel AI SDK Google provider with stable v1 API
    const google = createGoogleGenerativeAI({
        apiKey: env.GEMINI_API_KEY,
    });

    try {
        const readyLeads = await db.select().from(leads).where(eq(leads.status, 'enriched')).limit(10);

        if (readyLeads.length === 0) {
            console.log('[Agentic Brain] No enriched leads waiting for copy.');
            return;
        }

        // Load Semantic Brand Memory (Past learnings)
        const storedMemory = await db.select().from(brandMemory);
        const memoryRules = storedMemory.map((m: { concept: string; memoryContent: string }) => `${m.concept}: ${m.memoryContent}`).join('\n');
        const memoryPromptContext = memoryRules.length > 0
            ? `CRITICAL BRAND CONSTRAINTS (Learned from past feedback):\n${memoryRules}`
            : `Use standard professional business tone.`;

        for (const lead of readyLeads) {
            let briefingData = { primary_service: "IT Support", custom_icebreaker: "your dedication to local clients" };
            let pitchData = {
                subject: `Partnership proposal for ${lead.businessName}`,
                body: `Hi there,\n\nI noticed the great work you're doing in ${lead.city} and wanted to reach out. We've built 'RestoreIt', a zero-install data recovery tool that your team can use on client machines to generate high-margin revenue instantly.\n\nWould you be open to a quick chat about adding this to your service menu?`
            };

            try {
                console.log(`[Agentic Brain] Processing ${lead.businessName}...`);

                // 1. AUTONOMOUS RESEARCH: Build the Partner Briefing Doc
                const response = await fetch(lead.website, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const html = await response.text();
                const $ = cheerio.load(html);
                $('script, style, noscript, svg').remove(); // Clean junk
                const pageText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000);

                const briefingPrompt = `
                You are a Business Intelligence Agent for RestoreIt.
                Analyze the following raw website text for a local IT/Repair business named ${lead.businessName}.
                Generate a JSON briefing: "primary_service", "target_audience", "estimated_pain_point", "custom_icebreaker".
                Raw Data: ${pageText}
            `;

                console.log(`[Agentic Brain] Generating Intelligence Briefing...`);
                // Use gemini-1.5-flash as it's the stable workhorse
                const { text: briefingJsonStr } = await generateText({
                    model: google('gemini-1.5-flash'),
                    prompt: briefingPrompt,
                });

                const cleanJsonStr = briefingJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                try {
                    briefingData = JSON.parse(cleanJsonStr);
                } catch {
                    console.log(`[Agentic Brain] Failed to parse briefing JSON. Using fallback.`);
                }

                // Save Briefing
                await db.insert(partnerBriefings).values({
                    id: crypto.randomUUID(),
                    businessName: lead.businessName,
                    website: lead.website,
                    briefingDoc: JSON.stringify(briefingData),
                    confidenceScore: 90
                });

                // 2. THE COPYWRITER: Draft the exact email
                const copyPrompt = `
                You are Head of Partnerships for 'RestoreIt'. Draft a cold B2B email to ${lead.businessName}.
                Service: ${briefingData.primary_service}. Icebreaker: ${briefingData.custom_icebreaker}. City: ${lead.city}.
                ${memoryPromptContext}
                Output ONLY JSON: "subject" and "body" (max 4 sentences).
            `;

                console.log(`[Agentic Brain] Drafting Personalized Pitch...`);
                const { text: pitchJsonStr } = await generateText({
                    model: google('gemini-1.5-flash'),
                    prompt: copyPrompt,
                    temperature: 0.7,
                });

                const cleanPitchStr = pitchJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                try {
                    pitchData = JSON.parse(cleanPitchStr);
                } catch {
                    console.log(`[Agentic Brain] Failed to parse pitch JSON. Using fallback.`);
                }

                // 3. SECURE THE DRAFT
                await db.update(leads).set({
                    generatedSubject: pitchData.subject,
                    generatedBody: pitchData.body,
                    status: 'ready_to_send',
                    agentMemory: JSON.stringify({ used_briefing: true, insights: briefingData })
                }).where(eq(leads.id, lead.id));

                console.log(`[Agentic Brain] Success for ${lead.businessName}. Lead ready for Postman.`);

            } catch (e: unknown) {
                const errorStr = e instanceof Error ? e.message : String(e);
                console.error(`[Agentic Brain] AI Error for ${lead.businessName}:`, errorStr);

                // FALLBACK: If AI fails, we STILL send the email using the high-quality hardcoded fallback
                await db.update(leads).set({
                    generatedSubject: pitchData.subject,
                    generatedBody: pitchData.body,
                    status: 'ready_to_send',
                    agentMemory: JSON.stringify({ error: errorStr, used_fallback: true })
                }).where(eq(leads.id, lead.id));

                console.log(`[Agentic Brain] Falling back to standard pitch for ${lead.businessName}.`);
            }
        }

    } catch (err: unknown) {
        const errorStr = err instanceof Error ? err.message : String(err);
        console.error(`[Agentic Brain] Critical loop failure:`, errorStr);
    }
}
