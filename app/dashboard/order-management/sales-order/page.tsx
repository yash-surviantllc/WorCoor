"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, PanelLeftOpen, Eye, Plus, ShoppingCart, Search, Edit, Trash2, CheckCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { SoForm } from "@/components/inventory/so-form"
import { Badge } from "@/components/ui/badge"
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import localStorageService from '@/src/services/localStorageService'
import type { AuthData } from '@/src/utils/AuthContext'
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2 } from "lucide-react";

export default function InventorySoPage() {

    const {isAuthenticated, isAuthLoading} = useAuth()
    const [userData, setUserData] = useState<AuthData['userData'] | null>(null);
    const [sos, setSos] = useState<any[]>([])
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [rawSearchTerm, setRawSearchTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isViewDetailsDailogOpen, setIsViewDetailsDailogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false);
    const [vendors, setVendors] = useState<{ value: string; label: string }[]>([])
    const [viewMode, setViewMode] = useState<"list" | "form" | "inv-mgmt">("list");
    const [selectedSo, setSelectedSo] = useState<any | null>(null)
    const [skus, setSkus] = useState<any[]>([])
    const [skuUnits, setSkuUnit] = useState<{ value: string; label: string }[]>([]);
    const [locationTags, setLocationTags] = useState<{ value: string; label: string }[]>([]); 
    const [users, setUsers] = useState<any[]>([])
    const [selectedSkuItem, setSelectedSkuItem] = useState<any>(null);
    const [modalQty, setModalQty] = useState<number>(0);
    const [blockIndex, setBlockIndex] = useState<number>(0);
    const [isBlockConfrimDialogOpen, setIsBlockConfrimDialogOpen] = useState(false)
    const [isBlockConfrimBtnLoading, setIsBlockConfrimBtnLoading] = useState(false);
    const [isUnblockConfrimDialogOpen, setIsUnblockConfrimDialogOpen] = useState(false)
    const [unblockIndex, setUnblockIndex] = useState<number>(0);
    const [isUnblockConfrimBtnLoading, setIsUnblockConfrimBtnLoading] = useState(false);
    const [suggestedPickList, setSuggestedPickList] = useState<any | null>(null);
    const [selectedSkuInventory, setSelectedSkuInventory] = useState<any[]>([]);
    const [pickAssignments, setPickAssignments] = useState<any[]>([]); // holds all SKUs selections
    const [pickQuantities, setPickQuantities] = useState<string[]>([]);
    const [assignedPerson, setAssignedPerson] = useState<{ id: string; fullName: string } | null>(null);
    const [isGeneratingPickList, setIsGeneratingPickList] = useState(false)
    const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false);
    const [isBlockApproveForPickListConfirmOpen, setIsBlockApproveForPickListConfirmOpen] = useState(false);
    const [isPartialBlockApproveForPickListConfirmOpen, setIsPartialBlockApproveForPickListConfirmOpen] = useState(false);
    const [isPickListDialogOpen, setIsPickListDialogOpen] = useState(false)
    const [isViewPickListDialogOpen, setIsViewPickListDialogOpen] = useState(false)
    const [viewPickList, setViewPickList] = useState<any | []>([]);
    const [isDispatchConfirmOpen, setIsDispatchConfirmOpen] = useState(false);
    const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
    const [isPartialBlockConfirmed, setIsPartialBlockConfirmed] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const router = useRouter();

    // Auth Check
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) router.replace("/login");
    }, [isAuthenticated, isAuthLoading, router]);

    // Get Login User Details
    useEffect(() => {
        const authData = localStorageService.getItem<AuthData>('authData');
        if (authData?.userData) {
            setUserData(authData.userData);
        }
    }, []);

    const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
        hasMore,
        onLoadMore: () => {
            if (isLoading || !hasMore) return;
            setIsLoading(true);
            setPage((prev) => prev + 1);
        }
    });

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
                        includeFields: [
                            "id", "name", "code", "unitId", "totalQty", "blockedQty", 
                            "wastageQty", "consumeQty", "dispatchQty"
                        ]
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

    const getSkuAvailableQty = (id: string): number => {
        const sku = skus.find(s => s.id === id);
        if (!sku) return 0;
        const totalQty = Number(sku.totalQty) || 0;
        const blocked = Number(sku.blockedQty) || 0;
        const wastage = Number(sku.wastageQty) || 0;
        const consume = Number(sku.consumeQty) || 0;
        const dispatch = Number(sku.dispatchQty) || 0;
        return totalQty - (blocked + wastage + consume + dispatch);
    };
    
    // Get SKU Units
    useEffect(() => {
        fetchDropdownOptions({
            apiId: "68565e8ff70897486c46853c",
            setState: setSkuUnit,
            defaultLabel: "SkuUnits",
        });
    }, []);

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
                    (item: any) => item?.detail?.type === 2 || item?.detail?.type === 3
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

    // Get Users
    useEffect(() => {
        const getUsers = async () => {
            setUsers([]);
            try {
                const response = await apiService.get({
                    path: api_url.authServices.users.technicianList,
                    isAuth: true,
                });
                const repoObj = response.data?.data || {};
                const formatted = Object.entries(repoObj).map(([name, id]) => ({
                    id: String(id),
                    fullName: name,
                }));
                setUsers(formatted);
            } catch (err) {
                setUsers([]);
            }
        };
        getUsers();
    }, []);

    // ########## SO Listing ########## //
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(rawSearchTerm.trim());
        }, 400);
        return () => clearTimeout(handler);
    }, [rawSearchTerm]);

    useEffect(() => {
        fetchSosList();
    }, [page, searchTerm, selectedCompanyFilter, selectedStatusFilter]);
    
    useEffect(() => {
        setPage(0);
        setSos([]);
        setHasMore(true);
        setIsLoading(true);
    }, [searchTerm, selectedCompanyFilter, selectedStatusFilter]);
        
    const fetchSosList = async () => {
        try {
            const requestData: any = {
                ...getPaginatedRequestParams(page, pageSize),
                searchText: searchTerm || undefined,
            };
            if (selectedCompanyFilter != "all") {
                requestData.refFilter = {"customerId": selectedCompanyFilter};
            }
            if (selectedStatusFilter != "all") {
                requestData.query = {"status": parseInt(selectedStatusFilter)};
            }
            const response = await apiService.post({
                path: api_url.worCoorService.inventory.so.soList,
                data: requestData,
                isAuth: true,
            });
            const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
            const totalCount = response.data?.data?.total || 0;
            setSos((prev) => {
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

    const handleSoRowDoubleClick = (so: any) => {
        setSelectedSo(so)
        setIsViewDetailsDailogOpen(true)
    }

    // ########## Add / Update / Delete SO ######### //
    const handleAddEditSO = async (data: any) => {
        try {
            const path = selectedSo ? `${api_url.worCoorService.inventory.so.updateSo}` : api_url.worCoorService.inventory.so.updateSo;
            let method: 'post' | 'put' = 'post';
            if (selectedSo) {
                data.id = selectedSo.id;
                method = 'put';
            }
            const response = await apiService[method]({
                path,
                isAuth: true,
                data,
            });
            if (response.data.status === "OK") {
                notification.success(response.data.message);
                refreshList();
            } else {
                notification.error(response.data.message);
            }
        } catch (error) {
            notification.error("Something went wrong. Please try again.");
        }
    };

    const handleCancelSO = () => {
        setSelectedSo(null);
        refreshList();
    };

    const handleSelectAddSO = () => {
        setViewMode("form");
    };

    // Handle deleting a SO
    const deleteSO = (so: any) => {
        setSelectedSo(so)
        setIsDeleteDialogOpen(true)
    }
    
    const handleDeleteSO = async () => {
        if (!selectedSo) return
        setIsDeleting(true);
        try {
            const response = await apiService.delete({
                path: `${api_url.worCoorService.inventory.so.deleteSo}/${selectedSo.id}`,
                isAuth: true,
            });
            if (response.data?.status === "OK") {
                notification.success(response.data.message);
                setSos(sos.filter((s) => s.id !== selectedSo.id))
                setIsDeleteDialogOpen(false);
                setIsViewDetailsDailogOpen(false);
                setSelectedSo(null);
            } else {
                notification.error(response.data?.message);
            }
        } catch (error) {
            notification.error("Something went wrong while deleting the PO.");
        } finally {
            setIsDeleting(false);
        }
    }

    // ########## Manage Orders ########## //
    const handleManageOrders = async (so: any) => {
         if ([4].includes(so.status)) {
            try {
                const response = await apiService.post({
                    path: `${api_url.worCoorService.inventory.soPickList.getSuggestPickList}/${so.id}`,
                    isAuth: true
                });
                if (response.data?.status === "OK") {
                    setSuggestedPickList(response.data?.data || null);
                } else {
                    setSuggestedPickList(null);
                }
            } catch (error) {
                setSuggestedPickList(null);
            }
        }
        if ([5, 6, 7, 8].includes(so.status)) {
            try {
                const response = await apiService.get({
                    path: `${api_url.worCoorService.inventory.soPickList.getPickList}/${so.id}`,
                    isAuth: true
                });
                setViewPickList(response.data?.data || null);
            } catch (error) {
                setViewPickList(null);
            }
        }
        setSelectedSo(so);
        setViewMode("inv-mgmt"); // Switch to Manage Inventory view
    };

    // Block / Unblock
    const handleOpenBlockInventoryConfrimDialog = (item: any, index: number) => {
        let prefillQty = item.qty - item.blockedQty;
        const availableQty = getSkuAvailableQty(item?.skuId);
        prefillQty = availableQty > prefillQty ? prefillQty : availableQty;
        setSelectedSkuItem(item);
        setModalQty(prefillQty);
        setBlockIndex(index);
        setIsBlockConfrimDialogOpen(true);
    };

    const handleConfirmBlock = async () => {
        if (!selectedSkuItem) return;
        const availableQty = getSkuAvailableQty(selectedSkuItem?.skuId);
        if (modalQty > availableQty) {
            notification.error(`Only (${availableQty}) units are available in stock. You cannot block more than this quantity.`);
            return;
        }
        if (modalQty > (selectedSkuItem?.qty - selectedSkuItem?.blockedQty)) {
            notification.error(`This SO expects only (${selectedSkuItem?.qty}) qty, so you cannot block more than that.`);
            return;
        }
        if (modalQty <= 0) {
            notification.error("Quantity must be greater than 0");
            return;
        }
        setIsBlockConfrimBtnLoading(true);
        try {
            const reqBody = {
                soId: selectedSo.id,
                skuId: selectedSkuItem.skuId,
                createdByName: userData?.fullName,
                quantity: modalQty
            };

            const response = await apiService.post({
                path: api_url.worCoorService.inventory.sku.blockQty,
                isAuth: true,
                data: reqBody,
            });

            if (response.data.status === "OK") {
                notification.success(response.data.message);
                const qty = (modalQty + selectedSo.items[blockIndex]['blockedQty'])
                selectedSo.items[blockIndex]['blockedQty'] = qty;

                const totalQty = selectedSo.items.reduce((sum:any, item:any) => sum + (item.qty || 0), 0);
                const totalBlocked = selectedSo.items.reduce((sum:any, item:any) => sum + (item.blockedQty || 0), 0);
                const fulfillmentValue = totalQty > 0 ? Math.round((totalBlocked / totalQty) * 100) : 0;
                if (fulfillmentValue == 100) {
                    selectedSo['status'] = 3;
                }
                setBlockIndex(-1);
                setModalQty(0);
            } else {
                notification.error(response.data.message);
            }
        } catch (error) {
            notification.error("Something went wrong. Please try again.");
        } finally {
            setIsBlockConfrimBtnLoading(false);
            setIsBlockConfrimDialogOpen(false);
        }
    };

    const handleOpenUnblockInventoryConfrimDialog = (item: any, index: number) => {
        const prefillQty = item?.blockedQty ? item?.blockedQty : 0;
        setSelectedSkuItem(item);
        setModalQty(prefillQty);
        setUnblockIndex(index);
        setIsUnblockConfrimDialogOpen(true);
    };

    const handleConfirmUnblock = async () => {
        if (!selectedSkuItem) return;
        if (modalQty > selectedSkuItem?.blockedQty) {
            notification.error(`You can unblock max (${selectedSkuItem?.blockedQty}) qty.`);
            return;
        }
        if (modalQty <= 0) {
            notification.error("Quantity must be greater than 0");
            return;
        }
        setIsUnblockConfrimBtnLoading(true);
        try {
            const response = await apiService.post({
                path: api_url.worCoorService.inventory.sku.unblockQty,
                isAuth: true,
                data: {
                    soId: selectedSo.id,
                    skuId: selectedSkuItem.skuId,
                    createdByName: userData?.fullName,
                    quantity: modalQty,
                    notes: ""
                },
            });
            if (response.data.status === "OK") {
                notification.success(response.data.message);
                selectedSo.items[unblockIndex]['blockedQty'] = (selectedSo.items[unblockIndex]['blockedQty'] - modalQty);
                setUnblockIndex(-1);
                setModalQty(0);
            } else {
                notification.error(response.data.message);
            }
        } catch (error) {
            notification.error("Something went wrong. Please try again.");
        } finally {
            setIsUnblockConfrimBtnLoading(false);
            setIsUnblockConfrimDialogOpen(false);
        }
    };

    // Picklist
    const handlePickLocation = (skuItem: any) => {
        setSelectedSkuItem(skuItem);
        // fetch inventory for that SKU from suggestedPickList
        const match = suggestedPickList?.skuDetails.find(
            (d: any) => d.skuId === skuItem.skuId
        );
        if (match) {
            setSelectedSkuInventory(match.inventoryDetails || []);
        }
        // check if already has saved data for this SKU
        const existing = pickAssignments.find(p => p.skuId === skuItem.skuId);
        if (existing) {
            setPickQuantities(existing.details.map((d: any) => d.qty.toString()));
            setAssignedPerson({
                id: existing.assignTo,
                fullName: existing.assignToName
            });
        } else {
            // run suggestion logic
            let remaining = skuItem.blockedQty ?? 0;
            const initial = (match?.inventoryDetails || []).map((inv: any) => {
                if (remaining > 0) {
                    if (inv.availableQty >= remaining) {
                        const qty = remaining.toString();
                        remaining = 0;
                        return qty;
                    } else {
                        const qty = inv.availableQty.toString();
                        remaining -= inv.availableQty;
                        return qty;
                    }
                }
                return "0";
            });
            setPickQuantities(initial);
            setAssignedPerson(null);
        }
        setIsPickListDialogOpen(true);
    };

    const handlePickQtyChange = (idx: number, inv: any, value: string) => {
        const maxAllowed = selectedSkuItem?.blockedQty ?? 0;
        const numericValue = Math.max(0, Number(value) || 0);
        const temp = [...pickQuantities];
        temp[idx] = numericValue.toString();
        const totalPicked = temp.reduce((sum, v) => sum + (Number(v) || 0), 0);
        if (totalPicked > maxAllowed) {
            notification.error(`Total pick qty cannot exceed blocked qty (${maxAllowed})`);
            return;
        }
        setPickQuantities(temp);
    };

    const handleAssignPerson = (userId: string, userName: string) => {
        setAssignedPerson({ id: userId, fullName: userName });
    };
    
    const assignPersonDropdownRef = useRef<HTMLDivElement>(null);
    const handleSaveSkuPick = () => {
        const totalPicked = pickQuantities.reduce((sum, qty) => sum + Number(qty || 0), 0);
        const blockedQty = selectedSkuItem?.blockedQty ?? 0;
        // Validation 1: Must match blockedQty exactly
        if (totalPicked !== blockedQty) {
            notification.error(`Total pick quantity must equal blocked qty (${blockedQty}). You picked ${totalPicked}.`);
            return;
        }
        // Validation 2: Must assign a person
        if (!assignedPerson?.id) {
            notification.error("Please assign a person before saving.");
            setTimeout(() => {
                assignPersonDropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return;
        }
        // Save into pickAssignments
        setPickAssignments((prev) => {
            const other = prev.filter(p => p.skuId !== selectedSkuItem.skuId);
            const details = selectedSkuInventory
            .map((inv, idx) => ({
                qty: Number(pickQuantities[idx]),
                blockedQty,
                locationId: inv.locationId,
                inventoryId: inv.id
            }))
            .filter(detail => detail.qty > 0);
            return [
                ...other,
                {
                    skuId: selectedSkuItem.skuId,
                    assignTo: assignedPerson.id,
                    assignToName: assignedPerson.fullName,
                    details
                }
            ];
        });
        setIsPickListDialogOpen(false);
    };

    const generatePickList = async () => {
        setIsGeneratingPickList(true);
        try {
            const response = await apiService.post({
                path: api_url.worCoorService.inventory.soPickList.generatePickList,
                isAuth: true,
                data: {
                    soId: selectedSo.id,
                    items: pickAssignments.map((assignment) => ({
                        skuId: assignment.skuId,
                        assignTo: assignment.assignTo,
                        assignToName: assignment.assignToName,
                        details: assignment.details.reduce((acc: Record<string, number>, detail: any) => {
                            acc[detail.inventoryId] = detail.qty;
                                return acc;
                            }, {})
                    })),
                },
            });
            if (response.data.status === "OK") {
                notification.success(response.data.message);
                setIsGeneratingPickList(false);
                setSelectedSo(null)
                setSelectedSkuItem(null);
                setAssignedPerson(null);
                setPickAssignments([]);
                // Refresh SO List
                refreshList();
            } else {
                notification.error(response.data.message);
            }
        } catch (error) {
            notification.error("Something went wrong. Please try again.");
            setIsGeneratingPickList(false);
        }
    }

    const isAllSkuAssigned = selectedSo?.items?.every((item: any) =>
        pickAssignments.some((p) => p.skuId === item.skuId)
    );

    const handlePickLocationInHistory = (skuItem: any) => {
        setSelectedSkuItem(skuItem);
        setIsViewPickListDialogOpen(true);
    };

    // Dispatched
    const handleDispatched = () => {
        setIsDispatchConfirmOpen(true);
    };

    const handleConfirmDispatch = async () => {
        setIsDispatchConfirmOpen(false);
        try {
            const response = await apiService.patch({
                path: api_url.worCoorService.inventory.so.dispatchSo,
                isAuth: true,
                data: {
                    id: selectedSo.id,
                    createdByName: userData?.fullName
                },
            });
            if (response.data.status === "OK") {
                notification.success(response.data.message);
            } else {
                notification.error(response.data.message);
            }
        } catch (error) {
            setSelectedSo(null);
            refreshList();
            notification.error("Something went wrong while dispatching.");
        } finally {
            setSelectedSo(null);
            refreshList();
        }
    };

    // Approve For Picklist
    const handleConfirmApproveForPickList = async() => {
        setIsApproving(true)
        try {
            const response = await apiService.patch({
                path: `${api_url.worCoorService.inventory.so.approveForPicklist}/${selectedSo.id}`,
                isAuth: true
            });
            if (response.data.status === "OK") {
                notification.success(response.data.message);
                setIsApproving(false);
                setSelectedSo(null);
                refreshList();
                setIsBlockApproveForPickListConfirmOpen(false);
                setIsPartialBlockApproveForPickListConfirmOpen(false);
            } else {
                setIsApproving(false);
                notification.error(response.data.message);
            }
        } catch (error) {
            setIsApproving(false);
            notification.error("Something went wrong while approve for picklist.");
        }
    };

    // ########## General functions ########## //
    const refreshList = async () => {
        setViewMode("list");
        setPage(0);
        setSos([]);
        setHasMore(true);
        setIsLoading(false);
        await fetchSosList();
    };

    const backToList = async () => {
        setSelectedSo(null);
        setSelectedSkuItem(null);
        setAssignedPerson(null);
        setPickAssignments([]);
        refreshList();
    };

    const formatDateOnly = (dateString: string) => {
        const date = new Date(dateString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const getSoStatusBadge = (status:number) => {
        switch (status) {
            case 1:
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        Pending
                    </Badge>
                )
            case 2:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Blocking Started
                    </Badge>
                )
            case 3:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Blocking Completed
                    </Badge>
                )
            case 4:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Approval Granted
                    </Badge>
                )
            case 5:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Picklist generated
                    </Badge>
                )
            case 6:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        picking started
                    </Badge>
                )
            case 7:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Ready For Dispatch
                    </Badge>
                )
            case 8:
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        Dispatched
                    </Badge>
                )
        default:
            return <Badge variant="outline">{status}</Badge>
        }
    }

    const getSoStatusBadgeForInnerPage = (status:number) => {
        switch (status) {
            case 1:
                return (
                    <span className="w-fit block text-xs font-semibold bg-red-100/40 text-red-400 rounded-sm px-3 py-1 shadow-sm">
                        Pending
                    </span>
                )
            case 2:
                return (
                    <span className="w-fit block text-xs font-semibold bg-yellow-100/40 text-yellow-400 rounded-sm px-3 py-1 shadow-sm">
                        Blocking Started
                    </span>
                )
            case 3:
                return (
                    <span className="w-fit block text-xs font-semibold bg-yellow-100/40 text-yellow-400 rounded-sm px-3 py-1 shadow-sm">
                        Blocking Completed
                    </span>
                )
            case 4:
                return (
                    <span className="w-fit block text-xs font-semibold bg-yellow-100/40 text-yellow-400 rounded-sm px-3 py-1 shadow-sm">
                        Approval Granted
                    </span>
                )
            case 5:
                return (
                    <span className="w-fit block text-xs font-semibold bg-yellow-100/40 text-yellow-400 rounded-sm px-3 py-1 shadow-sm">
                        Picklist generated
                    </span>
                )
            case 6:
                return (
                    <span className="w-fit block text-xs font-semibold bg-yellow-100/40 text-yellow-400 rounded-sm px-3 py-1 shadow-sm">
                        picking started
                    </span>
                )
            case 7:
                return (
                    <span className="w-fit block text-xs font-semibold bg-yellow-100/40 text-yellow-400 rounded-sm px-3 py-1 shadow-sm">
                        Ready For Dispatch
                    </span>
                )
            case 8:
                return (
                    <span className="w-fit block text-xs font-semibold bg-green-100/40 text-green-800 rounded-sm px-3 py-1 shadow-sm">
                        Dispatched
                    </span>
                )
        default:
            return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isAuthLoading || !isAuthenticated) return null;

    return (
        <div className="h-[calc(100vh-3rem)] overflow-auto md:overflow-hidden">

            {/* SO Listing */}
            {viewMode === "list" && (
                <>
                    <div className="h-full flex flex-col">
                        <div className="flex items-center pb-2 sm:pb-4">
                            <PageHeader title="Sales Order" icon={ShoppingCart}
                                description="Generate and manage company Sales Order"
                            />
                            <div className="flex items-center ml-auto gap-2">
                                <Button className="border border-primary bg-darkblue text-white hover:bg-darkblue/90"
                                    onClick={() => {handleSelectAddSO()}}
                                >
                                    <span className="hidden md:block"> Add SO</span>
                                    <Plus className="h-4 w-4 block text-white md:hidden" />
                                </Button>
                            </div>
                        </div>
                        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200  backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
                            <div className="space-y-4">
                                {/* Search and Filter Form */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-full md:w-auto flex items-center gap-2">
                                        <div className="relative w-full md:w-64">
                                            <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                                            <Input type="search" placeholder="Search Sales Order..."
                                                value={rawSearchTerm} onChange={(e) => setRawSearchTerm(e.target.value)}
                                                className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap align-middle gap-2 ml-auto md:flex-none">
                                        {/* Company Wise Filter  */}
                                        <div className="relative w-[160px]">
                                            <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                                                <SelectTrigger className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                                                    <SelectValue placeholder="Filter by Company" />
                                                </SelectTrigger>
                                                <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                                    <SelectItem  className="py-2.5" value="all">All</SelectItem>
                                                    {vendors.map((v) => (
                                                        <SelectItem key={v.value} value={v.value}>
                                                        {v.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <label htmlFor="Category"
                                                className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                                                transition-all duration-200 bg-background px-1
                                                peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                                                ${selectedCompanyFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                                            `}
                                            >
                                                Company
                                            </label>
                                        </div>
                                        {/* Status wise filter */}
                                       
                                        <div className="relative w-[160px]">
                                            <Select value={selectedStatusFilter} onValueChange={(value) => setSelectedStatusFilter(value as any)}>
                                                <SelectTrigger className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                                                    <SelectValue placeholder="Filter by Statuses" />
                                                </SelectTrigger>
                                                <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                                    <SelectItem className="py-2.5" value="all">All</SelectItem>
                                                    <SelectItem className="py-2.5" value="1">Pending</SelectItem>
                                                    <SelectItem className="py-2.5" value="2">Blocking Started</SelectItem>
                                                    <SelectItem className="py-2.5" value="3">Blocking Completed</SelectItem>
                                                    <SelectItem className="py-2.5" value="4">Approval Granted</SelectItem>
                                                    <SelectItem className="py-2.5" value="5">Picklist generated</SelectItem>
                                                    <SelectItem className="py-2.5" value="6">Picking Started</SelectItem>
                                                    <SelectItem className="py-2.5" value="7">Ready For Dispatch</SelectItem>
                                                    <SelectItem className="py-2.5" value="8">Dispatched</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <label htmlFor="Category"
                                                className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                                                transition-all duration-200 bg-background px-1
                                                peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                                                ${selectedStatusFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                                            `}
                                            >
                                                Statuses
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* SKU Listing */}
                                <div ref={scrollContainerRef}
                                    className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto"
                                >
                                    <Table className="table-auto">
                                        <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                            <TableRow>
                                                <TableHead className="text-black font-semibold whitespace-nowrap">SO Number</TableHead>
                                                <TableHead className="text-black font-semibold whitespace-nowrap min-w-[180px]">Customer Name</TableHead>
                                                <TableHead className="text-black font-semibold whitespace-nowrap max-w-[100px]">SO Date</TableHead>
                                                <TableHead className="text-black font-semibold whitespace-nowrap max-w-[90px]">SKU Items</TableHead>
                                                <TableHead className="text-black font-semibold whitespace-nowrap min-w-[150px] max-w-[150px]">Fulfillment [Blocked]</TableHead>
                                                <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">Status</TableHead>
                                                <TableHead className="text-black font-semibold whitespace-nowrap max-w-[90px]">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading && sos.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        <div className="flex justify-center items-center h-full">
                                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                            Loading...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : sos.length > 0 ? (
                                                sos.map((s) => {
                                                    // Calculate Fulfilment Logic
                                                    const totalQty = s.items.reduce((sum: any, item: any) => sum + item.qty, 0);
                                                    const totalBlocked = s.items.reduce((sum: any, item: any) => sum + item.blockedQty, 0);
                                                    const fulfillmentValue = totalQty > 0 ? Math.round((totalBlocked / totalQty) * 100) : 0; // number

                                                    return (
                                                        <TableRow key={s.id} onDoubleClick={() => handleSoRowDoubleClick(s)} className="bg-muted/30 cursor-pointer">
                                                            <TableCell className="p-4 md:p-6">{s.soNumber}</TableCell>
                                                            <TableCell className="p-4 md:p-6">{getVendorNameById(s.customerId)}</TableCell>
                                                            <TableCell className="p-4 md:p-6">{s.date ? formatDateOnly(s.date) : "-"}</TableCell>
                                                            <TableCell className="p-4 md:p-6">{s.items.length}</TableCell>
                                                            {/* Fulfillment progress */}
                                                            <TableCell className="p-4 md:p-6">
                                                                <div className="text-xs text-center">{fulfillmentValue}%</div>
                                                                <div title={`${totalBlocked} / ${totalQty} blocked`}>
                                                                    <Progress value={Number(fulfillmentValue)}
                                                                        className={`w-xl h-2 
                                                                            ${fulfillmentValue < 50 ? "bg-red-100 [&>div]:bg-red-500 [&>div]:bg-none [&>div]:from-transparent [&>div]:to-transparent" : ""}
                                                                            ${fulfillmentValue >= 50 && fulfillmentValue < 80 ? "bg-yellow-100 [&>div]:bg-yellow-500 [&>div]:bg-none [&>div]:from-transparent [&>div]:to-transparent" : ""}
                                                                            ${fulfillmentValue >= 80 ? "bg-green-200 [&>div]:bg-green-500 [&>div]:bg-none [&>div]:from-transparent [&>div]:to-transparent" : ""}
                                                                        `}
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="p-4 whitespace-nowrap md:p-6">{getSoStatusBadge(s.status)}</TableCell>
                                                            <TableCell className="p-4 md:p-6 flex items-center justify-center">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <button onClick={() => handleManageOrders(s)}
                                                                                className="flex items-center p-2 rounded-lg hover:bg-blue-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                            >
                                                                                <PanelLeftOpen className="h-5 w-5" />
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top">
                                                                            <p className="text-sm">Manage Order</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </TableCell>
                                                          
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        No sales order found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* SO Add/Update */}
            {viewMode === "form" && (
                <SoForm
                    initialData={
                    selectedSo
                        ? {
                            ...selectedSo,
                            date: selectedSo.date?.slice(0, 10),
                            skuItems: selectedSo.items?.map((item: any) => ({
                                skuId: item.skuId,
                                description: item.description,
                                qty: item.qty,
                                unitPrice: item.unitPrice,
                                totalPrice: item.totalPrice,
                            }))
                        }
                        : undefined
                    }
                    onSubmit={handleAddEditSO}
                    onCancel={() => handleCancelSO()}
                    vendors={vendors}
                    skus={skus}
                    skuUnits={skuUnits}
                    formMode={selectedSo ? 'edit' : 'add'}
                />
            )}

            {/* Manage Inventory */}
            {viewMode === "inv-mgmt" && (
                <div className="h-full relative flex flex-col overflow-hidden">
                    {(() => {
                        // Fulfillment calculation
                        const totalQty = selectedSo.items.reduce((sum:any, item:any) => sum + (item.qty || 0), 0);
                        const totalBlocked = selectedSo.items.reduce((sum:any, item:any) => sum + (item.blockedQty || 0), 0);
                        const fulfillmentValue = totalQty > 0 ? Math.round((totalBlocked / totalQty) * 100) : 0; // number

                        return (
                            <>
                                <div>
                                    {/* Breadcrumb & Close */}
                                    <div className="flex items-start justify-start flex-col mb-3 relative">
                                        <nav className="flex-1">
                                            <Breadcrumb className="text-md">
                                                <BreadcrumbList>
                                                    <BreadcrumbItem>
                                                        <BreadcrumbLink asChild>
                                                            <Link href="/dashboard">Home</Link>
                                                        </BreadcrumbLink>
                                                    </BreadcrumbItem>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem className="cursor-pointer">
                                                        <BreadcrumbLink asChild>
                                                            <div onClick={backToList}>Sales Order Management</div>
                                                        </BreadcrumbLink>
                                                    </BreadcrumbItem>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem>
                                                        <BreadcrumbPage>Manage Order</BreadcrumbPage>
                                                    </BreadcrumbItem>
                                                </BreadcrumbList>
                                            </Breadcrumb>
                                        </nav>
                                    </div>
                                    {/* Header Card */}
                                    <div className="mb-6">
                                        <div className="flex-1 space-y-0">
                                            <h2 className="text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-50 flex items-center gap-2">
                                                {getVendorNameById(selectedSo.customerId)}
                                                <span className="text-lg text-blue-700 font-bold rounded px-2 py-1 dark:text-sky-400 tracking-1">
                                                    [ {selectedSo.soNumber} ]
                                                </span>
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                {getSoStatusBadgeForInnerPage(selectedSo.status)}
                                                <span className="text-sm text-gray-400"> | </span>
                                                <span className="text-xs text-gray-400 font-semibold dark:text-slate-300">
                                                    {selectedSo.date ? formatDateOnly(selectedSo.date) : "-"}
                                                </span>
                                                <span className="text-sm text-gray-400"> | </span>
                                                {/* Fulfillment Display */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 font-semibold dark:text-slate-50">
                                                        Fulfillment [Blocked]:
                                                    </span>
                                                    <span
                                                        className={`text-xs font-semibold px-1 rounded 
                                                            ${fulfillmentValue < 50 ? "text-red-500" : ""}
                                                            ${fulfillmentValue >= 50 && fulfillmentValue < 80 ? "text-yellow-500" : ""}
                                                            ${fulfillmentValue >= 80 ? "text-green-500" : ""}
                                                        `}
                                                    >
                                                        {fulfillmentValue}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* SKU Table */}
                                <div className="h-full flex-grow overflow-auto">
                                    <Table className="table-auto w-full">
                                        <TableHeader className="text-black dark:bg-slate-950">
                                            <TableRow>
                                                <TableHead className="font-semibold px-4 min-w-[20px] max-w-[20px]">#</TableHead>
                                                <TableHead className="font-semibold px-4 min-w-[100px] max-w-[100px]">SKU Code</TableHead>
                                                <TableHead className="font-semibold px-4 min-w-[150px] max-w-[150px]">SKU Name</TableHead>
                                                <TableHead className="font-semibold px-4 min-w-[90px] max-w-[90px]">SKU Qty</TableHead>
                                                <TableHead className="font-semibold px-4 min-w-[90px] max-w-[90px]">Blocked Qty</TableHead>
                                                <TableHead className="font-semibold px-4 min-w-[90px] max-w-[90px]">Available Qty</TableHead>
                                                <TableHead className="font-semibold px-4 min-w-[100px]">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedSo.items.map((item: any, index: number) => (
                                                <TableRow key={item.skuId} className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{item?.skuId ? item?.skuCode : "-"}</TableCell>
                                                    <TableCell>{item?.skuId ? getSkuNameById(item?.skuId) : "-"}</TableCell>
                                                    <TableCell>{item.qty ? item.qty : "0"}</TableCell>
                                                    <TableCell>{item.blockedQty ? item.blockedQty : "0"}</TableCell>
                                                    <TableCell>{item?.skuId ? getSkuAvailableQty(item?.skuId) : "-"}</TableCell>
                                                    <TableCell className="p-4 md:p-4">
                                                        {/* Block / Unblock bottons */}
                                                        {[1, 2, 3].includes(selectedSo.status) && (
                                                            <>
                                                                {item.blockedQty !== item.qty && (
                                                                    <Button variant="outline"
                                                                        onClick={() => handleOpenBlockInventoryConfrimDialog(item, index)}
                                                                        className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-sm mr-2"
                                                                    > Block
                                                                    </Button>
                                                                )}
                                                                {item.blockedQty > 0 && (
                                                                    <Button variant="outline"
                                                                        onClick={() => handleOpenUnblockInventoryConfrimDialog(item, index)}
                                                                        className="w-[90px] border-slate-300/40 bg-slate-400/40 hover:bg-slate-400/40 text-sm"
                                                                    > Unblock
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                        {/* Generate Pick List */}
                                                        {[4].includes(selectedSo.status) && (
                                                            <Button variant="outline"
                                                                className="border-slate-100/40 bg-slate-400/40 hover:bg-slate-400/40 font-medium text-sm ml-2"
                                                                onClick={() => handlePickLocation(item)}
                                                            > Pick Location
                                                            </Button>
                                                        )}
                                                        {[5, 6, 7, 8].includes(selectedSo.status) && (
                                                            <Button className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium text-sm p-2 px-4"
                                                                onClick={() => handlePickLocationInHistory(item)}
                                                            > <Eye className="h-5 w-5 mr-2" /> Picklist
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {/* Footer */}
                                {[2, 3].includes(selectedSo.status) && (
                                    <>
                                        {/* Partially Block */}
                                        {selectedSo.status == 3 && (
                                            <div className="footer flex items-center justify-center border-t border-slate-200/60 pt-4">
                                                <Button onClick={() => setIsBlockApproveForPickListConfirmOpen(true)}
                                                    className="bg-darkblue text-white hover:bg-darkblue/90 rounded-lg px-8"
                                                > Approve For Picklist
                                                </Button>
                                            </div>
                                        )}
                                        {/* Block Completed */}
                                        {selectedSo.status == 2 && (
                                            <div className="footer flex items-center justify-center border-t border-slate-200/60 pt-4">
                                                <Button onClick={() => setIsPartialBlockApproveForPickListConfirmOpen(true)}
                                                    className="bg-darkblue text-white hover:bg-darkblue/90 rounded-lg px-8"
                                                > Approve For Picklist
                                                </Button>
                                            </div>
                                        )}
                                        
                                    </>
                                )}
                                {[4].includes(selectedSo.status) && (
                                    <>
                                        <div className="footer flex items-center justify-center border-t border-slate-200/60 pt-4">
                                            <Button disabled={!isAllSkuAssigned || isGeneratingPickList}
                                                onClick={() => setIsGenerateConfirmOpen(true)}
                                                className="bg-darkblue text-white hover:bg-darkblue/90 rounded-lg px-8"
                                            > {isGeneratingPickList ? "Generating.." : "Generate"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                                {[7].includes(selectedSo.status) && (
                                    <>
                                        <div className="footer flex items-center justify-center border-t border-slate-200/60 pt-4">
                                            <Button onClick={() => handleDispatched()}
                                                className="bg-darkblue text-white hover:bg-darkblue/90 rounded-lg px-8"
                                            > Dispatch
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}

            {/* ######################## Modals Start ######################## */}

            {/* SO Details Dialog */}
            <Dialog open={isViewDetailsDailogOpen}
                onOpenChange={(open) => {
                    setIsViewDetailsDailogOpen(open);
                    if (!open) {
                        setSelectedSo(null);
                    }
                }}
            >
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewDetailsDailogOpen(false)}
                    className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
                    <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
                        <DialogTitle>Sales Orders Details</DialogTitle>
                        <DialogDescription>View Sales Orders information and SKU Items</DialogDescription>
                    </DialogHeader>

                    {selectedSo && (
                        <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 mb-2 z-0">
                            {/* SO Information */}
                            <div className="bg-darkblue-foreground/10 rounded-lg  p-6  dark:bg-slate-800/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">SO Number</Label>
                                        <p className="text-sm">{selectedSo.soNumber}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Customer </Label>
                                        <p className="text-sm">{getVendorNameById(selectedSo.customerId)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">SO Date</Label>
                                        <p className="text-sm">{selectedSo.date ? formatDateOnly(selectedSo.date) : '-'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">SO Status</Label>
                                        <div className="text-sm">{getSoStatusBadge(selectedSo.status)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* SKU Items */}
                            {selectedSo.items && selectedSo.items.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium mb-4">SKU Items</h3>
                                    <div className="mt-4 rounded-md relative w-full overflow-auto">
                                        <Table className="min-w-[900px] dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]x:w-[4px] overflow-auto">
                                            <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                                <TableRow>
                                                    <TableHead className="max-w-[50px] min-w-[50px]">#</TableHead>
                                                    <TableHead className="min-w-[150px]">SKU Name</TableHead>
                                                    <TableHead className="max-w-[90px] min-w-[90px]">SKU Code</TableHead>
                                                    <TableHead className="max-w-[90px] min-w-[90px]">Quantity</TableHead>
                                                    <TableHead className="max-w-[90px] min-w-[90px]">Unit Price</TableHead>
                                                    <TableHead className="max-w-[90px] min-w-[90px]">Total Price</TableHead>
                                                    <TableHead className="max-w-[120px] min-w-[120px]">Description</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedSo.items.map((item: any, index: number) => (
                                                    <TableRow key={item.skuId} className={index % 2 === 0 ? "bg-muted/50" : "bg-background"}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{item?.skuId ? getSkuNameById(item?.skuId) : "-"}</TableCell>
                                                        <TableCell>{item?.skuId ? item?.skuCode : "-"}</TableCell>
                                                        <TableCell>{item.qty ? item.qty : "0"}</TableCell>
                                                        <TableCell>{item.unitPrice ? item.unitPrice : "0"}</TableCell>
                                                        <TableCell>{item.totalPrice ? item.totalPrice : "0"}</TableCell>
                                                        <TableCell>{item.description ? item.description : "-"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedSo?.status === 1 && (
                        <DialogFooter  className="px-2 md:px-6 py-4 gap-2">
                            <Button variant="default"
                                onClick={() => {
                                    setViewMode("form");
                                    setIsViewDetailsDailogOpen(false);
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive"
                                onClick={() => {deleteSO(selectedSo)}}
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete SO modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteDialogOpen(false)}
                    className="dark:bg-modal max-w-full sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Sales Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this sales order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSo && (
                        <div className="pb-4 pt-2">
                            <p className="text-sm/10 leading-[1.4] mb-3">
                                You are about to delete: <strong>{selectedSo.soNumber} (SO Number)</strong>
                            </p>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSO} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Block quantity conformation modal design */}
            <Dialog open={isBlockConfrimDialogOpen} onOpenChange={setIsBlockConfrimDialogOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsBlockConfrimDialogOpen(false)}
                    className="max-w-xl flex flex-col overflow-hidden rounded-xl p-0 gap-0">
                    <VisuallyHidden>
                        <DialogTitle>Block Quantity Confirmation</DialogTitle>
                    </VisuallyHidden>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 space-y-3 pt-6 mb-4">
                        <p className="text-xl font-semibold">Confirm Block Quantity</p>
                        <p className="text-sm text-neutral-500">
                            Are you sure you want to block this product quantity? <br />
                            You can review or change the quantity below before confirming.
                        </p>
                        <div>
                            <Input type="text" placeholder="Enter Qty."
                                onChange={(e) => setModalQty(Number(e.target.value))} value={modalQty}
                                onKeyDown={(e) => {
                                    const allowedKeys = [ "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "." ];
                                    if ( !/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                inputMode="decimal" className="h-12 rounded-md border border-input"
                            />
                        </div>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                        <Button onClick={handleConfirmBlock} disabled={isBlockConfrimBtnLoading}>
                            {isBlockConfrimBtnLoading ? "Blocking..." : "Yes, Block Now"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* UnBlock quantity conformation modal design */}
            <Dialog open={isUnblockConfrimDialogOpen} onOpenChange={setIsUnblockConfrimDialogOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsUnblockConfrimDialogOpen(false)}
                    className="max-w-xl flex flex-col overflow-hidden rounded-xl scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
                    <VisuallyHidden>
                        <DialogTitle>Confirm Unblock Quantity</DialogTitle>
                    </VisuallyHidden>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] space-y-3 pt-6 z-0 mb-4">
                        <p className="text-xl font-semibold">Confirm Unblock Quantity</p>
                        <p className="text-sm text-neutral-500">Are you sure you want to release the blocked quantity?<br></br>
                            You can update the quantity below if you'd like to release a different amount.
                        </p>
                        <div>
                            <Input type="text" placeholder="Enter Qty."
                                onChange={(e) => setModalQty(Number(e.target.value))} value={modalQty}
                                onKeyDown={(e) => {
                                    const allowedKeys = [ "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "." ];
                                    if ( !/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                inputMode="decimal" className="h-12 rounded-md border border-input"
                            />
                        </div>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                        <Button onClick={handleConfirmUnblock} disabled={isUnblockConfrimBtnLoading}>
                            {isUnblockConfrimBtnLoading ? "Unblocking..." : "Yes, Unblock Now"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generate Pick list (Pick Locations) */}
            <Dialog open={isPickListDialogOpen} onOpenChange={setIsPickListDialogOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsPickListDialogOpen(false)}
                    className="max-w-4xl h-[90dvh] flex flex-col p-0 gap-0">
                    <VisuallyHidden>
                        <DialogTitle>Pick Location</DialogTitle>
                    </VisuallyHidden>
                    <DialogHeader className="bg-slate-200/40 dark:bg-slate-700 px-6 pt-6 pb-6 border-b">
                        <h2 className="text-2xl font-semibold">
                            {getSkuNameById(selectedSkuItem?.skuId)} [{selectedSkuItem?.skuCode}]
                        </h2>
                        <p className="text-sm text-gray-400">Blocked: {selectedSkuItem?.blockedQty} Qty</p>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-6 pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Manufacture Date</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Available Qty</TableHead>
                                    <TableHead>Pick Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedSkuInventory.map((inv, idx) => {
                                    const highlight = Number(pickQuantities[idx]) > 0;
                                    return (
                                    <TableRow key={inv.id || idx} className={highlight ? "bg-green-100 dark:bg-green-900/40" : ""}>
                                        <TableCell>{formatDateOnly(inv.date)}</TableCell>
                                        <TableCell>{getLocationTagNameById(inv.locationId)}</TableCell>
                                        <TableCell>{inv.availableQty}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                onKeyDown={(e) => {
                                                    const allowedKeys = [
                                                        "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", ".", // dot for decimal
                                                    ];
                                                    if (
                                                        !/[0-9]/.test(e.key) &&
                                                        !allowedKeys.includes(e.key)
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                value={pickQuantities[idx] ?? ""} // ✅ fallback to empty string
                                                onChange={(e) => handlePickQtyChange(idx, inv, e.target.value)}
                                                inputMode="decimal"
                                                className="h-12"
                                            />

                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* Assign Person */}
                        <div className="py-4" ref={assignPersonDropdownRef}>
                            <p className="text-sm mb-2">
                                Based on your selected date and quantity, choose a person from the list below to handle the picking of this stock.
                            </p>
                            <Select
                                value={assignedPerson?.id || ""}
                                onValueChange={(val) => {
                                    const user = users.find((u) => u.id === val);
                                    if (user) handleAssignPerson(user.id, user.fullName);
                                }}
                            >
                                <SelectTrigger className="w-[180px] h-12">
                                    <SelectValue placeholder="Assign Person" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                            <SelectItem key={user.id} value={user.id} className="py-2.5">
                                                {user.fullName}
                                            </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-muted-foreground text-sm">
                                            No users found
                                            </div>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveSkuPick}>Pick & Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generate pick list conformation modal */}
            <Dialog open={isGenerateConfirmOpen} onOpenChange={setIsGenerateConfirmOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsGenerateConfirmOpen(false)} className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Generate Pick List</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to generate the pick list?  
                            Once confirmed, the process will be initiated and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsGenerateConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                setIsGenerateConfirmOpen(false);
                                await generatePickList();
                            }}
                        > Yes, Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Pick list modal design */}
            <Dialog open={isViewPickListDialogOpen} onOpenChange={setIsViewPickListDialogOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewPickListDialogOpen(false)}
                    className="max-w-3xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 [&>button]:hidden">
                    {/* Hidden for visual, but keeps screen readers happy */}
                    <VisuallyHidden>
                        <DialogTitle>View Pick list</DialogTitle>
                    </VisuallyHidden>
                    <DialogHeader className="bg-slate-200/40 dark:bg-slate-700 px-2 md:px-6 pt-6 pb-6 border-b">
                        <div className="flex items-start justify-between lh-n">
                            <div className="space-y-[0.8">
                                <h2 className="text-2xl font-semibold">
                                    {getSkuNameById(selectedSkuItem?.skuId)} [{selectedSkuItem?.skuCode}]
                                </h2>
                                <p className="text-sm text-gray-400">Blocked: {selectedSkuItem?.blockedQty} Qty</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-6 z-0">
                        <Table className="table-auto">
                            <TableHeader className="text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                <TableRow className="">
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Manufacture Date</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Location</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Select Qty.</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Assign To</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Item Picked</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(viewPickList ?? [])
                                    .filter((pl: any) => selectedSkuItem?.skuId === pl.skuId)
                                    .map((pl: any, idx: number) => (
                                    pl.pickingLocations.map((loc: any, locIdx: number) => (
                                        <TableRow key={loc.id || `${pl.id}-${locIdx}`}>
                                            <TableCell className="p-4 md:p-4">{formatDateOnly(loc.date)}</TableCell>
                                            <TableCell className="p-4 md:p-4">{getLocationTagNameById(loc.locationId)}</TableCell>
                                            <TableCell className="p-4 md:p-4">{loc.qty}</TableCell>
                                            <TableCell className="p-4 md:p-4">{pl.assignToName}</TableCell>
                                            <TableCell className="p-4 md:p-4">
                                                {loc.pickedQty == loc.qty ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">Picked</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Clock className="h-5 w-5 text-yellow-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">Pending</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-1">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Dispatch Modal */}
            <Dialog open={isDispatchConfirmOpen} onOpenChange={setIsDispatchConfirmOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDispatchConfirmOpen(false)} className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Dispatch</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to dispatch this order?  
                            Once confirmed, the items will be marked as dispatched.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDispatchConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDispatch}>
                            Yes, Dispatch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Approval For Picklist Modal For Compeleted Block */}
            <Dialog open={isBlockApproveForPickListConfirmOpen} onOpenChange={setIsBlockApproveForPickListConfirmOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsBlockApproveForPickListConfirmOpen(false)} className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Approve For Picklist</DialogTitle>
                        <DialogDescription>
                            <span className="text-sm text-neutral-500">
                            Are you sure you want to approve for generate picklist? <br /><br />
                            <strong>Info:</strong> You have successfully blocked the full quantity for this Sales Order.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsBlockApproveForPickListConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmApproveForPickList}>
                            {isApproving ? "Approving..." : "Yes, Approve"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confrim Approval For Picklist Modal For Uncompleted Block */}
            <Dialog open={isPartialBlockApproveForPickListConfirmOpen} onOpenChange={setIsPartialBlockApproveForPickListConfirmOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsPartialBlockApproveForPickListConfirmOpen(false)} className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center">
                                <AlertTriangle className="text-amber-500 w-5 h-5 mr-2" />  
                                Partial Block – Approve For Picklist
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            <span className="text-sm text-neutral-500">
                                This Sales Order has been <strong>partially blocked</strong>. 
                                Some items or quantities are still pending. <br /><br />
                                Approving the picklist now will proceed <strong>only with the blocked quantities</strong>.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    {/* Checkbox Section */}
                    <div className="flex items-start gap-2 my-4">
                        <input type="checkbox" id="partial-block-confirm" checked={isPartialBlockConfirmed} 
                            onChange={(e) => setIsPartialBlockConfirmed(e.target.checked)}  className="mt-1"
                        />
                        <label htmlFor="partial-block-confirm"  className="text-sm text-neutral-600 cursor-pointer">
                            I understand that the remaining unblocked quantities will not be included in this picklist.
                        </label>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" 
                            onClick={() => setIsPartialBlockApproveForPickListConfirmOpen(false)}
                        > Cancel
                        </Button>
                        <Button onClick={handleConfirmApproveForPickList} disabled={!isPartialBlockConfirmed}
                        > {isApproving ? "Approving..." : "Yes, Approve Partially SO"} 
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}