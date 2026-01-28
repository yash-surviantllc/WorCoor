"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Tag, Plus, Search, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PageHeader from "@/components/layout/page-header"
import SkuForm from "@/components/inventory/sku-form"
import { toast } from "@/components/ui/use-toast"

import { useAuth } from "@/src/utils/AuthContext"
import { orgUnitsApi, type OrgUnit } from "@/src/services/referenceData/orgUnits"
import { locationTagsApi } from "@/src/services/referenceData/locationTags"
import { skusApi, type Sku } from "@/src/services/referenceData/skus"

type SkuFormValues = {
  sku_name: string
  sku_category: "raw_material" | "finished_good"
  quantity: number
  sku_unit: string
  effective_date: string
  expiry_date?: string | null
  location_tag_id?: string | null
}

type LocationTagOption = { value: string; label: string }

const mapFormToPayload = (values: SkuFormValues) => ({
  skuName: values.sku_name,
  skuCategory: values.sku_category,
  skuUnit: values.sku_unit,
  quantity: Number(values.quantity ?? 0),
  effectiveDate: values.effective_date,
  expiryDate: values.expiry_date ? values.expiry_date : null,
  locationTagId: values.location_tag_id ? values.location_tag_id : null,
})

const skuToFormValues = (sku: Sku): SkuFormValues => ({
  sku_name: sku.skuName,
  sku_category: sku.skuCategory,
  quantity: sku.quantity,
  sku_unit: sku.skuUnit,
  effective_date: sku.effectiveDate,
  expiry_date: sku.expiryDate ?? "",
  location_tag_id: sku.locationTagId ?? undefined,
})

export default function SkuManagementPage() {
  const [units, setUnits] = useState<OrgUnit[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [skus, setSkus] = useState<Sku[]>([])
  const [locationTags, setLocationTags] = useState<LocationTagOption[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUnitsLoading, setIsUnitsLoading] = useState(true)
  const [isTagsLoading, setIsTagsLoading] = useState(false)
  const [isSkusLoading, setIsSkusLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { session } = useAuth()
  const canManage = session?.user.role === "admin"

  useEffect(() => {
    const handle = setTimeout(() => setSearchTerm(searchInput.trim()), 400)
    return () => clearTimeout(handle)
  }, [searchInput])

  const loadUnits = useCallback(async () => {
    setIsUnitsLoading(true)
    try {
      const data = await orgUnitsApi.list()
      setUnits(data)
      setSelectedUnitId((current) => current || data[0]?.id || "")
    } catch (error) {
      toast({
        title: "Failed to load units",
        description: "Unable to retrieve organizational units.",
        variant: "destructive",
      })
    } finally {
      setIsUnitsLoading(false)
    }
  }, [])

  const loadLocationTags = useCallback(
    async (unitId: string) => {
      if (!unitId) {
        setLocationTags([])
        return
      }
      setIsTagsLoading(true)
      try {
        const tags = await locationTagsApi.listByUnit(unitId)
        setLocationTags(
          tags.map((tag) => ({
            value: tag.id,
            label: tag.locationTagName,
          })),
        )
      } catch (error) {
        toast({
          title: "Failed to load location tags",
          description: "Please try again later.",
          variant: "destructive",
        })
        setLocationTags([])
      } finally {
        setIsTagsLoading(false)
      }
    },
    [],
  )

  const loadSkus = useCallback(async () => {
    setIsSkusLoading(true)
    try {
      const { items } = await skusApi.list({
        unitId: selectedUnitId || undefined,
        search: searchTerm || undefined,
      })
      setSkus(items)
    } catch (error) {
      toast({
        title: "Failed to load SKUs",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      })
      setSkus([])
    } finally {
      setIsSkusLoading(false)
    }
  }, [searchTerm, selectedUnitId])

  useEffect(() => {
    loadUnits()
  }, [loadUnits])

  useEffect(() => {
    if (selectedUnitId) {
      loadLocationTags(selectedUnitId)
    } else {
      setLocationTags([])
    }
  }, [loadLocationTags, selectedUnitId])

  useEffect(() => {
    loadSkus()
  }, [loadSkus])

  const filteredSkus = useMemo(() => skus, [skus])

  const closeDialog = () => {
    setIsAddOpen(false)
    setIsEditOpen(false)
    setSelectedSku(null)
  }

  const handleAddSku = async (values: SkuFormValues) => {
    setIsSubmitting(true)
    try {
      await skusApi.create(mapFormToPayload(values))
      toast({
        title: "SKU created",
        description: `${values.sku_name} has been added successfully.`,
      })
      setIsAddOpen(false)
      await loadSkus()
    } catch (error: any) {
      toast({
        title: "Failed to create SKU",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSku = async (values: SkuFormValues) => {
    if (!selectedSku) return
    setIsSubmitting(true)
    try {
      await skusApi.update(selectedSku.id, mapFormToPayload(values))
      toast({
        title: "SKU updated",
        description: `${values.sku_name} has been updated successfully.`,
      })
      setIsEditOpen(false)
      setSelectedSku(null)
      await loadSkus()
    } catch (error: any) {
      toast({
        title: "Failed to update SKU",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSku = async () => {
    if (!selectedSku) return
    setIsDeleting(true)
    try {
      await skusApi.remove(selectedSku.id)
      toast({
        title: "SKU deleted",
        description: `${selectedSku.skuName} has been removed.`,
      })
      setIsDeleteOpen(false)
      setSelectedSku(null)
      await loadSkus()
    } catch (error: any) {
      toast({
        title: "Failed to delete SKU",
        description: error?.response?.data?.error ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const renderTableBody = () => {
    if (isSkusLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
            Loading SKUs…
          </TableCell>
        </TableRow>
      )
    }

    if (!filteredSkus.length) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
            No SKUs found.
          </TableCell>
        </TableRow>
      )
    }

    return filteredSkus.map((sku) => (
      <TableRow key={sku.id}>
        <TableCell className="font-medium">{sku.skuName}</TableCell>
        <TableCell className="capitalize">{sku.skuCategory.replace("_", " ")}</TableCell>
        <TableCell>{sku.quantity}</TableCell>
        <TableCell>{sku.skuUnit}</TableCell>
        <TableCell>{sku.effectiveDate || "-"}</TableCell>
        <TableCell>{sku.expiryDate ?? "-"}</TableCell>
        <TableCell>{sku.locationTagName ?? "Unassigned"}</TableCell>
        <TableCell className="text-right">
          {canManage ? (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSku(sku)
                  setIsEditOpen(true)
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setSelectedSku(sku)
                  setIsDeleteOpen(true)
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">View only</span>
          )}
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden">
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center pb-2 sm:pb-4">
          <PageHeader title="SKU Management" description="Manage SKUs and inventory levels" icon={Tag} />
          {canManage && (
            <div className="flex items-center ml-auto gap-2">
              <Button
                className="border border-primary bg-darkblue text-white hover:bg-darkblue/90"
                disabled={isUnitsLoading || (!canManage && true)}
                onClick={() => {
                  setSelectedSku(null)
                  setIsEditOpen(false)
                  setIsAddOpen(true)
                }}
              >
                <span className="hidden md:block">Add SKU</span>
                <Plus className="h-4 w-4 block text-white md:hidden" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size={22} />
            <Input
              type="search"
              placeholder="Search SKUs..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              className="h-11 w-full md:w-64 rounded-xl border border-input bg-background px-3 text-sm"
              value={selectedUnitId}
              onChange={(event) => setSelectedUnitId(event.target.value)}
              disabled={isUnitsLoading || !units.length}
            >
              {!units.length && <option value="">No units available</option>}
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU Name</TableHead>
                <TableHead>SKU Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Location Tag</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(open) => (!open && !isSubmitting ? setIsAddOpen(false) : setIsAddOpen(open))}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={() => !isSubmitting && setIsAddOpen(false)}
            className="max-w-3xl md:max-h-[90dvh] min-h-[60dvh] md:h-[70dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden dark:bg-modal p-0 gap-0"
          >
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Add SKU</DialogTitle>
              <DialogDescription>Add a new SKU to the inventory system.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pt-4">
              <SkuForm
                onSubmit={handleAddSku as any}
                onCancel={() => !isSubmitting && setIsAddOpen(false)}
                locationTags={locationTags}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={(open) => (!open && !isSubmitting ? setIsEditOpen(false) : setIsEditOpen(open))}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={() => !isSubmitting && setIsEditOpen(false)}
            className="max-w-3xl md:max-h-[90dvh] min-h-[60dvh] md:h-[70dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden dark:bg-modal p-0 gap-0"
          >
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Edit SKU</DialogTitle>
              <DialogDescription>Make changes to the SKU details.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pt-4">
              {selectedSku && (
                <SkuForm
                  initialData={skuToFormValues(selectedSku) as any}
                  onSubmit={handleEditSku as any}
                  onCancel={() => {
                    if (isSubmitting) return
                    setIsEditOpen(false)
                    setSelectedSku(null)
                  }}
                  locationTags={locationTags}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteOpen} onOpenChange={(open) => (!open && !isDeleting ? setIsDeleteOpen(false) : setIsDeleteOpen(open))}>
          <DialogContent className="dark:bg-modal max-w-full sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete SKU</DialogTitle>
              <DialogDescription>Are you sure you want to delete this SKU? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            {selectedSku && (
              <div className="pb-4 pt-2">
                <p className="text-sm leading-[1.4] mb-3">
                  You are about to delete: <strong>{selectedSku.skuName}</strong>
                </p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => !isDeleting && setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSku} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}