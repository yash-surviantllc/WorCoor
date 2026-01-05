"use client";

import { useEffect, useState } from "react";
import { Search, Database, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { notification } from '@/src/services/notificationService'
import { ConfirmDialog } from "@/modals/confrim-dailog/ConfirmDialog";

const tableFields: Record<string, string[]> = {
  "Org Unit": ["name", "description"],
  "User Type": ["name", "description"],
  "Skill Set": ["name", "description"],
  "Task Type": ["name", "description"],
  "Project Schedule": ["name", "description"],
  "Project Type": ["name", "description"],
  "Resource Type": ["name", "description"],
  "Resource Definition": ["name", "description", "typeId"],
  "SKU Category": ["name", "description"],
  "SKU Type": ["name", "description"],
  "Location Tag": ["name", "description"],
  "SKU Unit": ["name", "description"],
  "SKU Weight": ["name", "description"],
  "Quality Rating": ["name", "description"],
  "Asset Category": ["name", "description"],
  "Asset State": ["name", "description"],
  "Department": ["name", "description", "unitId"],
  "IP Address": ["name", "ipAddress", "description"],
  "Geo Location": ["unitId", "latitude", "longitude", "delimiter"],
  "Currency": ["name", "description", "currencyCode", "defaultFlag"],
  "Product Category": ["name", "description"],
  "SKU Supplier": ["name", "description"],
  "Module/Area": ["name", "description"],
  "Issue Category": ["name", "description"],
  "Supplier/Customer": ["name", "description", "type"]
};

export default function ReferenceDataPage() {
  const [referenceTables, setReferenceTables] = useState<any[]>([]);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isTableDataDialogOpen, setIsTableDataDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [newTable, setNewTable] = useState({ name: "", instanceName: "", description: "" });
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("view");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ tableId: string; entryId: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [units, setUnits] = useState<any[]>([]);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const types = [{ value: "1", label: "Supplier" }, { value: "2", label: "Customer" }, { value: "3", label: "Both" }];

  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    const fetchReferenceTables = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.post({
          path: api_url.worCoorService.referenceDataTable.list,
          isAuth: true,
          data: {
            ...getPaginatedRequestParams(page, pageSize),
            sortBy: { name: "asc" },
            searchText: searchTerm || undefined,
          },
        });

        const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
        const totalCount = response.data?.data?.total || 0;

        setReferenceTables((prev) => {
          const merged = [...prev, ...list];
          const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
          setHasMore(uniqueById.length < totalCount);
          return uniqueById;
        });
      } catch (error) {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) fetchReferenceTables();
  }, [page, pageSize, searchTerm, isAuthenticated]);

  useEffect(() => {
    setPage(0);
    setReferenceTables([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);

  // Table Entry Listing
  const handleRowDoubleClick = async (table: any) => {
    try {
      const response = await apiService.get({
        path: `${api_url.worCoorService.referenceDataTable.listTableEntry}/${table.id}`,
        isAuth: true
      });
      const dataList = Array.isArray(response.data?.data) ? response.data.data : [];
      setSelectedTable({
        ...table,
        data: dataList,
      });
      setIsTableDataDialogOpen(true);
      setActiveTab("view");
    } catch (error) {
      notification.error("Failed to fetch table entries.");
    }
  };

  // Get Units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await apiService.get({
          path: `${api_url.worCoorService.referenceDataTable.listTableEntry}/68565c5df70897486c46852e`, 
          isAuth: true,
        });
        setUnits(response.data?.data || []);
      } catch (error) {
        notification.error("Failed to load units.");
      }
    };
    if (isTableDataDialogOpen && (selectedTable?.name === "Geo Location" || selectedTable?.name === "Department")) {
      fetchUnits();
    }
  }, [isTableDataDialogOpen, selectedTable?.name]);

  const getUnitNameById = (id: string): string => {
    const unit = units.find(u => u.id === id);
    return unit ? unit.detail.name : "-";
  };

  // Get Resource Types
  useEffect(() => {
    const fetchResourceTypes = async () => {
      try {
        const response = await apiService.get({
          path: `${api_url.worCoorService.referenceDataTable.listTableEntry}/68565ddbf70897486c468537`, // resorce types table id 
          isAuth: true,
        });
        setResourceTypes(response.data?.data || []);
      } catch (error) {
        notification.error("Failed to load resource types.");
      }
    };
    if (isTableDataDialogOpen && selectedTable?.name === "Resource Definition") {
      fetchResourceTypes();
    }
  }, [isTableDataDialogOpen, selectedTable?.name]);

  const getResourceTypeNameById = (id: string): string => {
    const type = resourceTypes.find(rt => rt.id === id);
    return type ? type.detail.name : "-";
  };

  const getTypeLabel = (id: string) => {
    const match = types.find((item) => item.value == id);
    return match ? match.label : "-";
  }

  const handleAddTable = () => {
    if (!newTable.name || !newTable.instanceName) return;
    setIsAddTableDialogOpen(false);
    setNewTable({ name: "", instanceName: "", description: "" });
  };

  // Add Table Entry
  const renderFieldInput = (field: string) => {
    const value = formValues[field] || "";
    const hasError = fieldErrors[field];
    const onChange = (val: string) => {
      setFormValues({ ...formValues, [field]: val });
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    };
    const inputBaseClass = `h-12 rounded-md border ${hasError ? "border-red-500" : "border-input"} bg-white/100 dark:bg-slate-800/80 dark:border-slate-700`;
    // unitId select
    if (field === "unitId") {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={inputBaseClass}>
            <SelectValue placeholder="Select Unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.detail.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    // resourceTypeId
    if (field === "type") {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={inputBaseClass}>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    // resourceTypeId
    if (field === "typeId") {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={inputBaseClass}>
            <SelectValue placeholder="Select Resource Type" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((rt) => (
              <SelectItem key={rt.id} value={rt.id}>
                {rt.detail.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // defaultFlag select
    if (field === "defaultFlag") {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={inputBaseClass}>
            <SelectValue placeholder="Select Default Flag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // prcId select
    if (field === "prcId") {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={inputBaseClass}>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((type) => (
              <SelectItem key={type.Res_Type_ID} value={type.Res_Type_ID}>
                {type.Resource_Type_Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // default text input
    return (
      <Input id={field} value={value}
        onChange={(e) => {
          const inputVal = e.target.value;
          if (
            selectedTable?.name === "Geo Location" &&
            ["latitude", "longitude", "delimiter"].includes(field)
          ) {
            if (/^-?\d*\.?\d*$/.test(inputVal)) {
              onChange(inputVal);
            }
          } else {
            onChange(inputVal);
          }
        }}
        inputMode={
          selectedTable?.name === "Geo Location" &&
          ["latitude", "longitude", "delimiter"].includes(field)
            ? "decimal"
            : "text"
        }
        placeholder={`Enter ${formatFieldLabel(field)}`}
        className={inputBaseClass}
      />
    );
  };

  useEffect(() => {
    const fields = tableFields[selectedTable?.name] || [];
    const initialValues = fields.reduce((acc, key) => ({ ...acc, [key]: "" }), {});
    setFormValues(initialValues);
  }, [selectedTable]);

  // Add Table Entry
  const handleSubmitEntry = async () => {
    const requiredFields = tableFields[selectedTable?.name] || [];

    const newErrors: Record<string, boolean> = {};
    let hasError = false;

    const trimmedValues = { ...formValues };
    ["name", "description"].forEach((key) => {
      if (trimmedValues[key]) {
        trimmedValues[key] = trimmedValues[key].trim();
      }
    });

    requiredFields.forEach((field) => {
      if (!trimmedValues[field]) {
        newErrors[field] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setFieldErrors(newErrors);
      notification.error("Please fill in all required fields.");
      return;
    }
    setFieldErrors({});

    try {
      const response = await apiService.post({
        path: api_url.worCoorService.referenceDataTable.addTableEntry,
        isAuth: true,
        data: {
          id: selectedTable?.id,
          detail: {
            ...trimmedValues,
            ...(selectedTable?.name === "Geo Location" && {
              latitude: parseFloat(trimmedValues.latitude),
              longitude: parseFloat(trimmedValues.longitude),
              delimiter: parseFloat(trimmedValues.delimiter),
            }),
            ...(selectedTable?.name === "Supplier/Customer" && {
              type: parseInt(trimmedValues.type)
            })
          }
        }
      });

      if (response.data.status === "OK") {
        notification.success(response.data.message);

        const newItem = {
          id: response.data?.data,
          detail: { ...trimmedValues },
          active: true,
          dynamic: true
        };

        setSelectedTable((prev: any) => ({
          ...prev,
          data: [...(prev?.data || []), newItem],
        }));
        setFormValues({});
        setActiveTab("view");
      } else {
        notification.error(response.data.message);
      }
    } catch (error) {
      notification.error("Something went wrong. Please try again.");
    }
  };

  // Delete Table Entry
  const handleDeleteClick = (tableId: string, entryId: string) => {
    setDeleteTarget({ tableId, entryId });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { tableId, entryId } = deleteTarget;
    try {
      const response = await apiService.delete({
        path: `${api_url.worCoorService.referenceDataTable.deleteTableEntry}/${tableId}?eId=${entryId}`,
        isAuth: true,
      });
      if (response.data.status === "OK") {
        notification.success("Entry deleted successfully");
        setSelectedTable((prev: any) => ({
          ...prev,
          data: (prev?.data || []).filter((item: any) => item.id !== entryId),
        }));
      } else {
        notification.error(response.data.message || "Delete failed");
      }
    } catch (err) {
      notification.error("Failed to delete entry");
    }
  };

  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')                    
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const columnSpanMap: Record<string, number> = {
    "Geo Location": 4,
    "Currency": 5,
    "Department": 4,
    "Resource Definition": 4,
    "IP Address": 4
  };

  const defaultColSpan = 3;
  const colSpan = selectedTable?.name ? columnSpanMap[selectedTable.name] ?? defaultColSpan : defaultColSpan;

  if (isAuthLoading || !isAuthenticated) return null;

  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden">
      <div className="h-full referance-data flex flex-col gap-2">
        <div className="flex items-center pb-2 sm:pb-4">
          <PageHeader title="Reference Data Management" icon={Database}
            description="You are mapping this particular data with a database table. The database table name should be mentioned."
          />
        </div>

        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 bg-transparent sm:bg-white/80 backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="w-full md:w-auto flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                <Input type="search" placeholder="Search Table Name..." value={rawSearchTerm}
                  onChange={(e) => setRawSearchTerm(e.target.value)}
                  className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                />
              </div>
            </div>

            <div ref={scrollContainerRef}
                className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto"
              >
              <Table className="table-auto">
                {referenceTables.length === 0 ? (
                  <TableBody>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={5} className="text-center">
                          No tables found
                        </TableCell>
                      </TableRow>
                  </TableBody>
                  ) : (
                  <><TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                    <TableRow>
                      <TableHead className="text-black font-semibold whitespace-nowrap p-4 md:p-6">Table Name</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap p-4 md:p-6">Table Instance Name</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap p-4 md:p-6">Created By</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap p-4 md:p-6">Created On</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap p-4 md:p-6 min-w-[300px] w-[300px]">Description</TableHead>
                    </TableRow>
                  </TableHeader><TableBody>
                      {referenceTables.map((table) => (
                        <TableRow
                          key={table.id || `${table.name}-${table.instanceName}`}
                          className="cursor-pointer bg-muted/30"
                          onDoubleClick={() => handleRowDoubleClick(table)}
                        >
                          <TableCell className="font-medium whitespace-nowrap p-4 md:p-6">{table.name}</TableCell>
                          <TableCell className="p-4 md:p-6">{table.instanceName}</TableCell>
                          <TableCell className="whitespace-nowrap p-4 md:p-6">{table.createdByName || "Unknown"}</TableCell>
                          <TableCell className="whitespace-nowrap p-4 md:p-6">{table.createdAt ? new Date(table.createdAt).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="p-4 md:p-6">{table.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody></>
                )
                  }
                <TableCaption>Double click on a row to open the table and add new data into it.</TableCaption>
              </Table>
            </div>
          </div>
        </div>

        {/* Add Table Dialog */}
        <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsAddTableDialogOpen(false)}
              className="max-w-3xl md:max-h-[85dvh] min-h-[85dvh] md:h-[85dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 data-[state=open]:animate-pure-fade data-[state=closed]:animate-none">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Add New Reference Table</DialogTitle>
              <DialogDescription>Create a new reference data table for the system.</DialogDescription>
            </DialogHeader>
            <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
              <div className="grid gap-2">
                <Label htmlFor="table-name">Table Name</Label>
                <Input
                  id="table-name"
                  placeholder="Enter table name"
                  className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instance-name">Table Instance Name</Label>
                <Input
                  id="instance-name"
                  placeholder="Enter instance name (e.g., skill_type)"
                  className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                  value={newTable.instanceName}
                  onChange={(e) => setNewTable({ ...newTable, instanceName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter table description"
                  className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                  value={newTable.description}
                  onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="px-2 md:px-6 py-4 gap-2">
              <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTable} disabled={!newTable.name || !newTable.instanceName}>
                Add Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table Data Dialog - Dynamic Add Entry */}
        <Dialog open={isTableDataDialogOpen} onOpenChange={setIsTableDataDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsTableDataDialogOpen(false)}
            className="max-w-3xl md:max-h-[85dvh] min-h-[85dvh] md:h-[85dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 data-[state=open]:animate-pure-fade data-[state=closed]:animate-none">
              <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
                <DialogTitle>{selectedTable?.name}</DialogTitle>
                <DialogDescription>View and manage data in the {selectedTable?.name} table.</DialogDescription>
              </DialogHeader>
              <div className="h-full space-y-2 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}></Tabs>
                {/* Add Table Entries */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="w-full flex justify-center">
                    <TabsList className="w-full flex justify-start h-14 bg-gray-200 p-0 dark:bg-gray-900 overflow-y-auto rounded-xl dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  scrollbar-thumb-hover dark-scrollbar-thumb-hover dark:[&::-webkit-scrollbar]y:w-[4px] [&::-webkit-scrollbar]:h-[2px]">
                      <TabsTrigger className="w-full h-fill-available transition-transform rounded-lg m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="view">View Data</TabsTrigger>
                      <TabsTrigger className="w-full h-fill-available transition-transform rounded-lg m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="add">Add New Entry</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="view" className="py-4">
                    {/* <div className="rounded-md h-[calc(80vh-230px)] overflow-auto scroll-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"> */}
                      <Table>
                        <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                          <TableRow>
                            {selectedTable?.name !== "Geo Location" ? (
                              <>
                                <TableHead className="text-black font-semibold whitespace-nowrap max-w-[100px] w-[100px]">Name</TableHead>
                                {selectedTable?.name === "Currency" && (
                                  <>
                                    <TableHead className="text-black font-semibold whitespace-nowrap">Currency Code</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap">Default Flag</TableHead>
                                  </>
                                )}
                                {selectedTable?.name === "Department" && (
                                  <TableHead className="text-black font-semibold whitespace-nowrap">Mapped Unit</TableHead>
                                )}
                                {selectedTable?.name === "Resource Definition" && (
                                  <TableHead className="text-black font-semibold whitespace-nowrap">Resource Type</TableHead>
                                )}
                                {selectedTable?.name === "IP Address" && (
                                  <TableHead className="text-black font-semibold whitespace-nowrap">IP Address</TableHead>
                                )}
                                {selectedTable?.name === "Supplier/Customer" && (
                                  <TableHead className="text-black font-semibold whitespace-nowrap">Type</TableHead>
                                )}
                                <TableHead className="text-black font-semibold whitespace-nowrap min-w-[300px] md:min-w-[250px]">Description</TableHead>
                              </>
                            ) : (
                              <>
                                <TableHead className="text-black font-semibold whitespace-nowrap">Org Unit</TableHead>
                                <TableHead className="text-black font-semibold whitespace-nowrap">Latitude</TableHead>
                                <TableHead className="text-black font-semibold whitespace-nowrap">Longitude</TableHead>
                                <TableHead className="text-black font-semibold whitespace-nowrap">Delimiter (Meter)</TableHead>
                              </>
                            )}

                            <TableHead className="w-[50px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTable?.data?.length > 0 ? (
                            selectedTable.data.map((item: any, index: number) => (
                              <TableRow key={index} className="bg-muted/30">
                                {/* Only show Name if not Geo Location */}
                                {selectedTable.name !== "Geo Location" && (
                                  <TableCell className="whitespace-nowrap text-[14px] p-4 md:p-6">{item.detail.name}</TableCell>
                                )}

                                {/* Conditional fields */}
                                {selectedTable.name === "Currency" && (
                                  <>
                                    <TableCell className="text-[14px] p-4 md:p-6">{item.detail.currencyCode}</TableCell>
                                    <TableCell className="text-[14px] p-4 md:p-6">{item.detail.defaultFlag}</TableCell>
                                  </>
                                )}

                                {selectedTable.name === "Department" && (
                                  <TableCell className="text-[14px] p-4 md:p-6">{getUnitNameById(item.detail.unitId)}</TableCell>
                                )}

                                {selectedTable.name === "Geo Location" && (
                                  <>
                                    <TableCell className="text-[14px] p-4 md:p-6">{getUnitNameById(item.detail.unitId)}</TableCell>
                                    <TableCell className="text-[14px] p-4 md:p-6">{item.detail.latitude}</TableCell>
                                    <TableCell className="text-[14px] p-4 md:p-6">{item.detail.longitude}</TableCell>
                                    <TableCell className="text-[14px] p-4 md:p-6">{item.detail.delimiter ? item.detail.delimiter : "-"}</TableCell>
                                  </>
                                )}

                                {selectedTable.name === "Resource Definition" && (
                                  <TableCell className="text-[14px] p-4 md:p-6">{getResourceTypeNameById(item.detail.typeId)}</TableCell>
                                )}

                                {selectedTable.name === "IP Address" && (
                                  <TableCell className="text-[14px] p-4 md:p-6">{item.detail.ipAddress}</TableCell>
                                )}

                                {selectedTable.name === "Supplier/Customer" && (
                                  <TableCell className="text-[14px] p-4 md:p-6">{getTypeLabel(item.detail.type)}</TableCell>
                                )}

                                {/* Description only if not Geo Location */}
                                {selectedTable.name !== "Geo Location" && (
                                  <TableCell className="text-[14px] p-4 md:p-6">{item.detail.description}</TableCell>
                                )}

                                <TableCell className="text-[14px] p-4 md:p-6">
                                  <div className="h-full w-full flex align-middle justify-center">
                                    {item.dynamic ? (
                                      <Trash
                                        className="h-4 w-4 cursor-pointer block"
                                        onClick={() => handleDeleteClick(selectedTable?.id, item.id)}
                                      />
                                    ) : (
                                      <span>-</span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={colSpan} className="text-center">
                                No data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    {/* </div> */}
                  </TabsContent>
                  <TabsContent value="add" className="py-4">
                    <div className="grid gap-4">
                      {(tableFields[selectedTable?.name] || []).map((field) => (
                        <div key={field} className="grid gap-2">
                          <Label htmlFor={field}>{formatFieldLabel(field)}</Label>
                          {renderFieldInput(field)}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleSubmitEntry} className="bg-darkblue-foreground text-white h-10 px-8">Submit</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Entry Modal */}
        <ConfirmDialog open={deleteConfirmOpen} setOpen={setDeleteConfirmOpen}
          title="Confirm Deletion"
          description="Are you sure you want to delete this entry? This action cannot be undone."
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
