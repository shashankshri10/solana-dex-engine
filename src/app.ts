import fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { env } from './config/env';
import { orderRoutes } from './api/routes';
import { setupWorker, redisSub } from './services/queue';

const app = fastify({ logger: true });

// Plugins
app.register(cors);
app.register(websocket);

// Start Worker (In same process for demo simplicity, usually separate)
setupWorker();

// Redis Subscriber for WS broadcasts
redisSub.subscribe('order-updates');

// WebSocket Logic
app.register(async (fastify) => {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    console.log('Client connected');

    const handleUpdate = (channel: string, message: string) => {
      if (channel === 'order-updates') {
        const data = JSON.parse(message);
        // In real app, check if this client owns this orderId
        connection.socket.send(JSON.stringify(data));
      }
    };

    redisSub.on('message', handleUpdate);

    connection.socket.on('close', () => {
      redisSub.off('message', handleUpdate);
    });
  });
});

// Routes
app.register(orderRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await app.listen({ port: parseInt(env.PORT), host: '0.0.0.0' });
    console.log(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();