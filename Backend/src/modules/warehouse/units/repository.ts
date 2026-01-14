import { and, eq } from 'drizzle-orm';

import { db } from '../../../config/database.js';
import { units } from '../../../database/schema/index.js';

export type UnitEntity = typeof units.$inferSelect;
export type CreateUnitDto = Omit<UnitEntity, 'id' | 'createdAt'>;
export type UpdateUnitDto = Partial<Omit<CreateUnitDto, 'organizationId'>>;

export class UnitsRepository {
  async findAllByOrganization(organizationId: string): Promise<UnitEntity[]> {
    return db.select().from(units).where(eq(units.organizationId, organizationId));
  }

  async findById(id: string, organizationId: string): Promise<UnitEntity | null> {
    const result = await db
      .select()
      .from(units)
      .where(and(eq(units.id, id), eq(units.organizationId, organizationId)))
      .limit(1);

    return result[0] ?? null;
  }

  async create(payload: CreateUnitDto): Promise<UnitEntity> {
    const [created] = await db.insert(units).values(payload).returning();
    return created;
  }

  async update(id: string, organizationId: string, data: UpdateUnitDto): Promise<UnitEntity | null> {
    const [updated] = await db
      .update(units)
      .set(data)
      .where(and(eq(units.id, id), eq(units.organizationId, organizationId)))
      .returning();

    return updated ?? null;
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const deleted = await db
      .delete(units)
      .where(and(eq(units.id, id), eq(units.organizationId, organizationId)))
      .returning({ id: units.id });

    return deleted.length > 0;
  }
}
