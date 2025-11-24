import { pgTable, uuid, varchar, decimal, timestamp, text, jsonb } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 20 }).notNull(), // 'market', 'limit'
  side: varchar('side', { length: 10 }).notNull(), // 'buy', 'sell'
  token: varchar('token', { length: 20 }).notNull(),
  amount: decimal('amount').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  txHash: varchar('tx_hash', { length: 100 }),
  executionPrice: decimal('execution_price'),
  logs: jsonb('logs').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;