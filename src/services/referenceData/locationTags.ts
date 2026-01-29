import { apiService } from "@/src/services/apiService";
import { orgUnitsApi } from "@/src/services/referenceData/orgUnits";

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

const fetchTagsByUnit = async (unitId: string) => {
  const response = await apiService.get({
    path: `/units/${unitId}/location-tags`,
  });

  return (response.data as unknown as LocationTag[]) ?? [];
};

export const locationTagsApi = {
  listByUnit: fetchTagsByUnit,

  listAllForOrg: async () => {
    const units = await orgUnitsApi.list();
    if (!units?.length) {
      return [];
    }

    const tagsByUnit = await Promise.all(
      units.map(async (unit) => {
        try {
          return await fetchTagsByUnit(unit.id);
        } catch (error) {
          console.warn(`Failed to load tags for unit ${unit.id}`, error);
          return [];
        }
      }),
    );

    const dedupedMap = new Map<string, LocationTag>();
    tagsByUnit.flat().forEach((tag) => {
      dedupedMap.set(tag.id, tag);
    });

    return Array.from(dedupedMap.values());
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
