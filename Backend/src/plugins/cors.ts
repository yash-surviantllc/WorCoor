import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

import { AppEnv } from '../config/env.js';

export async function registerCors(app: FastifyInstance, env: AppEnv) {
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
}