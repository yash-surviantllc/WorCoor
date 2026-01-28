import { apiService } from "@/src/services/apiService";

export type OrgUnit = {
  id: string;
  organizationId: string;
  unitName: string;
  unitType: string;
  status: "LIVE" | "OFFLINE" | "MAINTENANCE" | "PLANNING";
  description: string | null;
  createdAt: string;
};

export type CreateOrgUnitInput = {
  unitName: string;
  unitType: string;
  status: OrgUnit["status"];
  description?: string | null;
};

export type UpdateOrgUnitInput = Partial<CreateOrgUnitInput>;

export const orgUnitsApi = {
  list: async () => {
    const response = await apiService.get({
      path: "/units",
    });

    const raw = response.data as any;
    const data = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

    return data as OrgUnit[];
  },

  create: async (payload: CreateOrgUnitInput) => {
    const response = await apiService.post({
      path: "/units",
      data: payload,
    });
    return response.data as OrgUnit;
  },

  update: async (unitId: string, payload: UpdateOrgUnitInput) => {
    const response = await apiService.put({
      path: `/units/${unitId}`,
      data: payload,
    });
    return response.data as OrgUnit;
  },

  remove: async (unitId: string) => {
    await apiService.delete({
      path: `/units/${unitId}`,
    });
  },
};
