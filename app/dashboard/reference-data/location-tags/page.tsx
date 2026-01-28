"use client"

import { Tag, Plus, Search, MoreVertical, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useCallback, useMemo, useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  locationTagsApi,
  type LocationTag,
} from "@/src/services/referenceData/locationTags"

const locationTagSchema = z.object({
  unitId: z.string().uuid({ message: "Unit is required" }),
  locationTagName: z
    .string()
    .min(1, "Location tag name is required")
    .max(200, "Name must be less than 200 characters"),
  capacity: z.coerce.number().int("Capacity must be an integer").min(1, "Capacity must be at least 1"),
})

type LocationTagFormValues = z.infer<typeof locationTagSchema>

export default function LocationTagsPage() {
  const [units, setUnits] = useState<OrgUnit[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [locationTags, setLocationTags] = useState<LocationTag[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<LocationTag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnitsLoading, setIsUnitsLoading] = useState(true)
  const [isTagsLoading, setIsTagsLoading] = useState(true)

  const { session } = useAuth()
  const canManage = session?.user.role === "admin"

  // Form initialization
  const form = useForm<LocationTagFormValues>({
    resolver: zodResolver(locationTagSchema),
    defaultValues: {
      unitId: "",
      locationTagName: "",
      capacity: 1,
    },
  })

  const loadUnits = useCallback(async () => {
    setIsUnitsLoading(true)
    try {
      const data = await orgUnitsApi.list()
      setUnits(data)
      setSelectedUnitId((current) => current || data[0]?.id || "")
      if (data.length === 0) {
        setLocationTags([])
        setIsTagsLoading(false)
      }
    } catch (error) {
      toast({
        title: "Failed to load units",
        description: "Unable to retrieve organizational units.",
        variant: "destructive",
      })
      setLocationTags([])
      setIsTagsLoading(false)
    } finally {
      setIsUnitsLoading(false)
    }
  }, [])

  const loadLocationTags = useCallback(async () => {
    if (!selectedUnitId) {
      setLocationTags([])
      setIsTagsLoading(false)
      return
    }
    setIsTagsLoading(true)
    try {
      const tags = await locationTagsApi.listByUnit(selectedUnitId)
      setLocationTags(tags)
    } catch (error) {
      toast({
        title: "Failed to load location tags",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsTagsLoading(false)
    }
  }, [selectedUnitId])

  useEffect(() => {
    loadUnits()
  }, [loadUnits])

  useEffect(() => {
    loadLocationTags()
  }, [loadLocationTags])

  useEffect(() => {
    if (!editingTag && selectedUnitId) {
      form.setValue("unitId", selectedUnitId)
    }
  }, [editingTag, form, selectedUnitId])

  const filteredTags = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return locationTags.filter((tag) => tag.locationTagName.toLowerCase().includes(search))
  }, [locationTags, searchTerm])

  const getUtilizationPercentage = (tag: LocationTag) => tag.utilizationPercentage ?? 0

  const handleAddTag = async (data: LocationTagFormValues) => {
    setIsSubmitting(true)
    try {
      await locationTagsApi.create({
        unitId: data.unitId,
        locationTagName: data.locationTagName,
        capacity: data.capacity,
      })
      toast({
        title: "Location tag created",
        description: `${data.locationTagName} has been added successfully.`,
      })
      setIsAddDialogOpen(false)
      form.reset({ unitId: data.unitId, locationTagName: "", capacity: 1 })
      await loadLocationTags()
    } catch (error: any) {
      toast({
        title: "Failed to create location tag",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTag = async (data: LocationTagFormValues) => {
    if (!editingTag) return
    setIsSubmitting(true)
    try {
      await locationTagsApi.update(editingTag.id, {
        unitId: data.unitId,
        locationTagName: data.locationTagName,
        capacity: data.capacity,
      })
      toast({
        title: "Location tag updated",
        description: `${data.locationTagName} has been updated successfully.`,
      })
      setIsEditDialogOpen(false)
      setEditingTag(null)
      form.reset({ unitId: data.unitId, locationTagName: "", capacity: 1 })
      await loadLocationTags()
    } catch (error: any) {
      toast({
        title: "Failed to update location tag",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog
  const handleEditClick = (tag: LocationTag) => {
    setEditingTag(tag)
    form.reset({
      unitId: tag.unitId,
      locationTagName: tag.locationTagName,
      capacity: tag.capacity,
    })
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(true)
  }

  // Handle form submission
  const onSubmit = (data: LocationTagFormValues) => {
    if (editingTag) {
      handleEditTag(data)
    } else {
      handleAddTag(data)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tag className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Location Tags</h1>
            <p className="text-muted-foreground">
              Manage and organize storage locations across organizational units
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingTag(null)
            form.reset({
              unitId: selectedUnitId || "",
              locationTagName: "",
              capacity: 1,
            })
            setIsEditDialogOpen(false)
            setIsAddDialogOpen(true)
          }}
          disabled={!canManage || isUnitsLoading || units.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Location
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            All Location Tags ({filteredTags.length} of {locationTags.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={selectedUnitId}
              onValueChange={(value) => {
                setSelectedUnitId(value)
              }}
              disabled={isUnitsLoading || units.length === 0}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.unitName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search locations..."
                className="pl-8 w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isTagsLoading ? (
            <div className="flex h-40 flex-col items-center justify-center text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <span className="mt-3">Loading location tags…</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Tag Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Items</TableHead>
                <TableHead>Utilization %</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.locationTagName}</TableCell>
                    <TableCell>{tag.capacity}</TableCell>
                    <TableCell>{tag.currentItems}</TableCell>
                    <TableCell>{getUtilizationPercentage(tag)}%</TableCell>
                    <TableCell className="text-right">
                      {canManage ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(tag)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    {locationTags.length === 0
                      ? "No location tags found. Add your first location to get started."
                      : "No locations match your current filters."}
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
          setEditingTag(null)
          form.reset({ unitId: selectedUnitId || "", locationTagName: "", capacity: 1 })
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? "Edit Location Tag" : "Add New Location Tag"}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Make changes to the location tag details below."
                : "Fill in the details below to create a new location tag."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizational Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || selectedUnitId}
                      disabled={!canManage || isUnitsLoading || units.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.unitName}
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
                name="locationTagName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Tag Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location tag name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" step={1} placeholder="Enter capacity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editingTag && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Current Items</Label>
                    <p className="text-sm">{editingTag.currentItems}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Utilization Percentage</Label>
                    <p className="text-sm">{getUtilizationPercentage(editingTag)}%</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setIsEditDialogOpen(false)
                    setEditingTag(null)
                    form.reset({ unitId: selectedUnitId || "", locationTagName: "", capacity: 1 })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !canManage}>
                  {isSubmitting ? "Saving..." : editingTag ? "Update Location" : "Create Location"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
