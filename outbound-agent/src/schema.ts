import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const leads = sqliteTable('leads', {
    id: text('id').primaryKey(),
    businessName: text('business_name').notNull(),
    website: text('website').unique().notNull(), // Unique constraint to prevent duplicate processing
    email: text('email'),
    city: text('city'),
    phone: text('phone'),
    rating: real('rating'),
    status: text('status', {
        enum: ['new', 'enriched', 'routing', 'pending_human_review', 'ready_to_send', 'sent', 'active_lead', 'dead', 'dnc']
    }).default('new').notNull(),
    generatedSubject: text('generated_subject'),
    generatedBody: text('generated_body'),
    agentMemory: text('agent_memory'), // Stores JSON array of tool usage/reasoning for this lead
    humanFeedback: text('human_feedback'), // Stores instructions provided by the user mid-workflow
    lastContactedAt: integer('last_contacted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Global Brand Memory table to store learned preferences across sessions
export const brandMemory = sqliteTable('brand_memory', {
    id: text('id').primaryKey(),
    concept: text('concept').notNull(), // e.g., 'tone_of_voice', 'unacceptable_buzzwords'
    memoryContent: text('memory_content').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Partner Briefing Docs (Intelligence gathered autonomously by the Agent)
export const partnerBriefings = sqliteTable('partner_briefings', {
    id: text('id').primaryKey(),
    businessName: text('business_name').notNull(),
    website: text('website').notNull(),
    briefingDoc: text('briefing_doc').notNull(), // Markdown or JSON representation of the company profile
    confidenceScore: integer('confidence_score'), // Out of 100
    lastUpdated: integer('last_updated', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
