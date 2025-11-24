import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../services/database';
import { orders } from '../models/schema';
import { orderQueue } from '../services/queue';

const OrderSchema = z.object({
  type: z.enum(['market', 'limit', 'sniper']),
  side: z.enum(['buy', 'sell']),
  token: z.string(),
  amount: z.number().positive(),
});

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post('/orders/execute', async (req, reply) => {
    try {
      const body = OrderSchema.parse(req.body);

      // Create Order in DB
      const [newOrder] = await db.insert(orders).values({
        type: body.type,
        side: body.side,
        token: body.token,
        amount: body.amount.toString(),
        status: 'pending'
      }).returning();

      // Add to Queue
      await orderQueue.add('execute-order', {
        orderId: newOrder.id,
        token: body.token,
        amount: body.amount,
        side: body.side
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });

      return reply.code(201).send({ 
        success: true, 
        orderId: newOrder.id,
        message: 'Order queued for execution' 
      });

    } catch (e: any) {
      return reply.code(400).send({ error: e.message });
    }
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', worker: 'active' };
  });
}