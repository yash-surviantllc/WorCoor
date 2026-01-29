import { apiService } from "@/src/services/apiService";

export type Asset = {
  id: string;
  assetName: string;
  assetType: string;
  locationTagId: string | null;
  locationTagName?: string | null;
  unitId?: string | null;
  organizationId?: string;
  createdAt: string;
};

export type ListAssetsParams = {
  search?: string;
  unitId?: string;
  locationTagId?: string;
  limit?: number;
  offset?: number;
};

export type CreateAssetInput = {
  assetName: string;
  assetType: string;
  locationTagId?: string | null;
};

export type UpdateAssetInput = Partial<CreateAssetInput>;

type AssetListResponse = {
  items: Asset[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

export const assetsApi = {
  list: async (params?: ListAssetsParams) => {
    const response = await apiService.get({
      path: "/assets",
      params,
    });

    return response.data as AssetListResponse;
  },

  create: async (payload: CreateAssetInput) => {
    const response = await apiService.post({
      path: "/assets",
      data: payload,
    });

    return response.data as Asset;
  },

  update: async (assetId: string, payload: UpdateAssetInput) => {
    const response = await apiService.put({
      path: `/assets/${assetId}`,
      data: payload,
    });

    return response.data as Asset;
  },

  remove: async (assetId: string) => {
    await apiService.delete({
      path: `/assets/${assetId}`,
    });
  },
};
