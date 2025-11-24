import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './src/migrations',
  dialect: 'postgresql', // Changed from driver: 'pg'
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});