import type { FastifyReply, FastifyRequest } from 'fastify';

import { LiveMapRepository, type LocationTagWithSkus } from './repository.js';

export class LiveMapService {
  constructor(private readonly repository: LiveMapRepository) {}

  async getLiveMap(
    request: FastifyRequest<{ Params: { unitId: string } }>,
    reply: FastifyReply,
  ) {
    const { unitId } = request.params;
    const organizationId = request.user.organizationId;

    const data = await this.repository.getUnitWithLayouts(unitId, organizationId);
    if (!data) {
      return reply.code(404).send({ error: 'Unit not found' });
    }

    const utilization = await this.repository.calculateUtilization(unitId, organizationId);

    const layoutComponents = await Promise.all(
      data.layouts.map((layout) => this.repository.getLayoutComponents(layout.id, organizationId)),
    );
    const locationTagIds = layoutComponents
      .flat()
      .map((component) => component.locationTagId)
      .filter((id): id is string => Boolean(id));

    const skusByLocationTag = await this.repository.getSkusForLocationTags(locationTagIds, organizationId);
    const skuMap = skusByLocationTag.reduce<Record<string, typeof skusByLocationTag>>((acc, sku) => {
      if (!acc[sku.locationTagId ?? '']) acc[sku.locationTagId ?? ''] = [];
      acc[sku.locationTagId ?? ''].push(sku);
      return acc;
    }, {});

    const layoutsWithComponents = await Promise.all(
      data.layouts.map(async (layout, index) => {
        const componentsData = layoutComponents[index];

        const componentsWithSkus = await Promise.all(
          componentsData.map(async (component) => {
            // Check if this is a multi-level vertical rack
            const isVerticalRack = component.componentType === 'vertical_sku_holder';
            const isMultiLevel = isVerticalRack && component.locationTagName?.match(/-L[0-9]+$/);
            
            let locationTags: LocationTagWithSkus[] = [];
            let overallUtilization = 0;

            if (isMultiLevel) {
              // Extract rack prefix from locationTagName (e.g., "LOC020-L1" -> "LOC020")
              const rackPrefix = component.locationTagName?.replace(/-L[0-9]+$/, '') || '';
              
              // Get all sibling location tags for this rack
              locationTags = await this.repository.getSiblingLocationTags(rackPrefix, unitId, organizationId);
              
              // Calculate aggregate utilization across all levels
              const totalCapacity = locationTags.reduce((sum, lt) => sum + lt.capacity, 0);
              const totalItems = locationTags.reduce((sum, lt) => sum + lt.currentItems, 0);
              overallUtilization = totalCapacity > 0 ? Math.round((totalItems / totalCapacity) * 1000) / 10 : 0;
            } else {
              // Single level component - wrap existing behavior in array
              if (component.locationTagId) {
                const skusData = skuMap[component.locationTagId] ?? [];
                const currentItems = skusData.reduce((sum, sku) => sum + Number(sku.quantity || 0), 0);
                const capacity = component.capacity || 0;
                const locationUtilization = capacity > 0 ? Math.round((currentItems / capacity) * 100 * 10) / 10 : 0;
                
                locationTags = [{
                  id: component.locationTagId,
                  tagName: component.locationTagName || '',
                  levelNumber: 1,
                  capacity,
                  currentItems,
                  utilizationPercentage: locationUtilization,
                  skus: skusData.map(sku => ({
                    id: sku.id,
                    skuName: sku.skuName,
                    quantity: Number(sku.quantity || 0),
                    skuUnit: sku.skuUnit,
                    effectiveDate: sku.effectiveDate ? new Date(sku.effectiveDate).toISOString() : new Date().toISOString(),
                    expiryDate: sku.expiryDate ? new Date(sku.expiryDate).toISOString() : null,
                  })),
                }];
                
                overallUtilization = locationUtilization;
              }
            }

            return {
              id: component.id,
              componentType: component.componentType,
              displayName: component.displayName,
              positionX: component.positionX,
              positionY: component.positionY,
              width: component.width,
              height: component.height,
              color: component.color,
              locationTags, // Always an array now
              overallUtilization,
              isMultiLevel: locationTags.length > 1,
            };
          })
        );

        return {
          id: layout.id,
          layoutName: layout.layoutName,
          components: componentsWithSkus,
        };
      })
    );

    reply.send({
      unit: {
        id: data.unit.id,
        unitName: data.unit.unitName,
        status: data.unit.status,
        utilizationPercentage: utilization.utilizationPercentage,
      },
      layouts: layoutsWithComponents,
    });
  }

  async search(
    request: FastifyRequest<{ Params: { unitId: string }; Querystring: { q: string } }>,
    reply: FastifyReply,
  ) {
    const { unitId } = request.params;
    const { q: query } = request.query;

    if (!query || query.length < 2) {
      return reply.code(400).send({ error: 'Search query must be at least 2 characters' });
    }

    const results = await this.repository.search(unitId, request.user.organizationId, query);
    reply.send({ results });
  }
}