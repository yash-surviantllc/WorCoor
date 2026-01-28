import { apiService } from "@/src/services/apiService";

export type LocationTag = {
  id: string;
  unitId: string;
  organizationId: string;
  locationTagName: string;
  capacity: number;
  currentItems: number;
  utilizationPercentage: number;
  createdAt: string;
};

export type CreateLocationTagInput = {
  unitId: string;
  locationTagName: string;
  capacity: number;
};

export type UpdateLocationTagInput = Partial<CreateLocationTagInput>;

export const locationTagsApi = {
  listByUnit: async (unitId: string) => {
    const response = await apiService.get({
      path: `/units/${unitId}/location-tags`,
    });

    return (response.data as unknown as LocationTag[]) ?? [];
  },

  create: async (payload: CreateLocationTagInput) => {
    const response = await apiService.post({
      path: "/location-tags",
      data: payload,
    });

    return response.data as LocationTag;
  },

  update: async (locationTagId: string, payload: UpdateLocationTagInput) => {
    const response = await apiService.put({
      path: `/location-tags/${locationTagId}`,
      data: payload,
    });

    return response.data as LocationTag;
  },
};
