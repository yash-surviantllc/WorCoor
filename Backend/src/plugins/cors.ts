import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

import { AppEnv } from '../config/env.js';

export async function registerCors(app: FastifyInstance, env: AppEnv) {
  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }

      cb(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });
}