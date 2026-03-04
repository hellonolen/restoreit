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
  status: text('status', { enum: ['in-progress', 'completed', 'cancelled', 'paused'] }).notNull(),
  filesFound: integer('files_found').notNull().default(0),
  dataSize: integer('data_size').notNull().default(0),
  restoreRate: real('restore_rate').notNull().default(0),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
})

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  whopPaymentId: text('whop_payment_id'),
  tier: text('tier', { enum: ['standard', 'pro'] }).notNull(),
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

export const vaultFiles = sqliteTable('vault_files', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  scanId: text('scan_id').references(() => scans.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  r2Key: text('r2_key').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
