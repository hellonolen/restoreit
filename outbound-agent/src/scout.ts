import { eq } from 'drizzle-orm';
import { leads } from './schema';
import type { Env } from './index';

// Native Google Places API (Cost-effective, built to replace Apify)
export async function runScoutLoop(db: any, env: Env) {
    console.log('[Scout] Initiating Native Google Places Search...');

    if (!env.GCP_PLACES_KEY) {
        console.log('[Scout] Missing GCP_PLACES_KEY constraint. Sleeping...');
        return;
    }

    // Define target queries
    const queries = [
        "Computer Repair Services",
        "IT MSP",
        "Camera Shop",
        "Photo Studio"
    ];

    // Pick one randomly for this run to keep lead diversity high
    const query = queries[Math.floor(Math.random() * queries.length)];
    const location = "Houston, Texas"; // Would eventually be randomized or chunked by zip

    try {
        const searchParams = new URLSearchParams({
            textQuery: `${query} in ${location}`,
        });

        // We use the modern Places API (New) via REST
        const response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': env.GCP_PLACES_KEY,
                // Only request the specific fields we need to keep costs practically zero
                'X-Goog-FieldMask': 'places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.rating'
            },
            body: JSON.stringify({
                textQuery: `${query} in ${location}`,
                languageCode: 'en'
            })
        });

        const data = await response.json() as any;

        if (!data.places || data.places.length === 0) {
            console.log('[Scout] Zero leads returned from query.');
            return;
        }

        let inserted = 0;

        for (const place of data.places) {
            if (!place.websiteUri) continue; // Skip places without websites

            try {
                await db.insert(leads).values({
                    id: crypto.randomUUID(),
                    businessName: place.displayName?.text || 'Unknown Business',
                    website: place.websiteUri,
                    city: place.formattedAddress?.split(',')[1]?.trim() || 'Unknown City', // Simple extraction
                    phone: place.nationalPhoneNumber || null,
                    rating: place.rating || null,
                    status: 'new'
                }).onConflictDoNothing({ target: leads.website }); // Prevent duplicates

                inserted++;
            } catch (e) {
                // Safe to ignore, handled by D1 unique restraint
            }
        }

        console.log(`[Scout] Found ${data.places.length} businesses. Inserted ${inserted} new leads.`);

    } catch (err) {
        console.error(`[Scout] Critical failure during Places API fetch:`, err);
    }
}
