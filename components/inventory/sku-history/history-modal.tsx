"use client"

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { notification } from "@/src/services/notificationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HistoryModal({ skuId, type }: { skuId: string; type: string }) {
    const [rawList, setRawList] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [page, setPage] = useState<number | null>(null);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [vendors, setVendors] = useState<{ value: string; label: string }[]>([]);
    const [units, setUnit] = useState<{ value: string; label: string }[]>([]);
    const [locationTags, setLocationTags] = useState<{ value: string; label: string }[]>([]);
    const hasFetchedDropdowns = useRef(false);

    // Get Org Units
    useEffect(() => {
        if (hasFetchedDropdowns.current) return;
        hasFetchedDropdowns.current = true;
        if (type == "procurement") {
            fetchDropdownOptions({ apiId: "68565c5df70897486c46852e", setState: setUnit, defaultLabel: "Units" });
            fetchDropdownOptions({ apiId: "6881d5e94bcf8d1bd0f5cf12", setState: setVendors, defaultLabel: "Vendors" });
        }
    }, []);

    const getUnitNameById = (id: string): string => {
      const unit = units.find(k => k.value === id);
      return unit ? unit.label : "-";
    };

    const getVendorNameById = (id: string): string => {
      const vendor = vendors.find(v => v.value === id);
      return vendor ? vendor.label : "-";
    };

    // Location Tag
    useEffect(() => {
      fetchDropdownOptions({ apiId: "68565e75f70897486c46853b", setState: setLocationTags, defaultLabel: "LocationTag" });
    }, []);

    const getLocationTagNameById = (id: string): string => {
      const location = locationTags.find(l => l.value === id);
      return location ? location.label : "-";
    };

    // Comman Dropdown Filter Api
    const fetchDropdownOptions = async ({
        apiId,
        setState,
        defaultLabel,
    }: {
        apiId: string;
        setState: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
        defaultLabel: string;
    }) => {
        try {
            const response = await apiService.get({
                path: `${api_url.worCoorService.referenceDataTable.listTableEntry}/${apiId}`,
                isAuth: true,
            });
            let rawData = response.data?.data || [];
            if (defaultLabel == 'Vendors') {
                rawData = rawData.filter(
                    (item: any) => item?.detail?.type === 1 || item?.detail?.type === 3
                );
            }
            const formattedData = rawData.map((item: any) => ({
                value: item.id,
                label: item.detail?.name || "",
            }));
            setState([...formattedData]);
        } catch (error) {
            notification.error(`Failed to load ${defaultLabel}.`);
        }
    };

  // Set initial page
  useEffect(() => {
    setPage(0);
    setRawList([]);
    setHistory([]);
    setHasMore(true);
  }, [type]);

  useEffect(() => {
    if (page === null) return;
    fetchHistoryList(page);
  }, [page]);

  useEffect(() => {
    if (type !== "procurement") return;
    const flat = rawList.flatMap((po) =>
      po.items
        ?.filter((item: any) => item.skuId === skuId)
        .map((item: any) => ({
          ...po,
          menufecture_date: item.date,
          receivedQty: item.receivedQty ?? null,
          items: undefined,
        }))
    );
    setHistory(flat);
  }, [rawList, skuId, type]);

  const fetchHistoryList = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const requestData: any = {
        ...getPaginatedRequestParams(pageNumber, pageSize),
      };

      let path = "";

      switch (type) {
        case "procurement":
            path = api_url.worCoorService.inventory.po.poList;
            requestData.refFilter = { 'items.skuId': skuId };
            break;
        case "blocked":
            path = api_url.worCoorService.inventory.procurement.procurementList;
            requestData.query = { type: 4 };
            requestData.refFilter = { 'skuId': skuId };
            break;
        case "wastage":
            path = api_url.worCoorService.inventory.procurement.procurementList;
            requestData.query = { type: 3 };
            requestData.refFilter = { 'skuId': skuId };
            break;
        case "dispatched":
            path = api_url.worCoorService.inventory.procurement.procurementList;
            requestData.query = { type: 6 };
            requestData.refFilter = { 'skuId': skuId };
            break;
        case "location":
            path = api_url.worCoorService.inventory.list;
            requestData.refFilter = { 'skuId': skuId };
            break;
      }

      const res = await apiService.post({
        path,
        data: requestData,
        isAuth: true,
      });

      const list = Array.isArray(res.data?.data?.list) ? res.data.data.list : [];
      const totalCount = res.data?.data?.total || 0;

      setRawList((prev) => {
        const merged = [...prev, ...list];
        const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setHasMore(unique.length < totalCount);
        return unique;
      });
    } catch (error) {
      setHasMore(false);
      notification.error("Failed to load history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => (prev !== null ? prev + 1 : 0));
    }
  };

  const getPOStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="outline" className="bg-gray-100 text-red-800 border-red-300">Pending</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Arrived</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Received</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const displayList = type === "procurement" ? history : rawList;

  return (
    <div className="skus flex flex-col gap-2">
      <div className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto">
        <Table className="responsive-table">
          <TableHeader>
            <TableRow>
                {type === "procurement" && (
                    <>
                        <TableHead className="min-w-[100px]">PO Type</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>PO Date</TableHead>
                        <TableHead>Received Qty.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="min-w-[50px]">Status</TableHead>
                    </>
                )}
                {type === "blocked" && (
                     <>
                        <TableHead className="min-w-[150px]">SO Number </TableHead>
                        <TableHead>Blocked QTY</TableHead>
                        <TableHead>Blocked Date</TableHead>
                    </>
                )}
                {type === "wastage" && (
                     <>
                        <TableHead className="min-w-[150px]">Wastage Location </TableHead>
                        <TableHead>Wastage Reason</TableHead>
                        <TableHead>Wastage Quantity</TableHead>
                        <TableHead>Wastage logged by</TableHead>
                        <TableHead>Wastage logged date</TableHead>
                    </>
                )}
                {type === "dispatched" && (
                     <>
                        <TableHead className="min-w-[150px]">SO Number </TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Dispatched Quantity</TableHead>
                        <TableHead>Dispatched Date</TableHead>
                    </>
                )}
                {type === "location" && (
                     <>
                        <TableHead className="min-w-[150px]">Location Tag </TableHead>
                        <TableHead>Block Qty.</TableHead>
                        <TableHead>Available Qty.</TableHead>
                        <TableHead>Total Qty.</TableHead>
                        <TableHead>Menufechar Date</TableHead>
                    </>
                )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayList.length > 0 ? (
                displayList.map((h, index) => {
                    if (type === "procurement") {
                        return (
                            <TableRow key={`${h.id}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                                <TableCell>{h.type === 1 ? "Internal" : "External"}</TableCell>
                                <TableCell>{h.poNumber}</TableCell>
                                <TableCell>{h.type === 1 ? getUnitNameById(h.from) : getVendorNameById(h.from)}</TableCell>
                                <TableCell>{getUnitNameById(h.to)}</TableCell>
                                <TableCell>{h.date ? new Date(h.date).toLocaleDateString() : "-"}</TableCell>
                                <TableCell>{h.receivedQty ?? 0}</TableCell>
                                <TableCell>{h.menufecture_date ? new Date(h.menufecture_date).toLocaleDateString() : "-"}</TableCell>
                                <TableCell>{getPOStatusBadge(h.status)}</TableCell>
                            </TableRow>
                        );
                    }
                    if (type === "blocked") {
                        return (
                            <TableRow key={`${h.id}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                                <TableCell>{h.soNumber ? h.soNumber : "-"}</TableCell>
                                <TableCell>{h.quantity ? h.quantity : "0"}</TableCell>
                                <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "-"}</TableCell>
                            </TableRow>
                        );
                    }
                    if (type === "wastage") {
                        return (
                            <TableRow key={`${h.id}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        );
                    }
                    if (type === "dispatched") {
                        return (
                            <TableRow key={`${h.id}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                                <TableCell>{h.soNumber ? h.soNumber : "-"}</TableCell>
                                <TableCell>{h.createdByName ? h.createdByName : "-"}</TableCell>
                                <TableCell>{h.quantity ? h.quantity : "0"}</TableCell>
                                <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "-"}</TableCell>
                            </TableRow>
                        );
                    }
                    if (type === "location") {
                        return (
                            <TableRow key={`${h.id}-${index}`} className="border-b transition-colors hover:bg-muted/50">
                                <TableCell>{getLocationTagNameById(h.locationId)}</TableCell>
                                <TableCell>{h.blockedQty ?? 0}</TableCell>
                                <TableCell>{h.totalQty ?? 0}</TableCell>
                                <TableCell>{(h.totalQty ?? 0) + (h.blockedQty ?? 0)}</TableCell>
                                <TableCell>{h.date ? new Date(h.date).toLocaleDateString() : "-"}</TableCell>
                            </TableRow>
                        );
                    }
                    return null;
                })
                ) : (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No {type.charAt(0).toUpperCase() + type.slice(1)} history found.
                        </TableCell>
                    </TableRow>
                )}
          </TableBody>
        </Table>
      </div>
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button onClick={handleViewMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "View More"}
          </Button>
        </div>
      )}
    </div>
  );
}
