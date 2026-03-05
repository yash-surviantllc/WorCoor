import { and, eq, ilike, inArray, sql } from 'drizzle-orm';

import { db } from '../../../config/database.js';
import {
  units,
  layouts,
  components,
  locationTags,
  skus,
} from '../../../database/schema/index.js';

export class LiveMapRepository {
  async getUnitWithLayouts(unitId: string, organizationId: string) {
    const unit = await db
      .select()
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.organizationId, organizationId)))
      .limit(1);

    if (!unit[0]) return null;

    const unitLayouts = await db
      .select()
      .from(layouts)
      .where(and(eq(layouts.unitId, unitId), eq(layouts.organizationId, organizationId)));

    return { unit: unit[0], layouts: unitLayouts };
  }

  async getLayoutComponents(layoutId: string, organizationId: string) {
    return db
      .select({
        id: components.id,
        componentType: components.componentType,
        displayName: components.displayName,
        positionX: components.positionX,
        positionY: components.positionY,
        width: components.width,
        height: components.height,
        color: components.color,
        locationTagId: components.locationTagId,
        locationTagName: locationTags.locationTagName,
        capacity: locationTags.capacity,
      })
      .from(components)
      .leftJoin(locationTags, eq(components.locationTagId, locationTags.id))
      .where(and(eq(components.layoutId, layoutId), eq(components.organizationId, organizationId)));
  }

  async getLocationTagSkus(locationTagId: string, organizationId: string) {
    return db
      .select({
        id: skus.id,
        skuName: skus.skuName,
        quantity: skus.quantity,
        skuUnit: skus.skuUnit,
      })
      .from(skus)
      .where(and(eq(skus.locationTagId, locationTagId), eq(skus.organizationId, organizationId)));
  }

  async getSkusForLocationTags(locationTagIds: string[], organizationId: string) {
    if (locationTagIds.length === 0) {
      return [];
    }

    return db
      .select({
        id: skus.id,
        skuName: skus.skuName,
        quantity: skus.quantity,
        skuUnit: skus.skuUnit,
        locationTagId: skus.locationTagId,
        effectiveDate: skus.effectiveDate,
        expiryDate: skus.expiryDate,
      })
      .from(skus)
      .where(
        and(eq(skus.organizationId, organizationId), inArray(skus.locationTagId, locationTagIds)),
      );
  }

  async calculateUtilization(unitId: string, organizationId: string) {
    const result = await db
      .select({
        totalCapacity: sql<number>`COALESCE(SUM(${locationTags.capacity}), 0)`,
        totalItems: sql<number>`COALESCE(SUM(${skus.quantity}), 0)`,
      })
      .from(components)
      .innerJoin(locationTags, eq(components.locationTagId, locationTags.id))
      .leftJoin(skus, eq(skus.locationTagId, locationTags.id))
      .innerJoin(layouts, eq(components.layoutId, layouts.id))
      .where(and(eq(layouts.unitId, unitId), eq(components.organizationId, organizationId)));

    const { totalCapacity, totalItems } = result[0] || { totalCapacity: 0, totalItems: 0 };
    const utilization = totalCapacity > 0 ? (totalItems / totalCapacity) * 100 : 0;

    return { totalCapacity, totalItems, utilizationPercentage: Math.round(utilization * 10) / 10 };
  }

  async search(unitId: string, organizationId: string, query: string) {
    const searchPattern = `%${query}%`;

    // Search locations
    const locationResults = await db
      .select({
        type: sql<string>`'location'`,
        id: locationTags.id,
        name: locationTags.locationTagName,
        componentId: components.id,
      })
      .from(locationTags)
      .innerJoin(components, eq(components.locationTagId, locationTags.id))
      .innerJoin(layouts, eq(components.layoutId, layouts.id))
      .where(
        and(
          eq(layouts.unitId, unitId),
          eq(locationTags.organizationId, organizationId),
          ilike(locationTags.locationTagName, searchPattern),
        ),
      );

    // Search SKUs
    const skuResults = await db
      .select({
        type: sql<string>`'sku'`,
        id: skus.id,
        name: skus.skuName,
        locationTagId: skus.locationTagId,
      })
      .from(skus)
      .innerJoin(locationTags, eq(skus.locationTagId, locationTags.id))
      .innerJoin(components, eq(components.locationTagId, locationTags.id))
      .innerJoin(layouts, eq(components.layoutId, layouts.id))
      .where(
        and(
          eq(layouts.unitId, unitId),
          eq(skus.organizationId, organizationId),
          ilike(skus.skuName, searchPattern),
        ),
      );

    return [...locationResults, ...skuResults];
  }

  /**
   * Get sibling location tags for multi-level vertical racks
   * Given a rack prefix like "LOC020", returns all location tags like LOC020-L1, LOC020-L2, etc.
   */
  async getSiblingLocationTags(
    rackPrefix: string,
    unitId: string,
    organizationId: string
  ): Promise<LocationTagWithSkus[]> {
    // Query all location tags matching the rack pattern
    const siblingTags = await db
      .select({
        id: locationTags.id,
        tagName: locationTags.locationTagName,
        capacity: locationTags.capacity,
        unitId: locationTags.unitId,
      })
      .from(locationTags)
      .where(
        and(
          eq(locationTags.organizationId, organizationId),
          eq(locationTags.unitId, unitId),
          ilike(locationTags.locationTagName, sql`${rackPrefix + '-L%'}`),
        ),
      )
      .orderBy(locationTags.locationTagName);

    if (siblingTags.length === 0) {
      return [];
    }

    // Get SKUs for all sibling tags
    const tagIds = siblingTags.map(tag => tag.id);
    const skusForTags = await this.getSkusForLocationTags(tagIds, organizationId);
    
    // Group SKUs by location tag
    const skuMap = skusForTags.reduce<Record<string, typeof skusForTags>>((acc, sku) => {
      if (!acc[sku.locationTagId ?? '']) acc[sku.locationTagId ?? ''] = [];
      acc[sku.locationTagId ?? ''].push(sku);
      return acc;
    }, {});

    // Build the response with level numbers and SKUs
    return siblingTags.map(tag => {
      const tagSkus = skuMap[tag.id] || [];
      const currentItems = tagSkus.reduce((sum, sku) => sum + Number(sku.quantity || 0), 0);
      const capacity = Number(tag.capacity) || 0;
      const utilizationPercentage = capacity > 0 ? Math.round((currentItems / capacity) * 100 * 10) / 10 : 0;
      
      // Extract level number from tag name (e.g., LOC020-L2 -> 2)
      const levelMatch = tag.tagName.match(/-L([0-9]+)$/);
      const levelNumber = levelMatch ? parseInt(levelMatch[1], 10) : 1;

      return {
        id: tag.id,
        tagName: tag.tagName,
        levelNumber,
        capacity,
        currentItems,
        utilizationPercentage,
        skus: tagSkus.map(sku => ({
          id: sku.id,
          skuName: sku.skuName,
          quantity: Number(sku.quantity || 0),
          skuUnit: sku.skuUnit,
          effectiveDate: sku.effectiveDate ? new Date(sku.effectiveDate).toISOString() : new Date().toISOString(),
          expiryDate: sku.expiryDate ? new Date(sku.expiryDate).toISOString() : null,
        })),
      };
    });
  }
}

// Type definition for the response
export type LocationTagWithSkus = {
  id: string;
  tagName: string;
  levelNumber: number;
  capacity: number;
  currentItems: number;
  utilizationPercentage: number;
  skus: Array<{
    id: string;
    skuName: string;
    quantity: number;
    skuUnit: string;
    effectiveDate: string;
    expiryDate: string | null;
  }>;
};
