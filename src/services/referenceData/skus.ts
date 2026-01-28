import { apiService } from "@/src/services/apiService";

export type SkuCategory = "raw_material" | "finished_good";
export type SkuUnit = string;

export type Sku = {
  id: string;
  skuName: string;
  skuCategory: SkuCategory;
  skuUnit: SkuUnit;
  quantity: number;
  effectiveDate: string;
  expiryDate: string | null;
  locationTagId: string | null;
  locationTagName: string | null;
  unitId: string | null;
  organizationId: string;
  createdAt: string;
};

export type ListSkusParams = {
  search?: string;
  locationTagId?: string;
  unitId?: string;
  limit?: number;
  offset?: number;
};

export type CreateSkuInput = {
  skuName: string;
  skuCategory: SkuCategory;
  skuUnit: SkuUnit;
  quantity: number;
  effectiveDate: string;
  expiryDate?: string | null;
  locationTagId?: string | null;
};

export type UpdateSkuInput = Partial<CreateSkuInput>;

export type MoveSkuInput = {
  toLocationTagId: string;
};

const normalizeSku = (raw: any): Sku => ({
  id: raw.id,
  skuName: raw.skuName,
  skuCategory: raw.skuCategory,
  skuUnit: raw.skuUnit,
  quantity: Number(raw.quantity ?? 0),
  effectiveDate: raw.effectiveDate,
  expiryDate: raw.expiryDate ?? null,
  locationTagId: raw.locationTagId ?? null,
  locationTagName: raw.locationTagName ?? null,
  unitId: raw.unitId ?? null,
  organizationId: raw.organizationId,
  createdAt: raw.createdAt,
});

export const skusApi = {
  list: async (params: ListSkusParams = {}) => {
    const response = await apiService.get({
      path: "/skus",
      params,
    });

    const data = response.data as { items?: any[]; pagination?: { total: number; limit: number; offset: number } };
    return {
      items: Array.isArray(data.items) ? data.items.map(normalizeSku) : [],
      pagination: data.pagination ?? { total: 0, limit: params.limit ?? 50, offset: params.offset ?? 0 },
    };
  },

  create: async (payload: CreateSkuInput) => {
    const response = await apiService.post({
      path: "/skus",
      data: payload,
    });
    return normalizeSku(response.data);
  },

  update: async (skuId: string, payload: UpdateSkuInput) => {
    const response = await apiService.put({
      path: `/skus/${skuId}`,
      data: payload,
    });
    return normalizeSku(response.data);
  },

  remove: async (skuId: string) => {
    await apiService.delete({
      path: `/skus/${skuId}`,
    });
  },

  move: async (skuId: string, payload: MoveSkuInput) => {
    const response = await apiService.put({
      path: `/skus/${skuId}/move`,
      data: payload,
    });
    return normalizeSku(response.data);
  },
};
