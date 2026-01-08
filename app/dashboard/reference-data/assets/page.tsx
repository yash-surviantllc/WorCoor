"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Sample asset data
const initialAssets = [
  {
    id: 1,
    name: "CNC Machine - Model X500",
    assetNumber: "MACH-001",
    category: "Manufacturing Equipment",
    location: "Factory Floor - Zone A",
    department: "Production",
    purchaseDate: "2022-05-15",
    purchaseValue: 75000,
    currentValue: 65000,
    condition: "Good",
    status: "In Use",
    assignedTo: "John Smith",
    maintenanceSchedule: "Quarterly",
    lastMaintenance: "2023-09-10",
    nextMaintenance: "2023-12-10",
    description: "High-precision CNC machine for metal cutting and shaping.",
    notes: "Requires specialized training to operate. Maintenance manual stored in digital library.",
  },
  {
    id: 2,
    name: "Forklift - Toyota 8FGU25",
    assetNumber: "FORK-002",
    category: "Material Handling Equipment",
    location: "Warehouse - Section B",
    department: "Logistics",
    purchaseDate: "2021-08-22",
    purchaseValue: 35000,
    currentValue: 28000,
    condition: "Good",
    status: "In Use",
    assignedTo: "Sarah Johnson",
    maintenanceSchedule: "Monthly",
    lastMaintenance: "2023-10-05",
    nextMaintenance: "2023-11-05",
    description: "5,000 lb capacity forklift for warehouse operations.",
    notes: "Operator certification required. Daily inspection checklist must be completed before use.",
    parentResource: "R-003", // for the forklift asset
  },
  {
    id: 3,
    name: "Industrial 3D Printer - Ultimaker S5",
    assetNumber: "PRINT-003",
    category: "Manufacturing Equipment",
    location: "R&D Lab - Room 105",
    department: "Research & Development",
    purchaseDate: "2023-01-10",
    purchaseValue: 12000,
    currentValue: 11000,
    condition: "Excellent",
    status: "In Use",
    assignedTo: "Michael Chen",
    maintenanceSchedule: "Bi-monthly",
    lastMaintenance: "2023-09-15",
    nextMaintenance: "2023-11-15",
    description: "Dual-extrusion 3D printer for prototyping and small-scale production.",
    notes: "Requires specialized filament. Calibration procedure documented in asset manual.",
  },
  {
    id: 4,
    name: "Delivery Van - Ford Transit",
    assetNumber: "VEH-004",
    category: "Vehicles",
    location: "Parking Lot - Space 12",
    department: "Logistics",
    purchaseDate: "2020-11-05",
    purchaseValue: 42000,
    currentValue: 28000,
    condition: "Fair",
    status: "In Use",
    assignedTo: "Robert Davis",
    maintenanceSchedule: "Every 5,000 miles",
    lastMaintenance: "2023-08-20",
    nextMaintenance: "2023-11-20",
    description: "Cargo van for local deliveries and pickups.",
    notes: "Valid driver's license required. Scheduled for body repair next month.",
  },
  {
    id: 5,
    name: "Automated Packaging System - PackBot 2000",
    assetNumber: "PACK-005",
    category: "Manufacturing Equipment",
    location: "Factory Floor - Zone C",
    department: "Production",
    purchaseDate: "2022-03-18",
    purchaseValue: 85000,
    currentValue: 72000,
    condition: "Good",
    status: "In Use",
    assignedTo: "Team Lead - Packaging",
    maintenanceSchedule: "Monthly",
    lastMaintenance: "2023-10-02",
    nextMaintenance: "2023-11-02",
    description: "Fully automated packaging system for finished products.",
    notes: "Requires specialized maintenance technician. Spare parts inventory maintained on-site.",
  },
  {
    id: 6,
    name: "Quality Testing Equipment - Spectrophotometer",
    assetNumber: "TEST-006",
    category: "Testing Equipment",
    location: "Quality Lab - Room 203",
    department: "Quality Assurance",
    purchaseDate: "2021-12-05",
    purchaseValue: 28000,
    currentValue: 24000,
    condition: "Excellent",
    status: "In Use",
    assignedTo: "Lisa Wong",
    maintenanceSchedule: "Quarterly",
    lastMaintenance: "2023-07-15",
    nextMaintenance: "2023-10-15",
    description: "High-precision color measurement device for quality control.",
    notes: "Requires calibration before each use. Calibration standards stored in secure cabinet.",
  },
  {
    id: 7,
    name: "Industrial Air Compressor - Atlas Copco GA30+",
    assetNumber: "COMP-007",
    category: "Facility Equipment",
    location: "Utility Room - Building 2",
    department: "Facilities",
    purchaseDate: "2019-06-20",
    purchaseValue: 22000,
    currentValue: 15000,
    condition: "Fair",
    status: "In Use",
    assignedTo: "Facilities Team",
    maintenanceSchedule: "Monthly",
    lastMaintenance: "2023-10-08",
    nextMaintenance: "2023-11-08",
    description: "30 kW rotary screw compressor for facility air supply.",
    notes: "Scheduled for major overhaul in Q1 2024. Backup unit available if needed.",
  },
  {
    id: 8,
    name: "Server Rack - Dell PowerEdge",
    assetNumber: "IT-008",
    category: "IT Equipment",
    location: "Server Room - Building 1",
    department: "IT",
    purchaseDate: "2022-09-12",
    purchaseValue: 45000,
    currentValue: 40000,
    condition: "Excellent",
    status: "In Use",
    assignedTo: "IT Department",
    maintenanceSchedule: "Quarterly",
    lastMaintenance: "2023-09-01",
    nextMaintenance: "2023-12-01",
    description: "Primary server infrastructure for manufacturing operations.",
    notes: "Redundant power and cooling systems. Access restricted to authorized IT personnel only.",
  },
]

// Sample categories with IDs
const assetCategories = [
  { label: "Lifting Machine", value: "Lifting Machine", id: "ASC-001" },
  { label: "Transfortation Asset", value: "Transfortation Asset", id: "ASC-002" },
  { label: "Manifacturing Machine", value: "Manifacturing Machine", id: "ASC-003" },
  { label: "Equipement", value: "Equipement", id: "ASC-004" },
  { label: "Tool", value: "Tool", id: "ASC-005" },
  { label: "IT Asset", value: "IT Asset", id: "ASC-006" },
  { label: "Office Asset", value: "Office Asset", id: "ASC-007" },
]

// Sample departments
const departments = [
  { label: "Production", value: "Production" },
  { label: "Logistics", value: "Logistics" },
  { label: "Research & Development", value: "Research & Development" },
  { label: "Quality Assurance", value: "Quality Assurance" },
  { label: "Facilities", value: "Facilities" },
  { label: "IT", value: "IT" },
  { label: "Administration", value: "Administration" },
  { label: "Human Resources", value: "Human Resources" },
]

// Sample locations
const locations = [
  { label: "Factory Floor - Zone A", value: "Factory Floor - Zone A" },
  { label: "Factory Floor - Zone B", value: "Factory Floor - Zone B" },
  { label: "Factory Floor - Zone C", value: "Factory Floor - Zone C" },
  { label: "Warehouse - Section A", value: "Warehouse - Section A" },
  { label: "Warehouse - Section B", value: "Warehouse - Section B" },
  { label: "R&D Lab - Room 105", value: "R&D Lab - Room 105" },
  { label: "Quality Lab - Room 203", value: "Quality Lab - Room 203" },
  { label: "Utility Room - Building 2", value: "Utility Room - Building 2" },
  { label: "Server Room - Building 1", value: "Server Room - Building 1" },
  { label: "Parking Lot", value: "Parking Lot" },
]

// Sample conditions
const conditions = [
  { label: "Excellent", value: "Excellent" },
  { label: "Good", value: "Good" },
  { label: "Fair", value: "Fair" },
  { label: "Poor", value: "Poor" },
  { label: "Non-functional", value: "Non-functional" },
]

// Sample statuses
const statuses = [
  { label: "In Use", value: "In Use" },
  { label: "In Storage", value: "In Storage" },
  { label: "Under Maintenance", value: "Under Maintenance" },
  { label: "Out of Service", value: "Out of Service" },
  { label: "Disposed", value: "Disposed" },
]

// Sample maintenance schedules
const maintenanceSchedules = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Bi-weekly", value: "Bi-weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Bi-monthly", value: "Bi-monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Semi-annually", value: "Semi-annually" },
  { label: "Annually", value: "Annually" },
  { label: "Every 5,000 miles", value: "Every 5,000 miles" },
  { label: "Every 10,000 miles", value: "Every 10,000 miles" },
  { label: "As needed", value: "As needed" },
]

// Sample parent resources
const parentResources = [
  { id: "R-001", name: "Pallets", type: "Asset", specification: "" },
  { id: "R-002", name: "Crates", type: "Asset", specification: "" },
  { id: "R-003", name: "Forklift Machine", type: "Asset", specification: "" },
  { id: "R-004", name: "Crane", type: "Asset", specification: "" },
  { id: "R-005", name: "Packaging Material", type: "SKU", specification: "" },
  { id: "R-006", name: "RAW Material", type: "SKU", specification: "" },
  { id: "R-007", name: "Laptop", type: "Asset", specification: "" },
  { id: "R-008", name: "Tables", type: "Asset", specification: "" },
  { id: "R-009", name: "Miscellaneous", type: "SKU", specification: "" },
]

// Form schema for adding/editing an asset
const assetFormSchema = z.object({
  name: z.string().min(2, {
    message: "Asset name is required.",
  }),
  assetNumber: z.string().min(1, {
    message: "Asset number is required.",
  }),
  assetCode: z.string().min(1, {
    message: "Asset code is required.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  location: z.string({
    required_error: "Please select a location.",
  }),
  department: z.string({
    required_error: "Please select a department.",
  }),
  purchaseDate: z.string().min(1, {
    message: "Purchase date is required.",
  }),
  purchaseValue: z.coerce.number().min(0, {
    message: "Purchase value must be a positive number.",
  }),
  currentValue: z.coerce.number().min(0, {
    message: "Current value must be a positive number.",
  }),
  condition: z.string({
    required_error: "Please select a condition.",
  }),
  status: z.string({
    required_error: "Please select a status.",
  }),
  assignedTo: z.string().optional(),
  parentResource: z.string().optional(),
  maintenanceSchedule: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>

// Form schema for recording maintenance
const maintenanceFormSchema = z.object({
  maintenanceDate: z.string().min(1, {
    message: "Maintenance date is required.",
  }),
  maintenanceType: z.enum(["Preventive", "Corrective", "Repair", "Inspection"]),
  performedBy: z.string().min(1, {
    message: "Performed by is required.",
  }),
  cost: z.coerce.number().min(0, {
    message: "Cost must be a positive number.",
  }),
  notes: z.string().optional(),
})

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

export default function AssetManagementPage() {
  const [assets, setAssets] = useState(initialAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingAsset, setEditingAsset] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)

  const itemsPerPage = 5

  // Initialize form
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      assetNumber: "",
      assetCode: "",
      category: "",
      location: "",
      department: "",
      purchaseDate: "",
      purchaseValue: 0,
      currentValue: 0,
      condition: "",
      status: "",
      assignedTo: "",
      parentResource: "",
      maintenanceSchedule: "",
      lastMaintenance: "",
      nextMaintenance: "",
      description: "",
      notes: "",
    },
  })

  // Initialize maintenance form
  const maintenanceForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      maintenanceDate: new Date().toISOString().split("T")[0],
      maintenanceType: "Preventive",
      performedBy: "",
      cost: 0,
      notes: "",
    },
  })

  // Sort function
  const sortedAssets = [...assets]
  if (sortConfig !== null) {
    sortedAssets.sort((a, b) => {
      // Safely access the sort key with null checks
      const aValue = sortConfig ? a[sortConfig.key as keyof typeof a] : null;
      const bValue = sortConfig ? b[sortConfig.key as keyof typeof b] : null;
      
      // Use strict equality checks to handle null/undefined values safely
      if (aValue === null || bValue === null) return 0;
      
      // Convert to strings for comparison to avoid type issues
      const aStr = String(aValue);
      const bStr = String(bValue);
      
      if (aStr < bStr) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aStr > bStr) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // Request sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Filter assets based on search term, category filter, department filter, and status filter
  const filteredAssets = sortedAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter
    const matchesDepartment = departmentFilter === "All" || asset.department === departmentFilter
    const matchesStatus = statusFilter === "All" || asset.status === statusFilter
    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus
  })

  // Paginate assets
  const indexOfLastAsset = currentPage * itemsPerPage
  const indexOfFirstAsset = indexOfLastAsset - itemsPerPage
  const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset)
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Handle adding a new asset
  const handleAddAsset = (data: AssetFormValues) => {
    const id = assets.length > 0 ? Math.max(...assets.map((asset) => asset.id)) + 1 : 1
    // Ensure all optional string fields have default values to prevent type errors
    const assetData = {
      id,
      ...data,
      assignedTo: data.assignedTo || "", // Provide default empty string if undefined
      maintenanceSchedule: data.maintenanceSchedule || "",
      lastMaintenance: data.lastMaintenance || "",
      nextMaintenance: data.nextMaintenance || "",
      notes: data.notes || "",
      description: data.description || "", // Fix description type error
      status: data.status || "New" // Provide default status
    }
    
    setAssets([
      ...assets,
      assetData,
    ])
    setIsAddDialogOpen(false)
    form.reset()

    toast({
      title: "Asset Added",
      description: `${data.name} has been added successfully.`,
    })
  }

  // Handle editing an asset
  const handleEditAsset = (data: AssetFormValues) => {
    if (!editingAsset) return

    setAssets(
      assets.map((asset) =>
        asset.id === editingAsset.id
          ? {
              ...asset,
              ...data,
            }
          : asset,
      ),
    )
    setIsEditDialogOpen(false)

    toast({
      title: "Asset Updated",
      description: `${data.name} has been updated successfully.`,
    })
  }

  // Handle deleting an asset
  const handleDeleteAsset = () => {
    if (!editingAsset) return

    setAssets(assets.filter((asset) => asset.id !== editingAsset.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Asset Deleted",
      description: `${editingAsset.name} has been deleted successfully.`,
    })
  }

  // Handle recording maintenance
  const handleRecordMaintenance = (data: MaintenanceFormValues) => {
    if (!editingAsset) return

    const today = new Date().toISOString().split("T")[0]
    const nextMaintenanceDate = calculateNextMaintenanceDate(today, editingAsset.maintenanceSchedule)

    setAssets(
      assets.map((asset) =>
        asset.id === editingAsset.id
          ? {
              ...asset,
              lastMaintenance: data.maintenanceDate,
              nextMaintenance: nextMaintenanceDate,
              condition: data.maintenanceType === "Repair" ? "Good" : asset.condition,
              status: data.maintenanceType === "Repair" ? "In Use" : asset.status,
            }
          : asset,
      ),
    )
    setIsMaintenanceDialogOpen(false)

    toast({
      title: "Maintenance Recorded",
      description: `Maintenance for ${editingAsset.name} has been recorded successfully.`,
    })
  }

  // Calculate next maintenance date based on schedule
  const calculateNextMaintenanceDate = (currentDate: string, schedule: string) => {
    const date = new Date(currentDate)

    switch (schedule) {
      case "Daily":
        date.setDate(date.getDate() + 1)
        break
      case "Weekly":
        date.setDate(date.getDate() + 7)
        break
      case "Bi-weekly":
        date.setDate(date.getDate() + 14)
        break
      case "Monthly":
        date.setMonth(date.getMonth() + 1)
        break
      case "Bi-monthly":
        date.setMonth(date.getMonth() + 2)
        break
      case "Quarterly":
        date.setMonth(date.getMonth() + 3)
        break
      case "Semi-annually":
        date.setMonth(date.getMonth() + 6)
        break
      case "Annually":
        date.setFullYear(date.getFullYear() + 1)
        break
      default:
        // For mileage-based or as-needed, add 3 months as a default
        date.setMonth(date.getMonth() + 3)
    }

    return date.toISOString().split("T")[0]
  }

  // Open edit dialog and set form values
  const openEditDialog = (asset: any) => {
    setEditingAsset(asset)
    form.reset({
      name: asset.name,
      assetNumber: asset.assetNumber,
      assetCode: asset.assetCode || "",
      category: asset.category,
      location: asset.location,
      department: asset.department,
      purchaseDate: asset.purchaseDate,
      purchaseValue: asset.purchaseValue,
      currentValue: asset.currentValue,
      condition: asset.condition,
      status: asset.status,
      assignedTo: asset.assignedTo,
      parentResource: asset.parentResource,
      maintenanceSchedule: asset.maintenanceSchedule,
      lastMaintenance: asset.lastMaintenance,
      nextMaintenance: asset.nextMaintenance,
      description: asset.description,
      notes: asset.notes,
    })
    setIsEditDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (asset: any) => {
    setEditingAsset(asset)
    setIsViewDialogOpen(true)
  }

  // Open maintenance dialog
  const openMaintenanceDialog = (asset: any) => {
    setEditingAsset(asset)
    maintenanceForm.reset({
      maintenanceDate: new Date().toISOString().split("T")[0],
      maintenanceType: "Preventive",
      performedBy: "",
      cost: 0,
      notes: "",
    })
    setIsMaintenanceDialogOpen(true)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Use":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            In Use
          </span>
        )
      case "In Storage":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            In Storage
          </span>
        )
      case "Under Maintenance":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            Under Maintenance
          </span>
        )
      case "Out of Service":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Out of Service
          </span>
        )
      case "Disposed":
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
            Disposed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
            {status}
          </span>
        )
    }
  }

  // Get condition badge
  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "Excellent":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            Excellent
          </span>
        )
      case "Good":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            Good
          </span>
        )
      case "Fair":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            Fair
          </span>
        )
      case "Poor":
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
            Poor
          </span>
        )
      case "Non-functional":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Non-functional
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
            {condition}
          </span>
        )
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  // Calculate total asset value
  const calculateTotalAssetValue = () => {
    return assets.reduce((total, asset) => total + asset.currentValue, 0)
  }

  // Count assets by status
  const countAssetsByStatus = (status: string) => {
    return assets.filter((asset) => asset.status === status).length
  }

  // Count assets by category
  const countAssetsByCategory = (category: string) => {
    return assets.filter((asset) => asset.category === category).length
  }

  // Count assets requiring maintenance
  const countAssetsRequiringMaintenance = () => {
    const today = new Date()
    const nextMonth = new Date()
    nextMonth.setMonth(today.getMonth() + 1)

    return assets.filter((asset) => {
      if (!asset.nextMaintenance) return false
      const maintenanceDate = new Date(asset.nextMaintenance)
      return maintenanceDate <= nextMonth && asset.status !== "Disposed"
    }).length
  }

  // Handle double-click on asset row
  const handleAssetRowDoubleClick = (asset: any) => {
    openEditDialog(asset)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Asset</DialogTitle>
              <DialogDescription>Add a new asset to the inventory system.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAsset)} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="financial">Financial Details</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter asset name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="assetNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter asset number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="assetCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter alphanumeric asset code" {...field} />
                          </FormControl>
                          <FormDescription>Enter a unique alphanumeric code for this asset.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assetCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((department) => (
                                  <SelectItem key={department.value} value={department.value}>
                                    {department.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location.value} value={location.value}>
                                    {location.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {conditions.map((condition) => (
                                  <SelectItem key={condition.value} value={condition.value}>
                                    {condition.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter person or department assigned to this asset" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentResource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Resource</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select parent resource" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              {parentResources.map((resource) => (
                                <SelectItem key={resource.id} value={resource.id}>
                                  {resource.name} ({resource.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a parent resource if this asset is part of a larger resource group.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter asset description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="financial" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="purchaseDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purchase Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="purchaseValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purchase Value</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="currentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Value</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>
                            The current estimated value of the asset after depreciation.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any additional notes about this asset" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="maintenance" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="maintenanceSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select maintenance schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maintenanceSchedules.map((schedule) => (
                                <SelectItem key={schedule.value} value={schedule.value}>
                                  {schedule.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lastMaintenance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Maintenance Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nextMaintenance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next Maintenance Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Asset Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Asset</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this asset? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {editingAsset && (
              <div className="py-4">
                <p>
                  You are about to delete: <strong>{editingAsset.name}</strong> ({editingAsset.assetNumber})
                </p>
                <p className="text-destructive mt-2">
                  Warning: This will permanently remove the asset and all associated records.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAsset}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Maintenance Dialog */}
        <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Maintenance</DialogTitle>
              <DialogDescription>
                {editingAsset && `Record maintenance activity for ${editingAsset.name}`}
              </DialogDescription>
            </DialogHeader>
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(handleRecordMaintenance)} className="space-y-4">
                <FormField
                  control={maintenanceForm.control}
                  name="maintenanceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="maintenanceType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Maintenance Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Preventive" />
                            </FormControl>
                            <FormLabel className="font-normal">Preventive Maintenance</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Corrective" />
                            </FormControl>
                            <FormLabel className="font-normal">Corrective Maintenance</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Repair" />
                            </FormControl>
                            <FormLabel className="font-normal">Repair</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Inspection" />
                            </FormControl>
                            <FormLabel className="font-normal">Inspection</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="performedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performed By</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name of person or company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={maintenanceForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter maintenance notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Maintenance</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
