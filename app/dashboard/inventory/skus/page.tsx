"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash2, FileText, BarChart3, CheckCircle, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { SkuForm } from "@/components/inventory/sku-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { HistoryModal } from "@/components/inventory/sku-history/history-modal";


// Sample data - replace with actual data import
const skusData = [
  {
    id: "SKU-001",
    parentResource: "Pallets",
    name: "Oak Wood Panel",
    brand: "Premium Woods Co.",
    procuredDate: "2024-01-15",
    location: "U1-W1-Z2-R3",
    skuCode: "OWP-001",
    availableQuantity: 150,
    skuUnit: "pieces",
    unit: "pcs",
    department: "Materials",
    wastageQuantity: "5",
    description: "High-quality oak wood panel for furniture",
    minQuantity: 20,
    type: "Primary",
    category: "Wood",
    unitCost: 45.50,
    currency: "USD",
    unitWeight: 2.5,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "A",
    qualityCheckDone: true,
    qualityCheckDate: "2024-01-16",
    qualityCheckNotes: "Excellent quality, no defects",
    taggedForProduction: 30,
    wastage: 5,
    totalProcured: 180,
  },
  {
    id: "SKU-002",
    parentResource: "Packaging Material",
    name: "Steel Brackets",
    brand: "MetalWorks Inc.",
    procuredDate: "2024-01-20",
    location: "Packaging Store 1",
    skuCode: "SB-002",
    availableQuantity: 200,
    skuUnit: "pieces",
    unit: "pcs",
    department: "Hardware",
    wastageQuantity: "3",
    description: "Galvanized steel brackets for support",
    minQuantity: 50,
    type: "Secondary",
    category: "Metal",
    unitCost: 12.75,
    currency: "USD",
    unitWeight: 0.8,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "B",
    qualityCheckDone: false,
    qualityCheckDate: "",
    qualityCheckNotes: "",
    taggedForProduction: 20,
    wastage: 3,
    totalProcured: 225,
  },
]
// Quality Check Form Schema
const qualityCheckSchema = z.object({
  qualityRating: z.string().min(1, "Please select a quality rating"),
  qualityCheckDone: z.boolean(),
  qualityCheckNotes: z.string().optional(),
})

type QualityCheckFormValues = z.infer<typeof qualityCheckSchema>

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  skuId: string;
}

export default function SkuManagementPage() {
  const [skus, setSkus] = useState<any[]>(skusData)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSku, setselectedSku] = useState<any | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDailogOpen, setIsViewDailogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isHisotryDialogOpen, setIsHisotryDialogOpen] = useState(false)
  const [selectedHistoryType, setSelectedHistoryType] = useState<any | null>(null)
  const [skuId, setSkuId] = useState("");
  const [isTotalDialogOpen, setIsTotalDialogOpen] = useState(false)
  const [isQualityCheckDialogOpen, setIsQualityCheckDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [units, setSkuUnit] = useState<{ value: string; label: string }[]>([]);
  const [types, setSkuType] = useState<{ value: string; label: string }[]>([]);
  const [categories, setSkuCategories] = useState<{ value: string; label: string }[]>([]);
  const [parentResources, setParentResources] = useState<{ value: string; label: string }[]>([]);
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typesFilter, setTypesFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filtersReady, setFiltersReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ visible: false, x: 0, y: 0, skuId: "" })
  
  const router = useRouter();
  const rightClickBtnClass = "w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-md transition-all duration-200 flex items-center gap-3 group";

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

  // Get SKU Units
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565e8ff70897486c46853c",
      setState: setSkuUnit,
      defaultLabel: "Units",
    });
  }, []);

  const getSkuUnitById = (id: string): string => {
    const unit = units.find(u => u.value === id);
    return unit ? unit.label : "-";
  };

  // Get SKU Type
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565e5ff70897486c46853a",
      setState: setSkuType,
      defaultLabel: "Types",
    });
  }, []);

  useEffect(() => {
    if (types.length > 0 && !typesFilter) {
      setTypesFilter(types[0].value);
    }
  }, [types, typesFilter]);

  const getSkuUnitTypeById = (id: string): string => {
    const type = types.find(t => t.value === id);
    return type ? type.label : "-";
  };

  // Get SKU Categories
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565e14f70897486c468539",
      setState: setSkuCategories,
      defaultLabel: "Categories",
    });
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categoryFilter) {
      setCategoryFilter(categories[0].value);
    }
  }, [categories, categoryFilter]);

  const getSkuCategoriesById = (id: string): string => {
    const category = categories.find(c => c.value === id);
    return category ? category.label : "-";
  };

  // Get Parent Resources
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565df7f70897486c468538",
      setState: setParentResources,
      defaultLabel: "ParentResources",
    });
  }, []);

  const getParentResourcesNameById = (id: string): string => {
    const resource = parentResources.find(k => k.value === id);
    return resource ? resource.label : "-";
  };

  // Get Departments
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565ce0f70897486c46852f",
      setState: setDepartments,
      defaultLabel: "Departments",
    });
  }, []);

  const getDepartmentsById = (id: string): string => {
    const department = departments.find(d => d.value === id);
    return department ? department.label : "-";
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

      if (defaultLabel == 'ParentResources') {
        rawData = rawData.filter(
          (item: any) => item?.detail?.typeId === "6863f34b5f3b843029c7941d"
        );
      }
      const formattedData = rawData.map((item: any) => ({
        value: item.id,
        label: item.detail?.name || "",
      }));
      if (defaultLabel === "Categories" || defaultLabel === "Types") {
        setState([{"value": "000000000000000000000000", "label": "All"}, ...formattedData]);
      } else {
        setState([ ...formattedData]);
      }
      
    } catch (error) {
      notification.error(`Failed to load ${defaultLabel}.`);
    }
  };

  // Filter Set All
  useEffect(() => {
    if (categories.length > 0 && types.length > 0 && categoryFilter && typesFilter) {
      setFiltersReady(true);
    }
  }, [categories, types, categoryFilter, typesFilter]);

  // Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);

  const buildFilterQuery = () => {
    const query: any = {};
    if (statusFilter && statusFilter !== "000000000000000000000000") {
      query.statusId = statusFilter;
    }
    if (categoryFilter && categoryFilter !== "000000000000000000000000") {
      query.categoryId = categoryFilter;
    }
    if (typesFilter && typesFilter !== "000000000000000000000000") {
      query.type = typesFilter;
    }
    return query;
  };

  // SKU Listing
  useEffect(() => {
    if (filtersReady) {
      fetchSkuList();
    }
  }, [page, searchTerm, statusFilter, categoryFilter, typesFilter, filtersReady]);

  useEffect(() => {
    setPage(0);
    setSkus([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, statusFilter, categoryFilter, typesFilter]);
  
  const fetchSkuList = async () => {
    try {
      const filters = buildFilterQuery(); // dynamic filtering logic
      const requestData: any = {
        ...getPaginatedRequestParams(page, pageSize),
        searchText: searchTerm || undefined,
      };
      if (Object.keys(filters).length > 0) {
        requestData.refFilter = filters;
      }
      const response = await apiService.post({
        path: api_url.worCoorService.inventory.sku.skuList,
        data: requestData,
        isAuth: true,
      });

      const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
      const totalCount = response.data?.data?.total || 0;
      setSkus((prev) => {
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
  
  // Handle adding a new SKU
  const handleAddSku = async (skuData: any) => {
    if (skuData.attachments && skuData.attachments.length === 0) {
      delete skuData.attachments;
    }
    try {
      const response = await apiService.post({
        path: api_url.worCoorService.inventory.sku.addSku,
        isAuth: true,
        data: skuData,
      });
      if (response.data.status === "OK") {
        notification.success(response.data.message);
        setIsAddDialogOpen(false);
        setPage(0);
        setSkus([]);
        setHasMore(true);
        setIsLoading(false);
        await fetchSkuList();
      } else {
        notification.error(response.data.message);
      }
    } catch (error) {
      notification.error("Something went wrong. Please try again.");
    }
  }

  // Handle editing a SKU
  const handleEditSku = async (skuData: any) => {
    if (!selectedSku) return
    try {
      skuData.id = selectedSku.id;
      const response = await apiService.put({
        path: api_url.worCoorService.inventory.sku.updateSku,
        isAuth: true,
        data: skuData,
      });
      if (response.data.status === "OK") {
        notification.success(response.data.message);
        setIsEditDialogOpen(false);
        setPage(0);
        setSkus([]);
        setHasMore(true);
        setIsLoading(false);
        await fetchSkuList();
      } else {
        notification.error(response.data.message);
      }
    } catch (error) {
      notification.error("Something went wrong while updating the asset.");
    }
  }

  // Handle deleting a SKU
  const handleDeleteSku = async () => {
    if (!selectedSku) return
    setIsDeleting(true);
    try {
      const response = await apiService.delete({
        path: `${api_url.worCoorService.inventory.sku.deleteSku}/${selectedSku.id}`,
        isAuth: true,
      });
      if (response.data?.status === "OK") {
        notification.success(response.data.message);
        setSkus(skus.filter((sku) => sku.id !== selectedSku.id))
        setIsDeleteDialogOpen(false)
      } else {
        notification.error(response.data?.message);
      }
      setIsDeleting(false);
    } catch (error) {
      notification.error("Something went wrong while deleting the asset.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Handle toggling SKU type
  const handleToggleType = (id: string, newType: string) => {
    setSkus(skus.map((sku) => (sku.id === id ? { ...sku, type: newType } : sku)))
    toast({
      title: "SKU type updated",
      description: `SKU type has been updated to ${newType}.`,
    })
  }

  // Handle double-click on SKU row
  const handleSkuRowDoubleClick = (sku: any) => {
    setselectedSku(sku)
    setIsViewDailogOpen(true)
  }

  // Handle quality check
  const handleQualityCheck = (data: QualityCheckFormValues) => {
    if (!selectedSku) return
    const updatedSkus = skus.map((sku) => {
      if (sku.id === selectedSku.id) {
        return {
          ...sku,
          qualityRating: data.qualityRating,
          qualityCheckDone: data.qualityCheckDone,
          qualityCheckNotes: data.qualityCheckNotes || "",
          qualityCheckDate: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
        }
      }
      return sku
    })
    setSkus(updatedSkus)
    setIsQualityCheckDialogOpen(false)
    // qualityForm.reset()
    toast({
      title: "Quality check completed",
      description: `Quality check for ${selectedSku.name} has been recorded.`,
    })
  }

  // Get quantity status badge
  const getQuantityBadge = (quantity = 0, minQuantity = 0) => {
    if (quantity <= 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
    } else if (quantity < minQuantity) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
    }
  }

  // Get quality badge
  const getQualityBadge = (rating: string) => {
    switch (rating) {
      case "A":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">A - Premium</Badge>
      case "B":
        return <Badge className="bg-white text-blue-800 border border-blue-200 hover:bg-white">B - Standard</Badge>
      case "C":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">C - Economy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Rated</Badge>
    }
  }

  // Get quality check badge
  const getQualityCheckBadge = (checked: boolean) => {
    return checked ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Checked</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pending</Badge>
    )
  }

  // Calculate total SKU quantity
  const calculateTotalQuantity = () => {
    return skus.reduce((total, sku) => total + (sku.availableQuantity || 0), 0)
  }

  // Calculate total SKU weight
  const calculateTotalWeight = () => {
    return skus
      .reduce((total, sku) => {
        return total + (sku.availableQuantity || 0) * (sku.unitWeight || 0)
      }, 0)
      .toFixed(2)
  }

  // Count SKUs with quality check done
  const countQualityCheckedSkus = () => {
    return skus.filter((sku) => sku.qualityCheckDone).length
  }

  // Group SKUs by category
  const skusByCategory = skus.reduce<Record<string, any[]>>(
    (acc, sku) => {
      const category = sku.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(sku)
      return acc
    },
    {},
  )

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(skus.map(sku => sku.category).filter(Boolean)))
  
  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(skus.map(sku => sku.type).filter(Boolean)))

  // React Hook Form for quality check
  const qualityForm = useForm<QualityCheckFormValues>({
    resolver: zodResolver(qualityCheckSchema),
    defaultValues: {
      qualityRating: "",
      qualityCheckDone: false,
      qualityCheckNotes: "",
    },
  })

  function SkuTable({
    skus,
    onContextMenu,
  }: {
    skus: any[];
    onContextMenu: (e: React.MouseEvent, skuId: string) => void;
  }) {
    return (
      <div ref={scrollContainerRef}
            className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto"
          >
        <Table>
          <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
            <TableRow>
              <TableHead className="w-[120px] text-black font-semibold whitespace-nowrap">Parent Resource</TableHead>
              <TableHead className="min-w-[130px] text-black font-semibold whitespace-nowrap">Name</TableHead>
              <TableHead className="w-[120px] text-black font-semibold whitespace-nowrap">Code</TableHead>
              <TableHead className="w-[100px] text-black font-semibold whitespace-nowrap">SKU Unit</TableHead>
              <TableHead className="w-[120px] text-black font-semibold whitespace-nowrap">Department</TableHead>
              <TableHead className="w-[120px] text-black font-semibold whitespace-nowrap">SKU Category</TableHead>
              <TableHead className="w-[130px] text-black font-semibold">SKU Type</TableHead>
              <TableHead className="w-[130px] text-black font-semibold">Available</TableHead>
              <TableHead className="w-[130px] text-black font-semibold">Block</TableHead>
              <TableHead className="w-[130px] text-black font-semibold">wastage</TableHead>
              <TableHead className="w-[130px] text-black font-semibold">Dispatched</TableHead>
              <TableHead className="w-[130px] text-black font-semibold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skus.length > 0 ? (
              skus.map((sku) => (
                <TableRow key={sku.id} onDoubleClick={() => handleSkuRowDoubleClick(sku)}
                  onContextMenu={(e) => onContextMenu(e, sku.id)} className="bg-muted/30 cursor-pointer"
                >
                  <TableCell className="p-4 md:p-6">{getParentResourcesNameById(sku.resourceId)}</TableCell>
                  <TableCell className="p-4 md:p-6">{sku.name}</TableCell>
                  <TableCell className="p-4 md:p-6">{sku.code}</TableCell>
                  <TableCell className="p-4 md:p-6">{getSkuUnitById(sku.unitId)}</TableCell>
                  <TableCell className="p-4 md:p-6">{getDepartmentsById(sku.departmentId)}</TableCell>
                  <TableCell className="p-4 md:p-6">{getSkuCategoriesById(sku.categoryId)}</TableCell>
                  <TableCell className="p-4 md:p-6">{getSkuUnitTypeById(sku.type)}</TableCell>
                  <TableCell className="p-4 md:p-6">
                    {Math.max(
                      (sku.totalQty || 0) -
                      (sku.blockedQty || 0) -
                      (sku.wastageQty || 0) -
                      (sku.consumeQty || 0) -
                      (sku.dispatchQty || 0),
                      0
                    )}
                  </TableCell>
                  <TableCell className="p-4 md:p-6">{sku.blockedQty ? sku.blockedQty : 0}</TableCell>
                  <TableCell className="p-4 md:p-6">{sku.wastageQty ? sku.wastageQty : 0}</TableCell>
                  <TableCell className="p-4 md:p-6">{sku.dispatchQty ? sku.dispatchQty : 0}</TableCell>
                  <TableCell className="p-4 md:p-6">{sku.totalQty ? sku.totalQty : 0}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center">
                  No SKUs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  }

  const handleContextMenu = (e: React.MouseEvent, skuId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      skuId
    });
  }

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, skuId: "" })
  }

  // Close context menu when clicking outside
  const handleDocumentClick = (e: React.MouseEvent) => {
    if (contextMenu.visible) {
      handleCloseContextMenu()
    }
  }

  const handleHistory = (type: "procurement" | "blocked" | "wastage" | "dispatched" | "location") => {
    setSkuId(contextMenu.skuId);
    setSelectedHistoryType(type);
    setIsHisotryDialogOpen(true);
    setContextMenu({ visible: false, x: 0, y: 0, skuId: "" });
  };

  if (isAuthLoading || !isAuthenticated) return null;
  
  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden">
      <div className="h-full skus flex flex-col gap-2"  onClick={handleDocumentClick}>
        <div className="flex items-center pb-2 sm:pb-4">
          <PageHeader title="SKU Management" description="Manage SKUs and inventory levels" icon={Tag}/>
          <div className="flex items-center ml-auto gap-2">
            {/* <Button variant="outline" className="flex items-center " onClick={() => setIsTotalDialogOpen(true)}>
              <BarChart3 className="h-4 w-4" />
            </Button> */}
            <Button 
              className="border border-primary bg-darkblue text-white hover:bg-darkblue/90"
              onClick={() => setIsAddDialogOpen(true)}>
              <span className="hidden md:block"> Add SKU</span>
              <Plus className="h-4 w-4 block text-white md:hidden" />
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skus.length}</div>
              <div className="text-xs text-muted-foreground">Unique stock keeping units</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
              <div className="h-full bg-primary" style={{ width: `100%` }}></div>
            </div>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateTotalQuantity()}</div>
              <div className="text-xs text-muted-foreground">Items in inventory</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${Math.min(100, (calculateTotalQuantity() / (calculateTotalQuantity() + 100)) * 100)}%`,
                }}
              ></div>
            </div>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weight (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateTotalWeight()}</div>
              <div className="text-xs text-muted-foreground">Kilograms in inventory</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${Math.min(100, (Number.parseFloat(calculateTotalWeight()) / (Number.parseFloat(calculateTotalWeight()) + 100)) * 100)}%`,
                }}
              ></div>
            </div>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Checked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {countQualityCheckedSkus()} / {skus.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((countQualityCheckedSkus() / (skus.length || 1)) * 100)}% completion rate
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${(countQualityCheckedSkus() / skus.length) * 100}%`,
                }}
              ></div>
            </div>
          </Card>
        </div>

        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200  backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
          <div className="space-y-4">
            {/* Search and Filter Form */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full md:w-auto flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                  <Input
                    type="search" placeholder="Search Skus..."
                    value={rawSearchTerm}
                    onChange={(e) => setRawSearchTerm(e.target.value)}
                    className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-wrap align-middle gap-2 ml-auto md:flex-none">
                {/* Category Wise Filter  */}
                <div className="relative w-[160px]">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className={`peer w-full bg-background border text-left border-input 
                      focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}
                  >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    <label
                    htmlFor="Category"
                    className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                    transition-all duration-200 bg-background px-1
                    peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                    ${categoryFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                  `}
                  >
                    SKU Category
                </label>
                </div>
                {/* Type Wise Filter  */}
                  <div className="relative w-[160px]">
                  <Select value={typesFilter} onValueChange={setTypesFilter}>
                    <SelectTrigger className={`peer w-full bg-background border text-left border-input 
                      focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}
                  >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                    transition-all duration-200 bg-background px-1
                    peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                    ${typesFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                  `}>
                    SKU Types
                  </label>
                </div>
              </div>
            </div>
            {/* SKU Listing */}
            <SkuTable skus={skus} onContextMenu={handleContextMenu} />

          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div className="fixed z-50 min-w-[180px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95"
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          >
            <div className="px-2">
              <button className={rightClickBtnClass} onClick={() => handleHistory("procurement")}>Procurement History</button>
              <button className={rightClickBtnClass} onClick={() => handleHistory("blocked")}>Blocked History</button>
              <button className={rightClickBtnClass} onClick={() => handleHistory("wastage")}>Wastage History</button>
              <button className={rightClickBtnClass} onClick={() => handleHistory("dispatched")}>Dispatched History</button>
              <button className={rightClickBtnClass} onClick={() => handleHistory("location")}>Location Details</button>
            </div>
          </div>
        )}

        {/* History Modal */}
        <Dialog open={isHisotryDialogOpen} onOpenChange={setIsHisotryDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewDailogOpen(false)}
              className="max-w-5xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 py-6 border-b">
              <DialogTitle> {selectedHistoryType ? selectedHistoryType.charAt(0).toUpperCase() + selectedHistoryType.slice(1) : ""} History</DialogTitle>
              <DialogDescription>View {selectedHistoryType ? selectedHistoryType : ""} history of the selected SKU.</DialogDescription>
            </DialogHeader>
            <HistoryModal skuId={skuId} type={selectedHistoryType} />
          </DialogContent>
        </Dialog>

        {/* View Asset Dialog */}
        <Dialog open={isViewDailogOpen} onOpenChange={setIsViewDailogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewDailogOpen(false)}
              className="sm:max-w-[600px] max-w-md md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 py-6 border-b">
              <DialogTitle>SKU Details</DialogTitle>
              <DialogDescription>View details of the selected SKU.</DialogDescription>
            </DialogHeader>
            {selectedSku && (
              <div className="h-full space-y-4 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Parent Resource</Label>
                    <p className="text-sm">{getParentResourcesNameById(selectedSku.resourceId)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm">{selectedSku.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Code</Label>
                    <p className="text-sm">{selectedSku.code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">SKU Type</Label>
                    <p className="text-sm">{getSkuUnitTypeById(selectedSku.type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">SKU Category</Label>
                    <p className="text-sm">{getSkuCategoriesById(selectedSku.categoryId)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">SKU Unit</Label>
                    <p className="text-sm">{getSkuUnitById(selectedSku.unitId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="text-sm">{getDepartmentsById(selectedSku.departmentId)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedSku.description || "No description provided."}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Attachments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSku.attachments && selectedSku.attachments.length > 0 ? (
                      selectedSku.attachments.map((url: string, index: number) => (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                          <div className="w-24 h-24 max-h-24 min-h-24 min-w-24 max-w-24 rounded-xl border hover:opacity-80">
                            <img
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              className="h-full w-full object-cover rounded-xl"
                            />
                          </div>
                        </a>
                      ))
                    ) : (
                      <span className="text-sm">N/A</span>
                    )}
                  </div>
                </div>
                
              </div>
            )}
              <DialogFooter  className="px-2 md:px-6 py-4 gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setIsViewDailogOpen(false)
                      setIsEditDialogOpen(true)
                    }}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDeleteDialogOpen(true)
                    }}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add SKU Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsAddDialogOpen(false)}
              className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Add SKU</DialogTitle>
              <DialogDescription>Add a new SKU to the inventory system.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4">
              <SkuForm 
                onSubmit={handleAddSku} 
                onCancel={() => setIsAddDialogOpen(false)}
                categories={categories}
                types={types}
                units={units}
                parentResources={parentResources}
                departments={departments}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit SKU Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsEditDialogOpen(false)}
              className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Edit SKU</DialogTitle>
              <DialogDescription>Make changes to the SKU details.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4">
              {selectedSku && (
                <SkuForm 
                  initialData={selectedSku} 
                  onSubmit={handleEditSku} 
                  onCancel={() => setIsEditDialogOpen(false)}
                  categories={categories}
                  types={types}
                  units={units}
                  parentResources={parentResources}
                  departments={departments}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete SKU Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteDialogOpen(false)}
              className="dark:bg-modal max-w-full sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete SKU</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this SKU? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedSku && (
              <div className="pb-4 pt-2">
                <p className="text-sm/10 leading-[1.4] mb-3">
                  You are about to delete: <strong>{selectedSku.name}</strong> - {selectedSku.description || ""}
                </p>
                {selectedSku.availableQuantity > 0 && (
                  <p className="text-destructive bg-red-50 text-sm/6 leading-[1.4] mt-2 p-2 border border-red-200 rounded-md">
                    Warning: This SKU has {selectedSku.availableQuantity} units in stock. Deleting it will remove these from
                    inventory.
                  </p>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSku} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quality Check Dialog */}
        <Dialog open={isQualityCheckDialogOpen} onOpenChange={setIsQualityCheckDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsQualityCheckDialogOpen(false)}
              className="sm:max-w-[425px]  flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Quality Check</DialogTitle>
              <DialogDescription>{selectedSku && `Perform quality check for ${selectedSku.name}`}</DialogDescription>
            </DialogHeader>
            {selectedSku && (
              <Form {...qualityForm}>
                <form  onSubmit={qualityForm.handleSubmit(handleQualityCheck)} className="space-y-6 flex-grow-1 overflow-y-auto px-4 md:px-6 pt-4">
                  <FormField
                    control={qualityForm.control}
                    name="qualityRating"
                    render={({ field }) => (
                      <FormItem className="space-y-1 gap-2">
                        <FormLabel className="text-sm font-medium leading-none">Quality Rating</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                              <SelectValue placeholder="Select quality rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A - Premium</SelectItem>
                            <SelectItem value="B">B - Standard</SelectItem>
                            <SelectItem value="C">C - Economy</SelectItem>
                            <SelectItem value="Not Rated">Not Rated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={qualityForm.control}
                    name="qualityCheckDone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl className="text-sm">
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium leading-none">Mark as checked</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={qualityForm.control}
                    name="qualityCheckNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium leading-none">Notes</FormLabel>
                        <FormControl>
                          <Textarea className=" rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700" placeholder="Enter quality check notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter  className="px-2 md:px-0 py-4">
                    <Button variant="outline" type="button" onClick={() => setIsQualityCheckDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Total SKUs Dialog */}
        {/* <Dialog open={isTotalDialogOpen} onOpenChange={setIsTotalDialogOpen}>
          <DialogContent className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Total SKU Inventory</DialogTitle>
              <DialogDescription>Comprehensive view of all SKUs in inventory</DialogDescription>
            </DialogHeader>
            <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full flex justify-start h-14 bg-gray-200 p-0 dark:bg-gray-900 overflow-y-auto rounded-xl dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  scrollbar-thumb-hover dark-scrollbar-thumb-hover dark:[&::-webkit-scrollbar]y:w-[4px] [&::-webkit-scrollbar]:h-[2px] mb-4">
                  <TabsTrigger className="w-full h-fill-available transition-transform rounded-lg m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="all">All SKUs</TabsTrigger>
                  <TabsTrigger className="w-full h-fill-available transition-transform rounded-lg m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="category">By Category</TabsTrigger>
                  <TabsTrigger className="w-full h-fill-available transition-transform rounded-lg m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="quality">By Quality</TabsTrigger>
                  <TabsTrigger className="w-full h-fill-available transition-transform rounded-lg m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="production">Production & Wastage</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Card className="bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{skus.length}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-slate-200   to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateTotalQuantity()}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md shadow-none">
                    <Table className="shadow-none">
                      <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                        <TableRow>
                          <TableHead className="text-black font-semibold whitespace-nowrap w-[150px]">SKU Name</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Category</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Current Quantity</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Total Procured</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Unit Weight</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Total Weight</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Quality</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Unit Cost</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Total Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skus.map((sku) => (
                          <TableRow key={sku.id}>
                            <TableCell className="font-medium p-4 md:p-6 whitespace-nowrap">{sku.name || ""}</TableCell>
                            <TableCell className="p-4 md:p-6">{sku.category || ""}</TableCell>
                            <TableCell className="p-4 md:p-6">
                              {sku.availableQuantity || 0} {sku.quantityUnit || ""}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                              {sku.totalProcured || 0} {sku.quantityUnit || ""}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                              {sku.unitWeight || 0} {sku.weightUnit || ""}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                              {((sku.unitWeight || 0) * (sku.availableQuantity || 0)).toFixed(2)} {sku.weightUnit || ""}
                            </TableCell>
                            <TableCell className="p-4 md:p-6 whitespace-nowrap">
                              {sku.qualityRating ? getQualityBadge(sku.qualityRating) : getQualityBadge("Not Rated")}
                            </TableCell>
                            <TableCell className="p-4 md:p-6 whitespace-nowrap">
                              {sku.unitCost || 0} {sku.currency || ""}
                            </TableCell>
                            <TableCell className="p-4 md:p-6 whitespace-nowrap">
                              {((sku.unitCost || 0) * (sku.availableQuantity || 0)).toFixed(2)} {sku.currency || ""}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-gray-100">
                          <TableCell className="p-4 md:p-6" colSpan={2}>Total</TableCell>
                          <TableCell className="p-4 md:p-6">{calculateTotalQuantity()}</TableCell>
                          <TableCell className="p-4 md:p-6">{skus.reduce((total, sku) => total + (sku.totalProcured || 0), 0)}</TableCell>
                          <TableCell className="p-4 md:p-6">-</TableCell>
                          <TableCell className="p-4 md:p-6">{calculateTotalWeight()}</TableCell>
                          <TableCell className="p-4 md:p-6">-</TableCell>
                          <TableCell className="p-4 md:p-6">-</TableCell>
                          <TableCell className="p-4 md:p-6 whitespace-nowrap">
                            {skus
                              .reduce((total, sku) => total + (sku.unitCost || 0) * (sku.availableQuantity || 0), 0)
                              .toFixed(2)}{" "}
                            {skus[0]?.currency || "USD"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="category" className="space-y-4">
                  {Object.entries(skusByCategory).map(([category, categorySkus]) => {
                    const totalCategoryQuantity = categorySkus.reduce((sum, sku) => sum + (sku.availableQuantity || 0), 0)
                    const totalCategoryWeight = categorySkus.reduce(
                      (sum, sku) => sum + (sku.unitWeight || 0) * (sku.availableQuantity || 0),
                      0,
                    )
                    const totalCategoryValue = categorySkus.reduce(
                      (sum, sku) => sum + (sku.unitCost || 0) * (sku.availableQuantity || 0),
                      0,
                    )

                    return (
                      <Card key={category}>
                        <CardHeader className="space-y-0">
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <CardDescription className="text-xs">
                            {categorySkus.length} SKUs | {totalCategoryQuantity} items | {totalCategoryWeight.toFixed(2)} kg
                            | {totalCategoryValue.toFixed(2)} {categorySkus[0]?.currency || "USD"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md shadow-none">
                            <Table>
                              <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                <TableRow>
                                  <TableHead  className="text-black font-semibold whitespace-nowrap">SKU Name</TableHead>
                                  <TableHead className="text-black font-semibold whitespace-nowrap">Quantity</TableHead>
                                  <TableHead className="text-black font-semibold whitespace-nowrap">% of Category</TableHead>
                                  <TableHead className="text-black font-semibold whitespace-nowrap">Weight</TableHead>
                                  <TableHead className="text-black font-semibold whitespace-nowrap">Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {categorySkus.map((sku) => (
                                  <TableRow key={sku.id}>
                                    <TableCell className="font-medium">{sku.name || ""}</TableCell>
                                    <TableCell>
                                      {sku.availableQuantity || 0} {sku.quantityUnit || ""}
                                    </TableCell>
                                    <TableCell>
                                      {totalCategoryQuantity > 0
                                        ? Math.round(((sku.availableQuantity || 0) / totalCategoryQuantity) * 100)
                                        : 0}
                                      %
                                      <Progress
                                        value={
                                          totalCategoryQuantity > 0
                                            ? ((sku.availableQuantity || 0) / totalCategoryQuantity) * 100
                                            : 0
                                        }
                                        className="h-2 mt-1"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {((sku.unitWeight || 0) * (sku.availableQuantity || 0)).toFixed(2)}{" "}
                                      {sku.weightUnit || ""}
                                    </TableCell>
                                    <TableCell>
                                      {((sku.unitCost || 0) * (sku.availableQuantity || 0)).toFixed(2)} {sku.currency || ""}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Quality Checked</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {countQualityCheckedSkus()} / {skus.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((countQualityCheckedSkus() / (skus.length || 1)) * 100)}% completion rate
                        </div>
                        <Progress value={(countQualityCheckedSkus() / (skus.length || 1)) * 100} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Quality Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center text-xs gap-2">
                              <div className="w-3 h-3 rounded-full text-xs bg-green-500"></div>
                              <span>A - Premium</span>
                            </div>
                            <div className="flex items-center text-xs gap-2">
                              <div className="w-3 h-3 rounded-full text-xs bg-blue-500"></div>
                              <span>B - Standard</span>
                            </div>
                            <div className="flex items-center text-xs gap-2">
                              <div className="w-3 h-3 rounded-full text-xs bg-orange-500"></div>
                              <span>C - Economy</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div>{skus.filter((s) => s.qualityRating === "A").length}</div>
                            <div>{skus.filter((s) => s.qualityRating === "B").length}</div>
                            <div>{skus.filter((s) => s.qualityRating === "C").length}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md shadow-none">
                    <Table>
                      <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                        <TableRow>
                          <TableHead className="text-black font-semibold whitespace-nowrap">SKU Name</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Quality Rating</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">QC Status</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Last Checked</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Quantity</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skus.map((sku) => (
                          <TableRow key={sku.id}>
                            <TableCell className="font-medium">{sku.name || ""}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {sku.qualityRating ? getQualityBadge(sku.qualityRating) : getQualityBadge("Not Rated")}
                            </TableCell>
                            <TableCell>{getQualityCheckBadge(sku.qualityCheckDone)}</TableCell>
                            <TableCell>{sku.qualityCheckDate || "Not checked"}</TableCell>
                            <TableCell>
                              {sku.availableQuantity || 0} {sku.quantityUnit || ""}
                            </TableCell>
                            <TableCell>{sku.category || ""}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="production" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Available for Production</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {skus.reduce(
                            (total, sku) => total + (sku.availableQuantity || 0) - (sku.taggedForProduction || 0),
                            0,
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Units available for new production orders</div>
                      </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Tagged for Production</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {skus.reduce((total, sku) => total + (sku.taggedForProduction || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Units already allocated to production orders</div>
                      </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-200  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Total Wastage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {skus.reduce((total, sku) => total + (sku.wastage || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Units recorded as wastage</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md shadow-none">
                    <Table>
                      <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                        <TableRow>
                          <TableHead className="text-black font-semibold whitespace-nowrap">SKU Name</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Total Procured</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Current Quantity</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Tagged for Production</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Available</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Wastage</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Wastage %</TableHead>
                          <TableHead className="text-black font-semibold whitespace-nowrap">Wastage Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skus.map((sku) => {
                          const totalProcured = sku.totalProcured || 0
                          const wastage = sku.wastage || 0
                          const unitCost = sku.unitCost || 0
                          const availableQuantity = sku.availableQuantity || 0
                          const taggedForProduction = sku.taggedForProduction || 0

                          const wastagePercentage = totalProcured > 0 ? (wastage / totalProcured) * 100 : 0
                          const wastageCost = wastage * unitCost

                          return (
                            <TableRow key={sku.id}>
                              <TableCell className="font-medium p-4 md:p-6">{sku.name || ""}</TableCell>
                              <TableCell className="p-4 md:p-6">
                                {totalProcured} {sku.quantityUnit || ""}
                              </TableCell>
                              <TableCell className="p-4 md:p-6">
                                {availableQuantity} {sku.quantityUnit || ""}
                              </TableCell>
                              <TableCell className="p-4 md:p-6">
                                {taggedForProduction} {sku.quantityUnit || ""}
                              </TableCell>
                              <TableCell className="p-4 md:p-6">
                                {availableQuantity - taggedForProduction} {sku.quantityUnit || ""}
                              </TableCell>
                              <TableCell className="p-4 md:p-6">
                                {wastage} {sku.quantityUnit || ""}
                              </TableCell>
                              <TableCell className="p-4 md:p-6">{wastagePercentage.toFixed(1)}%</TableCell>
                              <TableCell className="p-4 md:p-6">
                                {wastageCost.toFixed(2)} {sku.currency || ""}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow className="font-bold bg-gray-100">
                          <TableCell className="p-4 md:p-6">Total</TableCell>
                          <TableCell className="p-4 md:p-6">{skus.reduce((total, sku) => total + (sku.totalProcured || 0), 0)}</TableCell>
                          <TableCell className="p-4 md:p-6">{skus.reduce((total, sku) => total + (sku.availableQuantity || 0), 0)}</TableCell>
                          <TableCell className="p-4 md:p-6">{skus.reduce((total, sku) => total + (sku.taggedForProduction || 0), 0)}</TableCell>
                          <TableCell className="p-4 md:p-6">
                            {skus.reduce(
                              (total, sku) => total + ((sku.availableQuantity || 0) - (sku.taggedForProduction || 0)),
                              0,
                            )}
                          </TableCell>
                          <TableCell className="p-4 md:p-6">{skus.reduce((total, sku) => total + (sku.wastage || 0), 0)}</TableCell>
                          <TableCell className="p-4 md:p-6">
                            {(
                              (skus.reduce((total, sku) => total + (sku.wastage || 0), 0) /
                                Math.max(
                                  1,
                                  skus.reduce((total, sku) => total + (sku.totalProcured || 0), 0),
                                )) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                          <TableCell className="p-4 md:p-6">
                            {skus.reduce((total, sku) => total + (sku.wastage || 0) * (sku.unitCost || 0), 0).toFixed(2)}{" "}
                            {skus[0]?.currency || "USD"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="px-2 md:px-6 py-4">
              <Button className="text-sm font-medium mb-2" variant="outline" onClick={() => setIsTotalDialogOpen(false)}>
                Close
              </Button>
              <Button variant="default" className="text-sm font-medium bg-darkblue mb-2" onClick={() => setIsTotalDialogOpen(false)}>
                <FileText className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  )

}