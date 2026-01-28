"use client"

import { Building2, Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/src/utils/AuthContext"
import { orgUnitsApi, type OrgUnit } from "@/src/services/referenceData/orgUnits"

// Form schema
const orgUnitSchema = z.object({
  unit_name: z.string().min(1, "Unit Name is required").max(255, "Name must be less than 255 characters"),
  unit_type: z.string().min(1, "Unit Type is required"),
  status: z.enum(["LIVE", "OFFLINE", "MAINTENANCE", "PLANNING"], {
    required_error: "Please select a status",
  }),
  description: z.string().optional(),
})

type OrgUnitFormValues = z.infer<typeof orgUnitSchema>
const unitTypeOptions = [
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "PRODUCTION", label: "Production" },
  { value: "OFFICE", label: "Office" },
]

const statusOptions: OrgUnit["status"][] = ["LIVE", "OFFLINE", "MAINTENANCE", "PLANNING"]

export default function OrgUnitsPage() {
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<OrgUnit | null>(null)
  const [deleteUnit, setDeleteUnit] = useState<OrgUnit | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { session } = useAuth()
  const userRole = session?.user.role
  const canManageUnits = userRole === "admin"

  // Form initialization
  const form = useForm<OrgUnitFormValues>({
    resolver: zodResolver(orgUnitSchema),
    defaultValues: {
      unit_name: "",
      unit_type: "warehouse",
      status: "LIVE",
      description: "",
    },
  })

  const loadOrgUnits = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await orgUnitsApi.list()
      setOrgUnits(data)
    } catch (error) {
      console.error("Failed to load org units", error)
      toast({
        title: "Failed to load units",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrgUnits()
  }, [loadOrgUnits])

  // Filter units based on search and filters
  const filteredUnits = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return orgUnits.filter((unit) => {
      const matchesSearch =
        unit.unitName.toLowerCase().includes(search) ||
        (unit.description ?? "").toLowerCase().includes(search)
      const matchesType = filterType === "all" || unit.unitType === filterType
      const matchesStatus = filterStatus === "all" || unit.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [filterStatus, filterType, orgUnits, searchTerm])

  // Handle add new unit
  const handleAddUnit = async (data: OrgUnitFormValues) => {
    setIsSubmitting(true)
    try {
      const created = await orgUnitsApi.create({
        unitName: data.unit_name,
        unitType: data.unit_type,
        status: data.status,
        description: data.description ?? null,
      })

      setOrgUnits((prev) => [...prev, created])
      setIsAddDialogOpen(false)
      form.reset()

      toast({
        title: "Organizational unit created",
        description: `${created.unitName} has been added successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to create unit",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit unit
  const handleEditUnit = async (data: OrgUnitFormValues) => {
    if (!editingUnit) return

    setIsSubmitting(true)
    try {
      const updated = await orgUnitsApi.update(editingUnit.id, {
        unitName: data.unit_name,
        unitType: data.unit_type,
        status: data.status,
        description: data.description ?? null,
      })

      setOrgUnits((prev) => prev.map((unit) => (unit.id === updated.id ? updated : unit)))
      setIsEditDialogOpen(false)
      setEditingUnit(null)
      form.reset()

      toast({
        title: "Organizational unit updated",
        description: `${updated.unitName} has been updated successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to update unit",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete unit
  const handleDeleteUnit = async () => {
    if (!deleteUnit) return

    setIsSubmitting(true)
    try {
      await orgUnitsApi.remove(deleteUnit.id)
      setOrgUnits((prev) => prev.filter((unit) => unit.id !== deleteUnit.id))

      toast({
        title: "Organizational unit deleted",
        description: `${deleteUnit.unitName} has been deleted successfully.`,
        variant: "destructive",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete unit",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteUnit(null)
      setIsSubmitting(false)
    }
  }

  // Open edit dialog
  const handleEditClick = (unit: OrgUnit) => {
    setEditingUnit(unit)
    form.reset({
      unit_name: unit.unitName,
      unit_type: unit.unitType,
      status: unit.status,
      description: unit.description || "",
    })
    setIsEditDialogOpen(true)
  }

  // Open delete confirmation
  const handleDeleteClick = (unit: OrgUnit) => {
    setDeleteUnit(unit)
  }

  // Handle form submission
  const onSubmit = (data: OrgUnitFormValues) => {
    if (editingUnit) {
      handleEditUnit(data)
    } else {
      handleAddUnit(data)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Organizational Units</h1>
            <p className="text-muted-foreground">
              Manage and organize your warehouse, production, and office units
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={!canManageUnits} variant={canManageUnits ? "default" : "secondary"}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Unit
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            All Units ({filteredUnits.length} of {orgUnits.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search units..."
                className="pl-8 w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {unitTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 flex-col items-center justify-center text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <span className="mt-3">Loading organizational units…</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.unitName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {unit.unitType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              unit.status === "LIVE"
                                ? "bg-green-500"
                                : unit.status === "OFFLINE"
                                ? "bg-gray-400"
                                : unit.status === "MAINTENANCE"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <span>{unit.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {canManageUnits ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(unit)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(unit)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {orgUnits.length === 0
                        ? "No organizational units found. Add your first unit to get started."
                        : "No units match your current filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingUnit(null)
          form.reset()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Edit Organizational Unit" : "Add New Organizational Unit"}
            </DialogTitle>
            <DialogDescription>
              {editingUnit
                ? "Make changes to the organizational unit details below."
                : "Fill in the details below to create a new organizational unit."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="unit_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter unit name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for this unit"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setIsEditDialogOpen(false)
                    setEditingUnit(null)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingUnit ? "Update Unit" : "Create Unit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUnit} onOpenChange={() => setDeleteUnit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organizational unit
              "{deleteUnit?.unitName}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUnit}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
