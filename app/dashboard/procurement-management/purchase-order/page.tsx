"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { PoForm } from "@/components/inventory/po-form"
import { ReceiptText, Search, Trash2, Edit } from "lucide-react"
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"

export default function InventoryPoPage() {

  const {isAuthenticated, isAuthLoading} = useAuth()
  const [pos, setPos] = useState<any[]>([])
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isViewDailogOpen, setIsViewDailogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPo, setSelectedPo] = useState<any | null>(null)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "internal" | "external">("all");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [POType, setPOType] = useState<"Internal" | "External">("Internal");
  const [vendors, setVendors] = useState<{ value: string; label: string }[]>([])
  const [units, setUnit] = useState<{ value: string; label: string }[]>([])
  const [skus, setSkus] = useState<any[]>([])
  const [skuUnits, setSkuUnit] = useState<{ value: string; label: string }[]>([]);
  
  const router = useRouter();
  // Scroll Pagination
  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });

  // Auth Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  // Get Org Units
  useEffect(() => {
    fetchDropdownOptions({ apiId: "68565c5df70897486c46852e", setState: setUnit, defaultLabel: "Units" });
  }, []);

  const getUnitNameById = (id: string): string => {
    const unit = units.find(k => k.value === id);
    return unit ? unit.label : "-";
  };

  // Get Vendors
  useEffect(() => {
    fetchDropdownOptions({ apiId: "6881d5e94bcf8d1bd0f5cf12", setState: setVendors, defaultLabel: "Vendors" });
  }, []);

  const getVendorNameById = (id: string): string => {
    const vendor = vendors.find(v => v.value === id);
    return vendor ? vendor.label : "-";
  };

  // Get Skus
  useEffect(() => {
    const fetchSkus = async () => {
      try {
        const response = await apiService.post({
          path: api_url.worCoorService.inventory.sku.skuList,
          data: {
            "page": 0,
            includeFields: ["id", "name", "code", "unitId"]
          },
          isAuth: true
        });
        const repoObj = response.data?.data.list || {};
        setSkus(repoObj);
      } catch (error) {
        setSkus([]);
      }
    };
    fetchSkus();
  }, []);

  const getSkuNameById = (id: string): string => {
    const sku = skus.find(s => s.id === id);
    return sku ? sku.name : "-";
  };

   // Get SKU Units
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565e8ff70897486c46853c",
      setState: setSkuUnit,
      defaultLabel: "SkuUnits",
    });
  }, []);

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
      if (defaultLabel === 'Units') {
        rawData = rawData.filter((item: any) => item?.id !== "000000000000000000000000");
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

  // ############ PO Listing ########## //
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(rawSearchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [rawSearchTerm]);

  useEffect(() => {
    fetchPosList();
  }, [page, searchTerm, selectedTypeFilter]);

  useEffect(() => {
    setPage(0);
    setPos([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, selectedTypeFilter]);
  
  const fetchPosList = async () => {
    try {
      const requestData: any = {
        ...getPaginatedRequestParams(page, pageSize),
        searchText: searchTerm || undefined,
      };
      if (selectedTypeFilter === "internal") {
        requestData.query = { type:  1 }
      } else if (selectedTypeFilter === "external") {
        requestData.query = { type:  2 }
      }
      const response = await apiService.post({
        path: api_url.worCoorService.inventory.po.poList,
        data: requestData,
        isAuth: true,
      });

      const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
      const totalCount = response.data?.data?.total || 0;
      setPos((prev) => {
        const merged = [...prev, ...list];
        const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setHasMore(uniqueById.length < totalCount);
        return uniqueById;
      });
    } catch (error) {
      setHasMore(false);
      notification.error("Failed to load skus list.");
    } finally {
      setIsLoading(false);
    }
  };

  // ############ Add/Update PO ############ //
  const handleSelectAddPO = (value: "Internal" | "External") => {
    setPOType(value);
    setViewMode("form"); // Switch to form view
  };

  const handleCancelPO = () => {
    setSelectedPo(null);
    setViewMode("list");
  };

  const handleAddEditPO = async (data: any) => {
    try {
      const path = selectedPo
        ? `${api_url.worCoorService.inventory.po.updatePo}`
        : api_url.worCoorService.inventory.po.addPo;

      let method: 'post' | 'put' = 'post';
      if (selectedPo) {
        data.id = selectedPo.id;
        method = 'put';
      }

      const response = await apiService[method]({
        path,
        isAuth: true,
        data,
      });

      if (response.data.status === "OK") {
        notification.success(response.data.message);
        setViewMode("list");
        setPage(0);
        setPos([]);
        setHasMore(true);
        setIsLoading(false);
        await fetchPosList();
      } else {
        notification.error(response.data.message);
      }
    } catch (error) {
      notification.error("Something went wrong. Please try again.");
    }
  };

  const handleSkuRowDoubleClick = (po: any) => {
    setSelectedPo(po)
    setIsViewDailogOpen(true)
  }

  // Handle deleting a PO
  const deletePO = (po: any) => {
    setSelectedPo(po)
    setIsDeleteDialogOpen(true)
  }

  const handledeletePO = async () => {
    if (!selectedPo) return
    setIsDeleting(true);
    try {
      const response = await apiService.delete({
        path: `${api_url.worCoorService.inventory.po.deletePo}/${selectedPo.id}`,
        isAuth: true,
      });
      if (response.data?.status === "OK") {
        notification.success(response.data.message);
        setPos(pos.filter((p) => p.id !== selectedPo.id))
        setIsDeleteDialogOpen(false);
        setIsViewDailogOpen(false);
        setSelectedPo(null);
      } else {
        notification.error(response.data?.message);
      }
    } catch (error) {
      notification.error("Something went wrong while deleting the PO.");
    } finally {
      setIsDeleting(false);
    }
  }

  // ############ General Functions  ############ //
  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  };

  const getPOStatusBadge = (status:number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="outline" className="bg-gray-100 text-red-800 border-red-300"> Pending </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"> Arrived </Badge>
        )
      case 3:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"> Received </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isAuthLoading || !isAuthenticated) return null;

  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden">
        <div className="h-full po-order flex flex-col gap-2">

          {/* PO Listing */}
          {viewMode === "list" && (
            <>
              <div className="flex items-center pb-2 sm:pb-4">
                <PageHeader title="Purchase Order" icon={ReceiptText}
                  description="Generate and manage vendor purchase orders to streamline procurement and track project needs."
                />
                <div className="ml-auto">
                  <Menubar className="border-none h-auto space-x-0">
                  <MenubarMenu>
                    <MenubarTrigger  className="h-10 border border-primary bg-darkblue text-white hover:bg-darkblue/90 active:bg-darkblue/90 focus:text-white focus:bg-darkblue/90  data-[state=open]:bg-darkblue/90 data-[state=open]:text-white rounded-lg" >Add PO</MenubarTrigger>
                    <MenubarContent className="shadow-soft">
                      {["Internal", "External"].map((value) => (
                        <MenubarItem
                          key={value}
                          onSelect={() => handleSelectAddPO(value as "Internal" | "External")}
                          className="flex items-center  !hover:bg-blue-200 focus:bg-blue-100"
                        >
                          <span className="capitalize pr-4">{value}</span>
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
                </div>
              </div>

              {/* PO list */}
              <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200  backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
                <div className="space-y-4">
                  {/* Search and Filter Form */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full md:w-auto flex items-center gap-2">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                        <Input
                          type="search"
                          placeholder="Search Purchase Order..."
                          value={rawSearchTerm}
                          onChange={(e) => setRawSearchTerm(e.target.value)}
                          className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap align-middle gap-2 ml-auto md:flex-none">
                      {/* Type Wise Filter  */}
                      <div className="relative w-[160px]">
                        <Select value={selectedTypeFilter} onValueChange={(value) => setSelectedTypeFilter(value as any)}>
                          <SelectTrigger className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                            <SelectValue placeholder="Filter by PO Type" />
                          </SelectTrigger>
                          <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                            <SelectItem  className="py-2.5" value="all">All</SelectItem>
                            <SelectItem  className="py-2.5" value="internal">Internal</SelectItem>
                            <SelectItem  className="py-2.5" value="external">External</SelectItem>
                          </SelectContent>
                        </Select>
                        <label htmlFor="Category"
                          className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                            transition-all duration-200 bg-background px-1
                            peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                            ${selectedTypeFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                          `}
                        >
                          PO Type
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* SKU Listing */}
                  <div ref={scrollContainerRef}
                    className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto"
                  >
                    <Table>
                      <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                        <TableRow>
                          <TableHead className="w-[80px] text-black font-semibold whitespace-nowrap">PO Type</TableHead>
                          <TableHead className="w-[120px] text-black font-semibold whitespace-nowrap">PO Number</TableHead>
                          <TableHead className="w-[170px] text-black font-semibold whitespace-nowrap">From</TableHead>
                          <TableHead className="w-[170px] text-black font-semibold whitespace-nowrap">To</TableHead>
                          <TableHead className="w-[80px] text-black font-semibold whitespace-nowrap">PO Date</TableHead>
                          <TableHead className="w-[80px] text-black font-semibold whitespace-nowrap">SKU Items</TableHead>
                          <TableHead className="w-[80px] text-black font-semibold whitespace-nowrap">PO Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pos.length > 0 ? (
                          pos.map((p) => (
                            <TableRow
                              key={p.id}
                              onDoubleClick={() => handleSkuRowDoubleClick(p)}
                              className="bg-muted/30 cursor-pointer"
                            >
                              <TableCell className="p-4 md:p-6">{p.type == 1 ? "Internal":"External"}</TableCell>
                              <TableCell className="p-4 md:p-6">{p.poNumber}</TableCell>
                              <TableCell className="p-4 md:p-6">
                                {p.type === 1 && (
                                  getUnitNameById(p.from)
                                )}
                                {p.type === 2 && (
                                  getVendorNameById(p.from)
                                )}
                              </TableCell>
                              <TableCell className="p-4 md:p-6">{getUnitNameById(p.to)}</TableCell>
                              <TableCell>{p.date ? formatDateOnly(p.date) : '-'}</TableCell>
                              <TableCell className="p-4 md:p-6">{p.items.length}</TableCell>
                              <TableCell className="p-4 md:p-6">{getPOStatusBadge(p.status)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No purchase order found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PO Add/Update */}
          {viewMode === "form" && (
            <PoForm
              initialData={
                selectedPo
                  ? {
                      ...selectedPo,
                      poDate: selectedPo.date?.slice(0, 10),
                      skuItems: selectedPo.items?.map((item: any) => ({
                        skuId: item.skuId,
                        description: item.description,
                        date: item.date?.slice(0, 10),
                        qty: item.qty,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                      }))
                    }
                  : undefined
              }
              onSubmit={handleAddEditPO}
              onCancel={() => handleCancelPO()}
              vendors={vendors}
              units={units}
              skus={skus}
              skuUnits={skuUnits}
              POType={POType}
              formMode={selectedPo ? 'edit' : 'add'}
            />
          )}

          {/* PO Details Dialog */}
          <Dialog open={isViewDailogOpen}
            onOpenChange={(open) => {
              setIsViewDailogOpen(open);
              if (!open) {
                setSelectedPo(null);
              }
            }}
          >
            <DialogContent
              onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewDailogOpen(false)}
              className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
              <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
                <DialogTitle>Purchase Orders Details</DialogTitle>
                <DialogDescription>View Purchase Orders information and SKU Items</DialogDescription>
              </DialogHeader>

              {selectedPo && (
                <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 mb-2 z-0">
                  {/* PO Information */}
                  <div className="bg-darkblue-foreground/10 rounded-lg  p-6  dark:bg-slate-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">PO Type</Label>
                        <p className="text-sm">{selectedPo.type == 1 ? "Internal":"External"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">PO Number</Label>
                        <p className="text-sm">{selectedPo.poNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">From</Label>
                        <p className="text-sm">
                          {selectedPo.type === 1 ? getUnitNameById(selectedPo.from) : getVendorNameById(selectedPo.from)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">To</Label>
                        <p className="text-sm">{getUnitNameById(selectedPo.to)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">PO Date</Label>
                        <p className="text-sm">{selectedPo.date ? formatDateOnly(selectedPo.date) : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">PO Status</Label>
                        <div className="text-sm">{getPOStatusBadge(selectedPo.status)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks */}
                  {selectedPo.items && selectedPo.items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">SKU Items</h3>
                      <div className="mt-4 rounded-md relative w-full overflow-auto">
                        <Table className="min-w-[900px] dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]x:w-[4px] overflow-auto">
                          <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                            <TableRow>
                              <TableHead className="min-w-[50px]">#</TableHead>
                              <TableHead className="min-w-[150px]">SKU Name</TableHead>
                              <TableHead className="min-w-[150px]">SKU Code</TableHead>
                              <TableHead className="min-w-[150px]">Quantity</TableHead>
                              <TableHead className="min-w-[150px]">Unit Price</TableHead>
                              <TableHead className="min-w-[150px]">Total Price</TableHead>
                              <TableHead className="min-w-[150px]">Manufacturing Date</TableHead>
                              <TableHead className="min-w-[150px]">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPo.items.map((item: any, index: number) => (
                              <TableRow key={item.skuId} className={index % 2 === 0 ? "bg-muted/50" : "bg-background"}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item?.skuId ? getSkuNameById(item?.skuId) : "-"}</TableCell>
                                <TableCell>{item?.skuId ? item?.skuCode : "-"}</TableCell>
                                <TableCell>{item.qty ? item.qty : "0"}</TableCell>
                                <TableCell>{item.unitPrice ? item.unitPrice : "0"}</TableCell>
                                <TableCell>{item.totalPrice ? item.totalPrice : "0"}</TableCell>
                                <TableCell>{item.date ? formatDateOnly(item.date) : "-"}</TableCell>
                                <TableCell> {item.description ? item.description : "-"} </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPo?.status === 1 && (
                <DialogFooter  className="px-2 md:px-6 py-4 gap-2">
                  <Button variant="default"
                    onClick={() => {
                      setPOType(selectedPo.type === 1 ? "Internal" : "External");
                      setViewMode("form");
                      setIsViewDailogOpen(false);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deletePO(selectedPo)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete PO modal */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteDialogOpen(false)}
              className="dark:bg-modal max-w-full sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Purchase Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this purchase order? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedPo && (
                <div className="pb-4 pt-2">
                  <p className="text-sm/10 leading-[1.4] mb-3">
                    You are about to delete: <strong>{selectedPo.poNumber} (PO Number)</strong>
                  </p>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handledeletePO} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </div>
  );
}