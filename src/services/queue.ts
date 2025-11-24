import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { orderProcessor } from '../workers/orderWorker';

const connection = new IORedis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

export const orderQueue = new Queue('order-execution', { connection });

// Initialize Worker
export const setupWorker = () => {
  const worker = new Worker('order-execution', orderProcessor, { 
    connection,
    concurrency: 10, // Requirement: 10 concurrent orders
    limiter: {
        max: 100,
        duration: 60000 // Requirement: 100 orders/minute
    }
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
  });
  
  return worker;
};

// Redis PubSub for WebSocket updates
export const redisPub = new IORedis({ host: env.REDIS_HOST, port: parseInt(env.REDIS_PORT) });
export const redisSub = new IORedis({ host: env.REDIS_HOST, port: parseInt(env.REDIS_PORT) });