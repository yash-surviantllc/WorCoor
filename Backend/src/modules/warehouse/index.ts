import { FastifyInstance } from 'fastify';

import { unitsRoutes } from './units/routes.js';
import { layoutsRoutes, layoutRoutes } from './layouts/routes.js';
import { liveMapRoutes } from './live-map/routes.js';
import { componentsRoutes, componentRoutes } from './components/routes.js';

export async function registerWarehouseModule(app: FastifyInstance) {
  await app.register(unitsRoutes, { prefix: '/api/units' });
  await app.register(layoutRoutes, { prefix: '/api/layouts' });
  await app.register(componentRoutes, { prefix: '/api/components' });

  // Nested routes: /api/units/:unitId/layouts and /api/units/:unitId/live-map
  app.register(async (unitScope) => {
    unitScope.register(layoutsRoutes, { prefix: '/layouts' });
    unitScope.register(liveMapRoutes, { prefix: '/live-map' });
    unitScope.register(componentsRoutes, { prefix: '/layouts/:layoutId/components' });
  }, { prefix: '/api/units/:unitId' });
}
