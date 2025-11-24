import { Job } from 'bullmq';
import { db } from '../services/database';
import { orders } from '../models/schema';
import { dexRouter } from '../services/dexRouter';
import { redisPub } from '../services/queue';
import { eq } from 'drizzle-orm';

interface OrderJobData {
  orderId: string;
  token: string;
  amount: number;
  side: string;
}

const publishUpdate = async (orderId: string, status: string, data?: any) => {
  const payload = JSON.stringify({ orderId, status, ...data });
  await redisPub.publish('order-updates', payload);
  
  // Update DB logs
  // In a real app, we'd append to a logs array column
};

export const orderProcessor = async (job: Job<OrderJobData>) => {
  const { orderId, token, amount } = job.data;

  try {
    // 1. Pending
    await publishUpdate(orderId, 'pending');
    
    // 2. Routing
    await publishUpdate(orderId, 'routing');
    const quotes = await dexRouter.getQuotes(token, amount);
    
    console.log(`[Order ${orderId}] Best DEX: ${quotes.best} @ ${quotes.bestPrice}`);

    // 3. Building/Submitting
    await publishUpdate(orderId, 'building', { dex: quotes.best, price: quotes.bestPrice });
    
    await db.update(orders)
      .set({ status: 'submitted' })
      .where(eq(orders.id, orderId));

    await publishUpdate(orderId, 'submitted');

    // 4. Execution
    const result = await dexRouter.executeSwap(quotes.best, amount);

    // 5. Confirmed
    await db.update(orders)
      .set({ 
        status: 'confirmed', 
        txHash: result.txHash,
        executionPrice: quotes.bestPrice.toString() 
      })
      .where(eq(orders.id, orderId));

    await publishUpdate(orderId, 'confirmed', { txHash: result.txHash });

    return { success: true, txHash: result.txHash };

  } catch (error: any) {
    await db.update(orders)
      .set({ status: 'failed' })
      .where(eq(orders.id, orderId));
      
    await publishUpdate(orderId, 'failed', { error: error.message });
    throw error;
  }
};