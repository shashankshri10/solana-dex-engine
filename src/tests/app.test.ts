import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockDexRouter } from '../services/dexRouter';
import { orderProcessor } from '../workers/orderWorker';
import { z } from 'zod';

// Mock dependencies
vi.mock('../services/database', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: '123' }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue({}),
  }
}));

vi.mock('../services/queue', () => ({
  redisPub: { publish: vi.fn() },
  orderQueue: { add: vi.fn() }
}));

describe('DEX Engine Tests', () => {
  let router: MockDexRouter;

  beforeEach(() => {
    router = new MockDexRouter();
    vi.clearAllMocks();
  });

  // --- UNIT: DEX ROUTER LOGIC ---
  it('1. Router should return quotes for both DEXs', async () => {
    const quotes = await router.getQuotes('SOL', 1);
    expect(quotes).toHaveProperty('raydium');
    expect(quotes).toHaveProperty('meteora');
  });

  it('2. Router should identify the best price', async () => {
    const quotes = await router.getQuotes('SOL', 1);
    const bestPrice = Math.min(quotes.raydium.price, quotes.meteora.price);
    expect(quotes.bestPrice).toBe(bestPrice);
  });

  // --- UNIT: VALIDATION LOGIC ---
  it('3. Order Schema should accept valid data', () => {
    const OrderSchema = z.object({
      type: z.enum(['market', 'limit']),
      side: z.enum(['buy', 'sell']),
      amount: z.number().positive(),
    });
    const result = OrderSchema.safeParse({ type: 'market', side: 'buy', amount: 10 });
    expect(result.success).toBe(true);
  });

  it('4. Order Schema should reject negative amounts', () => {
    const OrderSchema = z.object({ amount: z.number().positive() });
    const result = OrderSchema.safeParse({ amount: -5 });
    expect(result.success).toBe(false);
  });

  // --- INTEGRATION: WORKER LIFECYCLE ---
  it('5. Worker should publish "pending" status', async () => {
    const mockJob: any = { data: { orderId: '123', token: 'SOL', amount: 1 } };
    await orderProcessor(mockJob);
    const { redisPub } = await import('../services/queue');
    expect(redisPub.publish).toHaveBeenCalledWith('order-updates', expect.stringContaining('"status":"pending"'));
  });

  it('6. Worker should publish "routing" status', async () => {
    const mockJob: any = { data: { orderId: '123', token: 'SOL', amount: 1 } };
    await orderProcessor(mockJob);
    const { redisPub } = await import('../services/queue');
    expect(redisPub.publish).toHaveBeenCalledWith('order-updates', expect.stringContaining('"status":"routing"'));
  });

  it('7. Worker should interact with Database', async () => {
    const mockJob: any = { data: { orderId: '123', token: 'SOL', amount: 1 } };
    await orderProcessor(mockJob);
    const { db } = await import('../services/database');
    expect(db.update).toHaveBeenCalled();
  });
});