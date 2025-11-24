import fastify, { FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { env } from './config/env';
import { orderRoutes } from './api/routes';
import { setupWorker, redisSub } from './services/queue';

const app = fastify({ logger: true });

// Plugins
app.register(cors);
app.register(websocket);

// Start Worker
setupWorker();

// Redis Subscriber
redisSub.subscribe('order-updates');

// WebSocket Logic
app.register(async (fastify) => {
  // @ts-ignore: Bypassing strict types to handle Docker runtime variance
  fastify.get('/ws', { websocket: true }, (connection: any, req: any) => {
    
    // --- CRITICAL FIX ---
    // Detect if we received the 'SocketStream' wrapper OR the raw 'WebSocket'
    const socket = connection.socket || connection;
    
    console.log('Client connected');

    const handleUpdate = (channel: string, message: string) => {
      if (channel === 'order-updates') {
        try {
          const data = JSON.parse(message);
          // Only send if the socket is actually OPEN (readyState 1)
          if (socket.readyState === 1) {
            socket.send(JSON.stringify(data));
          }
        } catch (err) {
          console.error('WS Broadcast Error:', err);
        }
      }
    };

    redisSub.on('message', handleUpdate);

    // Bind listeners to the actual socket object 
    socket.on('close', () => {
      redisSub.off('message', handleUpdate);
    });

    socket.on('error', (err: any) => {
      console.error('WS Client Error:', err);
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