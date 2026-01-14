import { FastifyInstance } from 'fastify';

import { registerAuthModule } from './auth/index.js';
import { registerWarehouseModule } from './warehouse/index.js';

export async function registerModules(app: FastifyInstance) {
  await registerAuthModule(app);
  await registerWarehouseModule(app);
}
