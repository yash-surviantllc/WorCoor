"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Package, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/dashboard/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/src/utils/AuthContext"
import { notification } from "@/src/services/notificationService"
import { assetsApi, type Asset } from "@/src/services/referenceData/assets"
import { locationTagsApi } from "@/src/services/referenceData/locationTags"
import { useDebounce } from "@/src/hooks/useDebounce"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const LOCATION_TAG_NONE_VALUE = "__unassigned__"

const assetFormSchema = z.object({
  assetName: z.string().min(1, "Asset name is required"),
  assetType: z.enum(["forklift", "pallet_jack", "scanner"], {
    required_error: "Please select an asset type",
  }),
  locationTagId: z.union([z.string().uuid(), z.literal(LOCATION_TAG_NONE_VALUE)]).optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>
type DialogMode = "create" | "edit" | "delete"

const DEFAULT_LIMIT = 25

export default function AssetManagementPage() {
  const { isAuthLoading, isAuthenticated } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [locationTags, setLocationTags] = useState<{ label: string; value: string }[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: { assetName: "", assetType: "forklift", locationTagId: LOCATION_TAG_NONE_VALUE },
  })

  const openDialog = (mode: DialogMode, asset?: Asset) => {
    setDialogMode(mode)
    setSelectedAsset(asset ?? null)
    if (mode === "edit" && asset) {
      form.reset({
        assetName: asset.assetName,
        assetType: asset.assetType as AssetFormValues["assetType"],
        locationTagId: asset.locationTagId ?? LOCATION_TAG_NONE_VALUE,
      })
    } else if (mode === "create") {
      form.reset({ assetName: "", assetType: "forklift", locationTagId: LOCATION_TAG_NONE_VALUE })
    }
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedAsset(null)
    form.reset({ assetName: "", assetType: "forklift", locationTagId: LOCATION_TAG_NONE_VALUE })
  }

  const loadAssets = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await assetsApi.list({
        search: debouncedSearch || undefined,
        limit: DEFAULT_LIMIT,
        offset: page * DEFAULT_LIMIT,
      })
      setAssets(response.items)
      setTotal(response.pagination.total)
    } catch (error: any) {
      notification.error(error?.response?.data?.message || "Failed to load assets")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, page])

  const loadLocationTags = useCallback(async () => {
    try {
      const tags = await locationTagsApi.listAllForOrg()
      setLocationTags(
        tags.map((tag) => ({
          value: tag.id,
          label: tag.locationTagName,
        })),
      )
    } catch (error) {
      console.warn("Failed to load location tags", error)
      setLocationTags([])
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return
    loadAssets()
  }, [isAuthenticated, isAuthLoading, loadAssets])

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return
    loadLocationTags()
  }, [isAuthenticated, isAuthLoading, loadLocationTags])

  const onSubmit = async (values: AssetFormValues) => {
    const payload = {
      assetName: values.assetName.trim(),
      assetType: values.assetType,
      locationTagId: values.locationTagId === LOCATION_TAG_NONE_VALUE ? undefined : values.locationTagId,
    }

    setCreateLoading(true)
    try {
      if (dialogMode === "edit" && selectedAsset) {
        await assetsApi.update(selectedAsset.id, payload)
        notification.success("Asset updated")
      } else {
        await assetsApi.create(payload)
        notification.success("Asset created")
      }
      closeDialog()
      await loadAssets()
    } catch (error: any) {
      notification.error(error?.response?.data?.error || error?.message || "Failed to save asset")
    } finally {
      setCreateLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedAsset) return
    setDeleteLoading(true)
    try {
      await assetsApi.remove(selectedAsset.id)
      notification.success("Asset deleted")
      closeDialog()
      await loadAssets()
    } catch (error: any) {
      notification.error(error?.response?.data?.error || "Failed to delete asset")
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalPages = useMemo(() => Math.ceil(total / DEFAULT_LIMIT), [total])

  if (isAuthLoading || !isAuthenticated) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <PageHeader title="Asset Management" description="Track equipment assigned to location tags" icon={Package} />
        <div className="ml-auto flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name"
              value={searchTerm}
              onChange={(event) => {
                setPage(0)
                setSearchTerm(event.target.value)
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={() => openDialog("create")}
            className="bg-darkblue text-white hover:bg-darkblue/90">
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Asset Type</TableHead>
              <TableHead>Location Tag</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {isLoading ? "Loading assets..." : "No assets found"}
                </TableCell>
              </TableRow>
            )}
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.assetName}</TableCell>
                <TableCell className="capitalize">{asset.assetType.replace("_", " ")}</TableCell>
                <TableCell>{asset.locationTagName ?? "Unassigned"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog("edit", asset)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openDialog("delete", asset)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(page * DEFAULT_LIMIT + 1, total)} -
              {Math.min((page + 1) * DEFAULT_LIMIT, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => (open ? null : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="assetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Forklift A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="forklift">Forklift</SelectItem>
                        <SelectItem value="pallet_jack">Pallet Jack</SelectItem>
                        <SelectItem value="scanner">Scanner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationTagId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Tag (optional)</FormLabel>
                    <Select value={field.value ?? LOCATION_TAG_NONE_VALUE} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LOCATION_TAG_NONE_VALUE}>Unassigned</SelectItem>
                        {locationTags.map((tag) => (
                          <SelectItem key={tag.value} value={tag.value}>
                            {tag.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Saving..." : "Save Asset"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => (open ? null : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete asset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{selectedAsset?.assetName}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={deleteLoading} onClick={confirmDelete}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
