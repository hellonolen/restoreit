import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(true),
  whopCustomerId: text('whop_customer_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const scans = sqliteTable('scans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  driveName: text('drive_name').notNull(),
  mode: text('mode', { enum: ['quick', 'deep'] }).notNull(),
  status: text('status', {
    enum: ['created', 'uploading', 'finalized', 'carving', 'ready', 'failed', 'cancelled'],
  }).notNull(),
  filesFound: integer('files_found').notNull().default(0),
  dataSize: integer('data_size').notNull().default(0),
  restoreRate: real('restore_rate').notNull().default(0),
  chunkSizeBytes: integer('chunk_size_bytes').notNull().default(16777216), // 16MB
  totalChunks: integer('total_chunks'),
  chunksReceived: integer('chunks_received').notNull().default(0),
  bytesReceived: integer('bytes_received').notNull().default(0),
  relayTokenHash: text('relay_token_hash'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
})

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  whopPaymentId: text('whop_payment_id'),
  tier: text('tier', { enum: ['standard', 'pro', 'protection'] }).notNull(),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  whopSubscriptionId: text('whop_subscription_id'),
  status: text('status', { enum: ['active', 'cancelled', 'expired'] }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
})

export const engineConversations = sqliteTable('engine_conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  scanId: text('scan_id').references(() => scans.id),
  messages: text('messages').notNull().default('[]'), // JSON array of ConversationMessage
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const cloudFiles = sqliteTable('vault_files', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  scanId: text('scan_id').references(() => scans.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  r2Key: text('r2_key').notNull(),
  startOffset: integer('start_offset'),
  endOffset: integer('end_offset'),
  sha256: text('sha256'),
  confidence: integer('confidence').notNull().default(0), // 0-100
  integrity: text('integrity', { enum: ['intact', 'partial', 'corrupt'] }).notNull().default('intact'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const carveJobs = sqliteTable('carve_jobs', {
  id: text('id').primaryKey(),
  scanId: text('scan_id').notNull().references(() => scans.id),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull(),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Restore-as-a-Service (RaaS) tables

export const partners = sqliteTable('partners', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  apiKeyHash: text('api_key_hash').notNull().unique(),
  webhookSecret: text('webhook_secret'),
  tier: text('tier', { enum: ['starter', 'growth', 'enterprise'] }).notNull().default('starter'),
  rateLimit: integer('rate_limit').notNull().default(100),
  monthlyGbLimit: real('monthly_gb_limit'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const apiJobs = sqliteTable('api_jobs', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  externalRef: text('external_ref'),
  imageUrl: text('image_url'),
  scanMode: text('scan_mode', { enum: ['quick', 'deep'] }).notNull().default('deep'),
  fileTypes: text('file_types'), // JSON array e.g. '["jpg","pdf"]'
  status: text('status', {
    enum: ['queued', 'downloading', 'processing', 'completed', 'failed'],
  }).notNull().default('queued'),
  callbackUrl: text('callback_url'),
  scanId: text('scan_id').references(() => scans.id),
  filesFound: integer('files_found').notNull().default(0),
  dataRecovered: integer('data_recovered').notNull().default(0),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
})

export const apiUsage = sqliteTable('api_usage', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  apiJobId: text('api_job_id').references(() => apiJobs.id),
  event: text('event', { enum: ['job_created', 'gb_scanned', 'files_restored'] }).notNull(),
  quantity: real('quantity').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
})
