import type { FastifyInstance } from 'fastify';

import { requireRole } from '../../../common/rbac.js';
import { LocationTagsRepository } from './repository.js';
import { LocationTagsService } from './service.js';
import type { CreateLocationTagInput, UpdateLocationTagInput } from './schemas.js';

const unitParamSchema = {
  type: 'object',
  required: ['unitId'],
  properties: {
    unitId: { type: 'string', format: 'uuid' },
  },
};

const locationTagParamSchema = {
  type: 'object',
  required: ['locationTagId'],
  properties: {
    locationTagId: { type: 'string', format: 'uuid' },
  },
};

const createLocationTagBodySchema = {
  type: 'object',
  required: ['unitId', 'locationTagName', 'capacity'],
  additionalProperties: false,
  properties: {
    unitId: { type: 'string', format: 'uuid' },
    locationTagName: { type: 'string', minLength: 1, maxLength: 200 },
    capacity: { type: 'integer', minimum: 1 },
  },
};

const updateLocationTagBodySchema = {
  ...createLocationTagBodySchema,
  required: [],
};

const locationTagResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    unitId: { type: 'string', format: 'uuid' },
    organizationId: { type: 'string', format: 'uuid' },
    locationTagName: { type: 'string' },
    capacity: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    currentItems: { type: 'integer' },
    utilizationPercentage: { type: 'number' },
  },
};

type UnitParams = { unitId: string };
type LocationTagParams = { locationTagId: string };

export async function unitLocationTagsRoutes(app: FastifyInstance) {
  const repository = new LocationTagsRepository();
  const service = new LocationTagsService(repository);

  app.get<{ Params: UnitParams }>('/', {
    preHandler: [app.authenticate],
    schema: {
      params: unitParamSchema,
      response: {
        200: {
          type: 'array',
          items: locationTagResponseSchema,
        },
      },
    },
    handler: (request, reply) => service.list(request, reply),
  });
}

export async function locationTagsRoutes(app: FastifyInstance) {
  const repository = new LocationTagsRepository();
  const service = new LocationTagsService(repository);

  app.post<{ Body: CreateLocationTagInput }>('/', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      body: createLocationTagBodySchema,
      response: {
        201: locationTagResponseSchema,
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: (request, reply) => service.create(request, reply),
  });

  app.put<{ Params: LocationTagParams; Body: UpdateLocationTagInput }>('/:locationTagId', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      params: locationTagParamSchema,
      body: updateLocationTagBodySchema,
      response: {
        200: locationTagResponseSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: (request, reply) => service.update(request, reply),
  });
}
