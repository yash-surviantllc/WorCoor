import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import {
  loginSchema,
  confirmPasswordResetSchema,
  registerSchema,
  requestPasswordResetSchema,
  type LoginInput,
  type RegisterInput,
  type RequestPasswordResetInput,
  type ConfirmPasswordResetInput,
} from './schemas.js';
import { AuthService } from './service.js';

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService();

  app.post<{ Body: LoginInput }>('/login', {
    schema: { body: loginSchema },
    handler: async (request, reply) => {
      await service.login(request, reply);
    },
  });

  app.post<{ Body: RegisterInput }>('/register', {
    schema: { body: registerSchema },
    handler: async (request, reply) => {
      await service.register(request, reply);
    },
  });

  app.post<{ Body: RequestPasswordResetInput }>('/password/reset/request', {
    schema: { body: requestPasswordResetSchema },
    handler: async (request, reply) => {
      await service.requestPasswordReset(request, reply);
    },
  });

  app.post<{ Body: ConfirmPasswordResetInput }>('/password/reset/confirm', {
    schema: { body: confirmPasswordResetSchema },
    handler: async (request, reply) => {
      await service.confirmPasswordReset(request, reply);
    },
  });

  app.post(
    '/logout',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await service.logout(request, reply);
    },
  );
}
