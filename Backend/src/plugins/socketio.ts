import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

import { AppEnv } from '../config/env.js';
import { registerSocketHandlers } from '../realtime/handlers/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer;
  }
}

export async function registerSocketIO(app: FastifyInstance, env: AppEnv) {
  const httpServer = createServer(app.server as never);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  app.decorate('io', io);

  app.addHook('onClose', async () => {
    await io.close();
  });
}