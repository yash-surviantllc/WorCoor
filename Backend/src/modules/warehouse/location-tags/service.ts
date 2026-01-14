import type { FastifyReply, FastifyRequest } from 'fastify';

import { LocationTagsRepository } from './repository.js';
import type { CreateLocationTagInput, UpdateLocationTagInput } from './schemas.js';

type UnitParams = { unitId: string };
type LocationTagParams = { locationTagId: string };

export class LocationTagsService {
  constructor(private readonly repository = new LocationTagsRepository()) {}

  async list(
    request: FastifyRequest<{ Params: UnitParams }>,
    reply: FastifyReply,
  ) {
    const { unitId } = request.params;
    const tags = await this.repository.findAllByUnit(unitId, request.user.organizationId);
    const enriched = await Promise.all(
      tags.map(async (tag) => {
        const usage = await this.repository.getUsage(tag.id, request.user.organizationId);
        const utilization =
          tag.capacity > 0 ? Math.round((usage / tag.capacity) * 100 * 10) / 10 : 0;
        return {
          ...tag,
          currentItems: usage,
          utilizationPercentage: utilization,
        };
      }),
    );

    reply.send(enriched);
  }

  async create(
    request: FastifyRequest<{ Body: CreateLocationTagInput }>,
    reply: FastifyReply,
  ) {
    const orgId = request.user.organizationId;
    const existing = await this.repository.findByName(orgId, request.body.locationTagName);

    if (existing) {
      return reply.code(409).send({ error: 'Location tag name already in use' });
    }

    const tag = await this.repository.create({
      ...request.body,
      organizationId: orgId,
    });

    reply.code(201).send(tag);
  }

  async update(
    request: FastifyRequest<{ Params: LocationTagParams; Body: UpdateLocationTagInput }>,
    reply: FastifyReply,
  ) {
    const { locationTagId } = request.params;
    const orgId = request.user.organizationId;

    if (request.body.locationTagName) {
      const existing = await this.repository.findByName(
        orgId,
        request.body.locationTagName,
        locationTagId,
      );
      if (existing) {
        return reply.code(409).send({ error: 'Location tag name already in use' });
      }
    }

    const updated = await this.repository.update(locationTagId, orgId, request.body);

    if (!updated) {
      return reply.code(404).send({ error: 'Location tag not found' });
    }

    reply.send(updated);
  }
}
