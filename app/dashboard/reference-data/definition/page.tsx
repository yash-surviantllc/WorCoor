"use client"

import { useState } from "react"
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/simple-dropdown"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample inventory definition data
const initialInventoryDefinitions = [
  {
    id: 1,
    name: "Raw Materials",
    description: "All raw materials used in manufacturing",
    type: "Physical",
    trackingMethod: "Batch",
    unitOfMeasure: "Kilograms",
    attributes: ["Weight", "Dimensions", "Color", "Material Type"],
    locationTracking: true,
    batchTracking: true,
    serialTracking: false,
    expiryTracking: true,
    qualityGrading: true,
    costMethod: "FIFO",
    active: true,
  },
  {
    id: 2,
    name: "Finished Goods",
    description: "Completed products ready for sale",
    type: "Physical",
    trackingMethod: "Serial",
    unitOfMeasure: "Units",
    attributes: ["Weight", "Dimensions", "Color", "Model Number", "Serial Number"],
    locationTracking: true,
    batchTracking: false,
    serialTracking: true,
    expiryTracking: false,
    qualityGrading: true,
    costMethod: "Standard Cost",
    active: true,
  },
  {
    id: 3,
    name: "Packaging Materials",
    description: "Materials used for packaging products",
    type: "Physical",
    trackingMethod: "Quantity",
    unitOfMeasure: "Units",
    attributes: ["Type", "Dimensions", "Material"],
    locationTracking: true,
    batchTracking: false,
    serialTracking: false,
    expiryTracking: false,
    qualityGrading: false,
    costMethod: "FIFO",
    active: true,
  },
  {
    id: 4,
    name: "Tools",
    description: "Tools used in manufacturing process",
    type: "Asset",
    trackingMethod: "Serial",
    unitOfMeasure: "Units",
    attributes: ["Type", "Manufacturer", "Model", "Serial Number", "Maintenance Schedule"],
    locationTracking: true,
    batchTracking: false,
    serialTracking: true,
    expiryTracking: false,
    qualityGrading: false,
    costMethod: "Standard Cost",
    active: true,
  },
  {
    id: 5,
    name: "Spare Parts",
    description: "Spare parts for machinery and equipment",
    type: "Physical",
    trackingMethod: "Quantity",
    unitOfMeasure: "Units",
    attributes: ["Part Number", "Compatible Equipment", "Manufacturer"],
    locationTracking: true,
    batchTracking: false,
    serialTracking: false,
    expiryTracking: false,
    qualityGrading: false,
    costMethod: "FIFO",
    active: true,
  },
  {
    id: 6,
    name: "Work in Progress",
    description: "Partially completed products",
    type: "Physical",
    trackingMethod: "Batch",
    unitOfMeasure: "Units",
    attributes: ["Stage", "Completion Percentage", "Next Process"],
    locationTracking: true,
    batchTracking: true,
    serialTracking: false,
    expiryTracking: false,
    qualityGrading: true,
    costMethod: "Moving Average",
    active: true,
  },
  {
    id: 7,
    name: "Consumables",
    description: "Items consumed during manufacturing",
    type: "Physical",
    trackingMethod: "Quantity",
    unitOfMeasure: "Units",
    attributes: ["Type", "Usage Rate"],
    locationTracking: true,
    batchTracking: false,
    serialTracking: false,
    expiryTracking: true,
    qualityGrading: false,
    costMethod: "FIFO",
    active: true,
  },
  {
    id: 8,
    name: "Digital Assets",
    description: "Software and digital resources",
    type: "Digital",
    trackingMethod: "License",
    unitOfMeasure: "Licenses",
    attributes: ["License Type", "Expiration Date", "Version"],
    locationTracking: false,
    batchTracking: false,
    serialTracking: true,
    expiryTracking: true,
    qualityGrading: false,
    costMethod: "Specific Identification",
    active: true,
  },
]

// Sample attributes for inventory definitions
type AttributeOption = {
  label: string;
  value: string;
};

const availableAttributes: AttributeOption[] = [
  { label: "Weight", value: "Weight" },
  { label: "Dimensions", value: "Dimensions" },
  { label: "Color", value: "Color" },
  { label: "Material Type", value: "Material Type" },
  { label: "Manufacturer", value: "Manufacturer" },
  { label: "Model Number", value: "Model Number" },
  { label: "Serial Number", value: "Serial Number" },
  { label: "Part Number", value: "Part Number" },
  { label: "Batch Number", value: "Batch Number" },
  { label: "Compatible Equipment", value: "Compatible Equipment" },
  { label: "Maintenance Schedule", value: "Maintenance Schedule" },
  { label: "Usage Rate", value: "Usage Rate" },
  { label: "License Type", value: "License Type" },
  { label: "Expiration Date", value: "Expiration Date" },
  { label: "Version", value: "Version" },
]

// Form schema for adding/editing an inventory definition
// Define the form schema with explicit non-optional boolean fields
const inventoryDefinitionFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  type: z.enum(["Physical", "Digital", "Asset"]),
  trackingMethod: z.enum(["Quantity", "Batch", "Serial", "License"]),
  unitOfMeasure: z.string().min(1, {
    message: "Unit of measure is required.",
  }),
  attributes: z.array(z.string()).min(1, {
    message: "At least one attribute is required.",
  }),
  locationTracking: z.boolean().default(false),
  batchTracking: z.boolean().default(false),
  serialTracking: z.boolean().default(false),
  expiryTracking: z.boolean().default(false),
  qualityGrading: z.boolean().default(false),
  costMethod: z.enum(["FIFO", "LIFO", "Moving Average", "Standard Cost", "Specific Identification"]),
  active: z.boolean().default(true),
})

// Explicitly define the form values type to match zod schema
type InventoryDefinitionFormValues = z.infer<typeof inventoryDefinitionFormSchema>

// Type for inventory definition item
interface InventoryDefinition {
  id: number;
  name: string;
  description: string;
  type: "Physical" | "Digital" | "Asset";
  trackingMethod: "Batch" | "Serial" | "Quantity" | "License";
  unitOfMeasure: string;
  attributes: string[];
  locationTracking: boolean;
  batchTracking: boolean;
  serialTracking: boolean;
  expiryTracking: boolean;
  qualityGrading: boolean;
  costMethod: "FIFO" | "LIFO" | "Moving Average" | "Standard Cost" | "Specific Identification";
  active: boolean;
}

export default function InventoryDefinitionPage() {
  const [inventoryDefinitions, setInventoryDefinitions] = useState<InventoryDefinition[]>(initialInventoryDefinitions as InventoryDefinition[])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [trackingMethodFilter, setTrackingMethodFilter] = useState("All")
  const [activeFilter, setActiveFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingDefinition, setEditingDefinition] = useState<InventoryDefinition | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)

  const itemsPerPage = 5

  // Initialize form
  const form = useForm<InventoryDefinitionFormValues>({
    resolver: zodResolver(inventoryDefinitionFormSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      type: "Physical",
      trackingMethod: "Quantity",
      unitOfMeasure: "",
      attributes: [],
      locationTracking: false,
      batchTracking: false,
      serialTracking: false,
      expiryTracking: false,
      qualityGrading: false,
      costMethod: "FIFO",
      active: true,
    },
  })

  // Sort function
  const sortedInventoryDefinitions = [...inventoryDefinitions]
  if (sortConfig !== null) {
    sortedInventoryDefinitions.sort((a: any, b: any) => {
      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
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

  // Handle double-click on definition row
  const handleDefinitionRowDoubleClick = (definition: InventoryDefinition) => {
    openEditDialog(definition)
  }

  // Filter inventory definitions based on search term, type filter, tracking method filter, and active filter
  const filteredDefinitions = sortedInventoryDefinitions.filter((definition) => {
    const matchesSearch =
      definition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      definition.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "All" || definition.type === typeFilter
    const matchesTrackingMethod = trackingMethodFilter === "All" || definition.trackingMethod === trackingMethodFilter
    const matchesActive =
      activeFilter === "All" ||
      (activeFilter === "Active" && definition.active) ||
      (activeFilter === "Inactive" && !definition.active)
    return matchesSearch && matchesType && matchesTrackingMethod && matchesActive
  })

  // Paginate inventory definitions
  const indexOfLastDefinition = currentPage * itemsPerPage
  const indexOfFirstDefinition = indexOfLastDefinition - itemsPerPage
  const currentDefinitions = filteredDefinitions.slice(indexOfFirstDefinition, indexOfLastDefinition)
  const totalPages = Math.ceil(filteredDefinitions.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Handle adding a new inventory definition
  const handleAddInventoryDefinition = (data: InventoryDefinitionFormValues) => {
    const id = inventoryDefinitions.length > 0 ? Math.max(...inventoryDefinitions.map((def) => def.id)) + 1 : 1
    setInventoryDefinitions([
      ...inventoryDefinitions,
      {
        id,
        ...data,
      },
    ])
    setIsAddDialogOpen(false)
    form.reset()

    toast({
      title: "Inventory Definition Added",
      description: `${data.name} has been added successfully.`,
    })
  }

  // Handle editing an inventory definition
  const handleEditInventoryDefinition = (data: InventoryDefinitionFormValues) => {
    if (!editingDefinition) return

    setInventoryDefinitions(
      inventoryDefinitions.map((def) =>
        def.id === editingDefinition.id
          ? {
              ...def,
              ...data,
            }
          : def,
      ),
    )
    setIsEditDialogOpen(false)

    toast({
      title: "Inventory Definition Updated",
      description: `${data.name} has been updated successfully.`,
    })
  }

  // Handle deleting an inventory definition
  const handleDeleteInventoryDefinition = () => {
    if (!editingDefinition) return

    setInventoryDefinitions(inventoryDefinitions.filter((def) => def.id !== editingDefinition.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Inventory Definition Deleted",
      description: `${editingDefinition.name} has been deleted successfully.`,
    })
  }

  // Open edit dialog and set form values
  const openEditDialog = (definition: InventoryDefinition) => {
    setEditingDefinition(definition)
    form.reset({
      name: definition.name,
      description: definition.description,
      type: definition.type,
      trackingMethod: definition.trackingMethod,
      unitOfMeasure: definition.unitOfMeasure,
      attributes: definition.attributes,
      locationTracking: definition.locationTracking,
      batchTracking: definition.batchTracking,
      serialTracking: definition.serialTracking,
      expiryTracking: definition.expiryTracking,
      qualityGrading: definition.qualityGrading,
      costMethod: definition.costMethod,
      active: definition.active,
    })
    setIsEditDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (definition: InventoryDefinition) => {
    setEditingDefinition(definition)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory Definitions"
        description="Define inventory types and their tracking methods"
        icon={FileText}
      />
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Definition
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Inventory Definition</DialogTitle>
            <DialogDescription>Define a new inventory type for tracking and management.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => handleAddInventoryDefinition(data as any))} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking Options</TabsTrigger>
                  <TabsTrigger value="attributes">Attributes</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter inventory definition name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Physical">Physical</SelectItem>
                              <SelectItem value="Digital">Digital</SelectItem>
                              <SelectItem value="Asset">Asset</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="unitOfMeasure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Units, Kilograms, Liters" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as any}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Set whether this inventory definition is active and available for use.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="tracking" className="space-y-4 pt-4">
                  <FormField
                    control={form.control as any}
                    name="trackingMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tracking Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Quantity" />
                              </FormControl>
                              <FormLabel className="font-normal">Quantity Only</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Batch" />
                              </FormControl>
                              <FormLabel className="font-normal">Batch Tracking</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Serial" />
                              </FormControl>
                              <FormLabel className="font-normal">Serial Number Tracking</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="License" />
                              </FormControl>
                              <FormLabel className="font-normal">License Tracking</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="costMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cost method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                            <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                            <SelectItem value="Moving Average">Moving Average</SelectItem>
                            <SelectItem value="Standard Cost">Standard Cost</SelectItem>
                            <SelectItem value="Specific Identification">Specific Identification</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Determines how inventory costs are calculated and reported.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control as any}
                      name="locationTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Location Tracking</FormLabel>
                            <FormDescription>Track inventory across different locations.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="batchTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Batch Tracking</FormLabel>
                            <FormDescription>Track inventory by production batches.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="serialTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Serial Number Tracking</FormLabel>
                            <FormDescription>Track individual items by serial number.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="expiryTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Expiry Date Tracking</FormLabel>
                            <FormDescription>Track expiration dates for inventory items.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="qualityGrading"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quality Grading</FormLabel>
                            <FormDescription>Enable quality grading for inventory items.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="attributes" className="space-y-4 pt-4">
                  <FormField
                    control={form.control as any}
                    name="attributes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attributes</FormLabel>
                        <FormDescription>
                          Select attributes that will be tracked for this inventory type.
                        </FormDescription>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((attribute: string) => (
                              <div
                                key={attribute}
                                className="flex items-center rounded-full border bg-muted px-3 py-1 text-sm"
                              >
                                {attribute}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="ml-1 h-4 w-4"
                                  onClick={() => {
                                    const updatedAttributes = field.value.filter((a: string) => a !== attribute)
                                    form.setValue("attributes", updatedAttributes)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "mt-2 w-full justify-between",
                                  !field.value.length && "text-muted-foreground",
                                )}
                              >
                                {field.value.length > 0
                                  ? `${field.value.length} attribute${field.value.length > 1 ? "s" : ""} selected`
                                  : "Select attributes"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search attributes..." />
                              <CommandList>
                                <CommandEmpty>No attributes found.</CommandEmpty>
                                <CommandGroup>
                                  {availableAttributes.map((attribute: AttributeOption) => (
                                    <CommandItem
                                      key={attribute.value}
                                      value={attribute.value}
                                      onSelect={() => {
                                        const current = field.value || []
                                        const updated = current.includes(attribute.value)
                                          ? current.filter((value: string) => value !== attribute.value)
                                          : [...current, attribute.value]
                                        form.setValue("attributes", updated)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value.includes(attribute.value) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {attribute.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Definition</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Definitions</CardTitle>
          <CardDescription>Manage inventory types and their tracking methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search definitions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="type-filter" className="whitespace-nowrap">
                    Type:
                  </Label>
                  <Select onValueChange={(value) => setTypeFilter(value)} defaultValue="All">
                    <SelectTrigger id="type-filter" className="w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Physical">Physical</SelectItem>
                      <SelectItem value="Digital">Digital</SelectItem>
                      <SelectItem value="Asset">Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="tracking-filter" className="whitespace-nowrap">
                    Tracking:
                  </Label>
                  <Select onValueChange={(value) => setTrackingMethodFilter(value)} defaultValue="All">
                    <SelectTrigger id="tracking-filter" className="w-[150px]">
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Methods</SelectItem>
                      <SelectItem value="Quantity">Quantity</SelectItem>
                      <SelectItem value="Batch">Batch</SelectItem>
                      <SelectItem value="Serial">Serial</SelectItem>
                      <SelectItem value="License">License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="active-filter" className="whitespace-nowrap">
                    Status:
                  </Label>
                  <Select onValueChange={(value) => setActiveFilter(value)} defaultValue="All">
                    <SelectTrigger id="active-filter" className="w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                      Name
                      {sortConfig?.key === "name" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort("type")}>
                      Type
                      {sortConfig?.key === "type" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead>Tracking Method</TableHead>
                    <TableHead className="hidden lg:table-cell">Unit of Measure</TableHead>
                    <TableHead className="hidden xl:table-cell">Tracking Options</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDefinitions.length > 0 ? (
                    currentDefinitions.map((definition) => (
                      <TableRow
                        key={definition.id}
                        onDoubleClick={() => handleDefinitionRowDoubleClick(definition)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{definition.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="max-w-[200px] truncate" title={definition.description}>
                            {definition.description}
                          </div>
                        </TableCell>
                        <TableCell>{definition.type}</TableCell>
                        <TableCell>{definition.trackingMethod}</TableCell>
                        <TableCell className="hidden lg:table-cell">{definition.unitOfMeasure}</TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {definition.locationTracking && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                Location
                              </span>
                            )}
                            {definition.batchTracking && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                                Batch
                              </span>
                            )}
                            {definition.serialTracking && (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                                Serial
                              </span>
                            )}
                            {definition.expiryTracking && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                Expiry
                              </span>
                            )}
                            {definition.qualityGrading && (
                              <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                                Quality
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {definition.active ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => openViewDialog(definition)}>
                                <Search className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openEditDialog(definition)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditingDefinition(definition)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No inventory definitions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredDefinitions.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstDefinition + 1} to {Math.min(indexOfLastDefinition, filteredDefinitions.length)}{" "}
                  of {filteredDefinitions.length} definitions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Definition</DialogTitle>
            <DialogDescription>Make changes to the inventory definition.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => handleEditInventoryDefinition(data as any))} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking Options</TabsTrigger>
                  <TabsTrigger value="attributes">Attributes</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter inventory definition name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Physical">Physical</SelectItem>
                              <SelectItem value="Digital">Digital</SelectItem>
                              <SelectItem value="Asset">Asset</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="unitOfMeasure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Units, Kilograms, Liters" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as any}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Set whether this inventory definition is active and available for use.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="tracking" className="space-y-4 pt-4">
                  <FormField
                    control={form.control as any}
                    name="trackingMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tracking Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Quantity" />
                              </FormControl>
                              <FormLabel className="font-normal">Quantity Only</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Batch" />
                              </FormControl>
                              <FormLabel className="font-normal">Batch Tracking</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Serial" />
                              </FormControl>
                              <FormLabel className="font-normal">Serial Number Tracking</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="License" />
                              </FormControl>
                              <FormLabel className="font-normal">License Tracking</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="costMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cost method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                            <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                            <SelectItem value="Moving Average">Moving Average</SelectItem>
                            <SelectItem value="Standard Cost">Standard Cost</SelectItem>
                            <SelectItem value="Specific Identification">Specific Identification</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Determines how inventory costs are calculated and reported.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control as any}
                      name="locationTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Location Tracking</FormLabel>
                            <FormDescription>Track inventory across different locations.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="batchTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Batch Tracking</FormLabel>
                            <FormDescription>Track inventory by production batches.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="serialTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Serial Number Tracking</FormLabel>
                            <FormDescription>Track individual items by serial number.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="expiryTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Expiry Date Tracking</FormLabel>
                            <FormDescription>Track expiration dates for inventory items.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="qualityGrading"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Quality Grading</FormLabel>
                            <FormDescription>Enable quality grading for inventory items.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="attributes" className="space-y-4 pt-4">
                  <FormField
                    control={form.control as any}
                    name="attributes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attributes</FormLabel>
                        <FormDescription>
                          Select attributes that will be tracked for this inventory type.
                        </FormDescription>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((attribute: string) => (
                              <div
                                key={attribute}
                                className="flex items-center rounded-full border bg-muted px-3 py-1 text-sm"
                              >
                                {attribute}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="ml-1 h-4 w-4"
                                  onClick={() => {
                                    const updatedAttributes = field.value.filter((a: string) => a !== attribute)
                                    form.setValue("attributes", updatedAttributes)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "mt-2 w-full justify-between",
                                  !field.value.length && "text-muted-foreground",
                                )}
                              >
                                {field.value.length > 0
                                  ? `${field.value.length} attribute${field.value.length > 1 ? "s" : ""} selected`
                                  : "Select attributes"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search attributes..." />
                              <CommandList>
                                <CommandEmpty>No attributes found.</CommandEmpty>
                                <CommandGroup>
                                  {availableAttributes.map((attribute: AttributeOption) => (
                                    <CommandItem
                                      key={attribute.value}
                                      value={attribute.value}
                                      onSelect={() => {
                                        const current = field.value || []
                                        const updated = current.includes(attribute.value)
                                          ? current.filter((value: string) => value !== attribute.value)
                                          : [...current, attribute.value]
                                        form.setValue("attributes", updated)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value.includes(attribute.value) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {attribute.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inventory Definition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory definition? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {editingDefinition && (
            <div className="py-4">
              <p>
                You are about to delete: <strong>{editingDefinition.name}</strong>
              </p>
              <p className="text-destructive mt-2">
                Warning: Deleting this definition may affect inventory items that use it.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInventoryDefinition}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Definition Details</DialogTitle>
            <DialogDescription>View detailed information about this inventory definition.</DialogDescription>
          </DialogHeader>
          {editingDefinition && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-base">{editingDefinition.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="text-base">{editingDefinition.type}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-base">{editingDefinition.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tracking Method</h3>
                  <p className="text-base">{editingDefinition.trackingMethod}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Unit of Measure</h3>
                  <p className="text-base">{editingDefinition.unitOfMeasure}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Cost Method</h3>
                <p className="text-base">{editingDefinition.costMethod}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tracking Options</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {editingDefinition.locationTracking && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                      Location Tracking
                    </span>
                  )}
                  {editingDefinition.batchTracking && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      Batch Tracking
                    </span>
                  )}
                  {editingDefinition.serialTracking && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                      Serial Number Tracking
                    </span>
                  )}
                  {editingDefinition.expiryTracking && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Expiry Date Tracking
                    </span>
                  )}
                  {editingDefinition.qualityGrading && (
                    <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                      Quality Grading
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Attributes</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {editingDefinition.attributes.map((attribute: string) => (
                    <span
                      key={attribute}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {attribute}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="text-base">
                  {editingDefinition.active ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                      Inactive
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                if (editingDefinition) {
                  openEditDialog(editingDefinition)
                }
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
