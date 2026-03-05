import type { FastifyReply, FastifyRequest } from 'fastify';
import { and, eq } from 'drizzle-orm';

import { db } from '../../../config/database.js';
import { layouts, locationTags as locationTagsTable, skus } from '../../../database/schema/index.js';
import { ComponentsRepository, type LocationTagWithSkus } from './repository.js';
import type {
  CreateComponentInput,
  UpdateComponentInput,
  UpdateLocationTagInput,
} from './schemas.js';
import { LiveMapRepository } from '../live-map/repository.js';
import { LiveMapWebSocketService } from '../live-map/websocket-service.js';

type LayoutParams = { layoutId: string };
type ComponentParams = { componentId: string };

// Helper function to extract levels from metadata
function extractLevelsFromMetadata(metadataRaw: unknown): {
  levelId: string;
  locationIds: string[];
}[] {
  if (!metadataRaw) return [];
  
  try {
    const parsed = typeof metadataRaw === 'string'
      ? JSON.parse(metadataRaw)
      : metadataRaw as Record<string, unknown>;
    const compartmentContents = parsed?.compartmentContents;
    if (!compartmentContents || typeof compartmentContents !== 'object') {
      return [];
    }

    // Collect all locationIds grouped by levelId across all bays
    // levelMap: { "L1": Set<string>, "L2": Set<string>, "L3": Set<string> }
    const levelMap = new Map<string, Set<string>>();

    for (const compartmentKey of Object.keys(compartmentContents)) {
      const compartment = compartmentContents[compartmentKey];
      if (!compartment?.isMultiLocation) continue;
      
      const mappings: { levelId: string; locationId: string }[] = 
        compartment?.levelLocationMappings ?? [];

      for (const mapping of mappings) {
        if (!levelMap.has(mapping.levelId)) {
          levelMap.set(mapping.levelId, new Set());
        }
        levelMap.get(mapping.levelId)!.add(mapping.locationId);
      }
    }

    // Convert to array sorted by levelId (L1, L2, L3)
    return Array.from(levelMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([levelId, locationIdSet]) => ({
        levelId,
        locationIds: Array.from(locationIdSet).sort()
      }));

  } catch {
    return [];
  }
}

export class ComponentsService {
  constructor(private readonly repository = new ComponentsRepository()) {}

  async list(
    request: FastifyRequest<{ Params: LayoutParams }>,
    reply: FastifyReply,
  ) {
    const { layoutId } = request.params;
    const orgId = request.user.organizationId;
    const layout = await this.assertLayoutAccess(layoutId, orgId);

    if (!layout) {
      return reply.code(404).send({ error: 'Layout not found' });
    }

    const items = await this.repository.findAllByLayout(layoutId, orgId);
    
    // Apply new metadata-based multi-level logic for vertical racks
    const componentsWithMultiLevel = await Promise.all(
      items.map(async (component) => {
        let locationTags: LocationTagWithSkus[] = [];
        let isMultiLevel = false;
        let overallUtilization = 0;

        if (component.componentType === 'vertical_sku_holder') {
          const levels = extractLevelsFromMetadata(component.metadata);

          if (levels.length > 1) {
            // Multi-level rack — fetch tags per level, aggregate SKUs
            isMultiLevel = true;
            
            for (let i = 0; i < levels.length; i++) {
              const level = levels[i];
              const tags = await this.repository
                .getLocationTagsByNames(level.locationIds, orgId);

              // Aggregate this level's data
              const totalCapacity = tags.reduce((s, t) => s + t.capacity, 0);
              const totalItems = tags.reduce((s, t) => s + t.currentItems, 0);
              const allSkus = tags.flatMap(t => t.skus);
              const utilization = totalCapacity > 0 
                ? (totalItems / totalCapacity) * 100 
                : 0;

              locationTags.push({
                id: tags[0]?.id ?? `level-${i}`,
                tagName: `Level ${i + 1} (${level.levelId})`,
                levelNumber: i + 1,
                capacity: totalCapacity,
                currentItems: totalItems,
                utilizationPercentage: Math.round(utilization * 10) / 10,
                skus: allSkus
              });
            }

            // Overall utilization across all levels
            const totalCap = locationTags.reduce((s, t) => s + t.capacity, 0);
            const totalItems = locationTags.reduce((s, t) => s + t.currentItems, 0);
            overallUtilization = totalCap > 0 
              ? Math.round((totalItems / totalCap) * 1000) / 10 
              : 0;

          } else {
            // Single location tag — wrap in array
            if (component.locationTagId) {
              const tag = await this.repository
                .getLocationTagsByNames(
                  [component.locationTagName ?? ''], 
                  orgId
                );
              locationTags = tag.map((t, i) => ({ ...t, levelNumber: i + 1 }));
            }
            overallUtilization = locationTags[0]?.utilizationPercentage ?? 0;
          }

        } else {
          // Non-vertical component — wrap single tag in array
          if (component.locationTagId) {
            const tag = await this.repository
              .getLocationTagsByNames(
                [component.locationTagName ?? ''], 
                orgId
              );
            locationTags = tag.map((t, i) => ({ ...t, levelNumber: i + 1 }));
          }
          overallUtilization = locationTags[0]?.utilizationPercentage ?? 0;
        }

        return {
          ...component,
          locationTags,
          overallUtilization,
          isMultiLevel
        };
      })
    );

    reply.send(componentsWithMultiLevel);
  }

  private async assertLayoutAccess(layoutId: string, organizationId: string) {
    const result = await db
      .select()
      .from(layouts)
      .where(and(eq(layouts.id, layoutId), eq(layouts.organizationId, organizationId)))
      .limit(1);

    return result[0] ?? null;
  }

  private async assertLocationTagAccess(
    locationTagId: string,
    organizationId: string,
    unitId?: string,
  ) {
    const result = await db
      .select()
      .from(locationTagsTable)
      .where(and(eq(locationTagsTable.id, locationTagId), eq(locationTagsTable.organizationId, organizationId)))
      .limit(1);

    const tag = result[0];
    if (!tag) {
      return null;
    }

    if (unitId && tag.unitId !== unitId) {
      throw new Error('Location tag belongs to a different unit');
    }

    return tag;
  }

  async create(
    request: FastifyRequest<{ Params: LayoutParams; Body: CreateComponentInput }>,
    reply: FastifyReply,
  ) {
    const { layoutId } = request.params;
    const orgId = request.user.organizationId;
    const layout = await this.assertLayoutAccess(layoutId, orgId);

    if (!layout) {
      return reply.code(404).send({ error: 'Layout not found' });
    }

    let resolvedTagName: string | null = null;
    if (request.body.locationTagId) {
      const tag = await this.assertLocationTagAccess(
        request.body.locationTagId,
        orgId,
        layout.unitId,
      );
      if (!tag) {
        return reply.code(404).send({ error: 'Location tag not found' });
      }
      resolvedTagName = tag.locationTagName;
    }

    const component = await this.repository.create({
      ...request.body,
      color: request.body.color ?? null,
      locationTagId: request.body.locationTagId ?? null,
      locationTagName: resolvedTagName,
      label: request.body.label ?? null,
      metadata: request.body.metadata ?? null,
      organizationId: orgId,
      layoutId,
    });

    // Broadcast WebSocket update for real-time statistics
    try {
      const liveMapRepository = new LiveMapRepository();
      const wsService = new LiveMapWebSocketService(liveMapRepository, request.server);
      await wsService.onComponentCreated(layout.unitId, orgId, layoutId);
    } catch (err) {
      console.error('Failed to broadcast component creation:', err);
    }

    reply.code(201).send(component);
  }

  async update(
    request: FastifyRequest<{ Params: ComponentParams; Body: UpdateComponentInput }>,
    reply: FastifyReply,
  ) {
    const { componentId } = request.params;
    const orgId = request.user.organizationId;
    const existing = await this.repository.findById(componentId, orgId);

    if (!existing) {
      return reply.code(404).send({ error: 'Component not found' });
    }

    let locationTagName: string | null | undefined = undefined;
    if (request.body.locationTagId !== undefined) {
      if (request.body.locationTagId) {
        const tag = await this.assertLocationTagAccess(request.body.locationTagId, orgId);
        locationTagName = tag?.locationTagName ?? null;
      } else {
        request.body.locationTagId = null;
        locationTagName = null;
      }
    }

    const updateData: Record<string, any> = { ...request.body };
    if (locationTagName !== undefined) {
      updateData.locationTagName = locationTagName;
    }
    const updated = await this.repository.update(componentId, orgId, updateData);

    // Broadcast WebSocket update if location tag changed
    if (request.body.locationTagId !== undefined) {
      try {
        const layout = await this.assertLayoutAccess(existing.layoutId, orgId);
        if (layout) {
          const liveMapRepository = new LiveMapRepository();
          const wsService = new LiveMapWebSocketService(liveMapRepository, request.server);
          await wsService.onLocationTagChanged(layout.unitId, orgId, existing.layoutId);
        }
      } catch (err) {
        console.error('Failed to broadcast component update:', err);
      }
    }

    reply.send(updated);
  }

  async remove(
    request: FastifyRequest<{ Params: ComponentParams }>,
    reply: FastifyReply,
  ) {
    const { componentId } = request.params;
    const orgId = request.user.organizationId;
    const existing = await this.repository.findById(componentId, orgId);
    
    const deleted = await this.repository.delete(componentId, orgId);

    if (!deleted) {
      return reply.code(404).send({ error: 'Component not found' });
    }

    // Broadcast WebSocket update for real-time statistics
    if (existing) {
      try {
        const layout = await this.assertLayoutAccess(existing.layoutId, orgId);
        if (layout) {
          const liveMapRepository = new LiveMapRepository();
          const wsService = new LiveMapWebSocketService(liveMapRepository, request.server);
          await wsService.onComponentDeleted(layout.unitId, orgId, existing.layoutId);
        }
      } catch (err) {
        console.error('Failed to broadcast component deletion:', err);
      }
    }

    reply.code(204).send();
  }

  async updateLocationTag(
    request: FastifyRequest<{ Params: ComponentParams; Body: UpdateLocationTagInput }>,
    reply: FastifyReply,
  ) {
    const { componentId } = request.params;
    const orgId = request.user.organizationId;
    const component = await this.repository.findById(componentId, orgId);

    if (!component) {
      return reply.code(404).send({ error: 'Component not found' });
    }

    let resolvedTagName: string | null = null;
    if (request.body.locationTagId) {
      const layout = await this.assertLayoutAccess(component.layoutId, orgId);
      if (!layout) {
        return reply.code(404).send({ error: 'Layout not found for component' });
      }

      const tag = await this.assertLocationTagAccess(request.body.locationTagId, orgId, layout.unitId);
      if (!tag) {
        return reply.code(404).send({ error: 'Location tag not found' });
      }
      resolvedTagName = tag.locationTagName;
    }

    const updated = await this.repository.update(componentId, orgId, {
      locationTagId: request.body.locationTagId ?? null,
      locationTagName: resolvedTagName,
    });

    // Broadcast WebSocket update for location tag change
    try {
      const layout = await this.assertLayoutAccess(component.layoutId, orgId);
      if (layout) {
        const liveMapRepository = new LiveMapRepository();
        const wsService = new LiveMapWebSocketService(liveMapRepository, request.server);
        await wsService.onLocationTagChanged(layout.unitId, orgId, component.layoutId);
      }
    } catch (err) {
      console.error('Failed to broadcast location tag update:', err);
    }

    reply.send(updated);
  }
}
