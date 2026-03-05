import { and, eq, ilike, sql, inArray } from 'drizzle-orm';

import { db } from '../../../config/database.js';
import { components, locationTags, skus } from '../../../database/schema/index.js';

export type ComponentEntity = typeof components.$inferSelect;
export type CreateComponentDto = Omit<ComponentEntity, 'id' | 'createdAt'>;
export type UpdateComponentDto = Partial<Omit<CreateComponentDto, 'layoutId' | 'organizationId'>>;

export class ComponentsRepository {
  async findAllByLayout(layoutId: string, organizationId: string): Promise<ComponentEntity[]> {
    return db
      .select()
      .from(components)
      .where(and(eq(components.layoutId, layoutId), eq(components.organizationId, organizationId)));
  }

  async findById(id: string, organizationId: string): Promise<ComponentEntity | null> {
    const result = await db
      .select()
      .from(components)
      .where(and(eq(components.id, id), eq(components.organizationId, organizationId)))
      .limit(1);

    return result[0] ?? null;
  }

  async create(payload: CreateComponentDto): Promise<ComponentEntity> {
    const [created] = await db.insert(components).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    organizationId: string,
    data: UpdateComponentDto,
  ): Promise<ComponentEntity | null> {
    const [updated] = await db
      .update(components)
      .set(data)
      .where(and(eq(components.id, id), eq(components.organizationId, organizationId)))
      .returning();

    return updated ?? null;
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const deleted = await db
      .delete(components)
      .where(and(eq(components.id, id), eq(components.organizationId, organizationId)))
      .returning({ id: components.id });

    return deleted.length > 0;
  }

  /**
   * Get SKUs for multiple location tags
   */
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

  /**
   * Get location tags by their names
   * Takes an array of tag name strings and returns LocationTagWithSkus[]
   */
  async getLocationTagsByNames(
    locationTagNames: string[],
    organizationId: string
  ): Promise<LocationTagWithSkus[]> {
    if (locationTagNames.length === 0) {
      return [];
    }

    // Query location tags by names
    const tags = await db
      .select({
        id: locationTags.id,
        tagName: locationTags.locationTagName,
        capacity: locationTags.capacity,
      })
      .from(locationTags)
      .where(
        and(
          eq(locationTags.organizationId, organizationId),
          inArray(locationTags.locationTagName, locationTagNames),
        ),
      )
      .orderBy(locationTags.locationTagName);

    if (tags.length === 0) {
      return [];
    }

    // Get SKUs for all tags
    const tagIds = tags.map(tag => tag.id);
    const skusForTags = await this.getSkusForLocationTags(tagIds, organizationId);
    
    // Group SKUs by location tag
    const skuMap = skusForTags.reduce<Record<string, typeof skusForTags>>((acc, sku) => {
      if (!acc[sku.locationTagId ?? '']) acc[sku.locationTagId ?? ''] = [];
      acc[sku.locationTagId ?? ''].push(sku);
      return acc;
    }, {});

    // Build the response with SKUs
    return tags.map(tag => {
      const tagSkus = skuMap[tag.id] || [];
      const currentItems = tagSkus.reduce((sum, sku) => sum + Number(sku.quantity || 0), 0);
      const capacity = Number(tag.capacity) || 0;
      const utilizationPercentage = capacity > 0 ? Math.round((currentItems / capacity) * 100 * 10) / 10 : 0;

      return {
        id: tag.id,
        tagName: tag.tagName,
        levelNumber: 1, // Default level, caller will set proper levelNumber
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
