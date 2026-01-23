"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Box, LayoutDashboard, Package, Upload, Warehouse } from "lucide-react"

import { useAuth } from "@/src/utils/AuthContext"
import { apiService } from "@/src/services/apiService"
import { api_url } from "@/src/constants/api_url"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"

const ORG_UNITS_STORAGE_KEY = "worcoor-org-units"
const LOCATION_TAGS_STORAGE_KEY = "worcoor-location-tags"
const SKUS_STORAGE_KEY = "worcoor-skus"
const BULK_UPLOAD_META_STORAGE_KEY = "worcoor-bulk-upload-last"

type OrgUnitStatus = "LIVE" | "OFFLINE" | "MAINTENANCE" | "PLANNING"

type OrgUnit = {
  unit_name?: string
  unit_type?: string
  status?: OrgUnitStatus
  description?: string
}

type LocationTag = {
  location_tag_name?: string
  capacity?: number
  current_items?: number
}

type BackendSku = {
  id: string
  sku_name?: string
  sku_category?: string
  quantity?: number
  sku_unit?: string
  location_tag_id?: string
}

type BackendAsset = {
  id?: string
  asset_name?: string
  asset_type?: string
  location_tag_id?: string
  name?: string
  type?: string
  locationId?: string
}

type BulkUploadStatus = "Success" | "Failed" | "In Progress"

type BulkUploadMeta = {
  uploadType?: "skus" | "locations" | "assets"
  targetOrgUnit?: string
  status?: BulkUploadStatus
  processedCount?: number
  updatedAt?: string
}

export default function DashboardPage() {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const router = useRouter()

  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([])
  const [locationTags, setLocationTags] = useState<LocationTag[]>([])
  const [skus, setSkus] = useState<BackendSku[]>([])
  const [assets, setAssets] = useState<BackendAsset[]>([])
  const [bulkUploadMeta, setBulkUploadMeta] = useState<BulkUploadMeta | null>(null)

  const [assetsApiOk, setAssetsApiOk] = useState(true)
  const [assetsLastFetchedAt, setAssetsLastFetchedAt] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthLoading) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
  }, [isAuthenticated, isAuthLoading, router])

  useEffect(() => {
    const readJsonArray = <T,>(key: string): T[] => {
      const raw = localStorage.getItem(key)
      if (!raw) return []
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const refreshFromLocalStorage = () => {
      setOrgUnits(readJsonArray<OrgUnit>(ORG_UNITS_STORAGE_KEY))
      setLocationTags(readJsonArray<LocationTag>(LOCATION_TAGS_STORAGE_KEY))
      setSkus(readJsonArray<BackendSku>(SKUS_STORAGE_KEY))

      const rawMeta = localStorage.getItem(BULK_UPLOAD_META_STORAGE_KEY)
      if (!rawMeta) {
        setBulkUploadMeta(null)
      } else {
        try {
          const parsed = JSON.parse(rawMeta)
          setBulkUploadMeta(parsed && typeof parsed === "object" ? parsed : null)
        } catch {
          setBulkUploadMeta(null)
        }
      }
    }

    refreshFromLocalStorage()

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return
      if (
        e.key === ORG_UNITS_STORAGE_KEY ||
        e.key === LOCATION_TAGS_STORAGE_KEY ||
        e.key === SKUS_STORAGE_KEY ||
        e.key === BULK_UPLOAD_META_STORAGE_KEY
      ) {
        refreshFromLocalStorage()
      }
    }

    window.addEventListener("storage", onStorage)
    const poll = window.setInterval(refreshFromLocalStorage, 2500)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.clearInterval(poll)
    }
  }, [])

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiService.post({
          path: api_url.worCoorService.asset.assetlist,
          data: { page: 0, limit: 100 },
          isAuth: true,
        })
        const list = Array.isArray(response.data?.data?.list)
          ? response.data.data.list
          : Array.isArray(response.data?.data)
            ? response.data.data
            : []
        setAssets(list)
        setAssetsApiOk(true)
        setAssetsLastFetchedAt(new Date().toISOString())
      } catch {
        setAssets([])
        setAssetsApiOk(false)
      }
    }

    fetchAssets()
    const poll = window.setInterval(fetchAssets, 10000)

    return () => {
      window.clearInterval(poll)
    }
  }, [])

  const orgUnitsCount = useMemo(() => orgUnits.length, [orgUnits])
  const skusCount = useMemo(() => skus.length, [skus])
  const locationTagsCount = useMemo(() => locationTags.length, [locationTags])
  const assetsCount = useMemo(() => assets.length, [assets])

  const locationUtilization = useMemo(() => {
    const totals = locationTags.reduce(
      (acc: { capacity: number; used: number }, l) => {
        const cap = Number(l.capacity)
        const cur = Number(l.current_items)
        acc.capacity += Number.isFinite(cap) ? cap : 0
        acc.used += Number.isFinite(cur) ? cur : 0
        return acc
      },
      { capacity: 0, used: 0 }
    )

    const ratio = totals.capacity > 0 ? totals.used / totals.capacity : null
    return { capacity: totals.capacity, used: totals.used, ratio }
  }, [locationTags])

  const assetsAssignedRatio = useMemo(() => {
    if (assets.length === 0) return null
    const assigned = assets.filter((a) => (a.location_tag_id ?? a.locationId ?? "").toString().trim()).length
    return {
      assigned,
      total: assets.length,
      ratio: assets.length > 0 ? assigned / assets.length : 0,
    }
  }, [assets])

  const lastActivityLabel = useMemo(() => {
    if (bulkUploadMeta?.updatedAt) {
      return new Date(bulkUploadMeta.updatedAt).toLocaleString()
    }
    if (assetsLastFetchedAt) {
      return new Date(assetsLastFetchedAt).toLocaleString()
    }
    return null
  }, [assetsLastFetchedAt, bulkUploadMeta?.updatedAt])

  if (isAuthLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Choose an area to manage"
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/dashboard/reference-data/org-units" className="block">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-100">Total Org Units</p>
                  <p className="text-3xl font-bold text-white">{orgUnitsCount.toLocaleString()}</p>
                  <p className="text-xs text-orange-200">From localStorage</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Warehouse className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reference-data/skus" className="block">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-100">Total SKUs</p>
                  <p className="text-3xl font-bold text-white">{skusCount.toLocaleString()}</p>
                  <p className="text-xs text-blue-200">From localStorage</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Box className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reference-data/location-tags" className="block">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-indigo-100">Total Location Tags</p>
                  <p className="text-3xl font-bold text-white">{locationTagsCount.toLocaleString()}</p>
                  <p className="text-xs text-indigo-200">From localStorage</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reference-data/asset-management/assets" className="block">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-teal-100">Total Assets</p>
                  <p className="text-3xl font-bold text-white">{assetsCount.toLocaleString()}</p>
                  <p className="text-xs text-teal-200">From API</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reference-data/bulk-upload" className="block">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-100">Bulk Upload</p>
                  <p className="text-3xl font-bold text-white">{bulkUploadMeta?.status ?? "-"}</p>
                  <p className="text-xs text-purple-200">{bulkUploadMeta?.updatedAt ? new Date(bulkUploadMeta.updatedAt).toLocaleDateString() : "No recent uploads"}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest updates across the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 text-sm dark:border-slate-700/60 dark:bg-slate-900/20">
                <span className="text-muted-foreground">Last activity</span>
                <span className="font-mono text-xs tabular-nums">{lastActivityLabel ?? "-"}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 text-sm dark:border-slate-700/60 dark:bg-slate-900/20">
                <span className="text-muted-foreground">Bulk upload</span>
                <span className="text-xs">
                  {bulkUploadMeta?.status ? `Last status: ${bulkUploadMeta.status}` : "No uploads yet"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 text-sm dark:border-slate-700/60 dark:bg-slate-900/20">
                <span className="text-muted-foreground">Assets API</span>
                <span
                  className={
                    assetsApiOk
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
                  }
                >
                  {assetsApiOk ? "Operational" : "Degraded"}
                </span>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/reference-data" className="flex items-center justify-center gap-2">
                Open Reference Data
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle className="text-base">Utilization</CardTitle>
            <CardDescription>Percentage utilization of tags, assets and records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Location tags utilization</span>
                <span className="font-mono tabular-nums">
                  {locationUtilization.capacity > 0
                    ? `${Math.round((locationUtilization.used / locationUtilization.capacity) * 100).toLocaleString()}%`
                    : "-"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${locationUtilization.capacity > 0 ? Math.min(100, Math.round((locationUtilization.used / locationUtilization.capacity) * 100)) : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">Used / Capacity</span>
                <span className="font-mono tabular-nums">
                  {locationUtilization.capacity > 0
                    ? `${locationUtilization.used.toLocaleString()} / ${locationUtilization.capacity.toLocaleString()}`
                    : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assets assigned to tag</span>
                <span className="font-mono tabular-nums">
                  {assetsAssignedRatio === null
                    ? "-"
                    : `${Math.round(assetsAssignedRatio.ratio * 100).toLocaleString()}%`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${assetsAssignedRatio === null ? 0 : Math.min(100, Math.round(assetsAssignedRatio.ratio * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">Assigned / Total</span>
                <span className="font-mono tabular-nums">
                  {assetsAssignedRatio === null
                    ? "-"
                    : `${assetsAssignedRatio.assigned.toLocaleString()} / ${assetsAssignedRatio.total.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 text-xs dark:border-slate-700/60 dark:bg-slate-900/20">
                <div className="text-muted-foreground">Org Units</div>
                <div className="font-mono tabular-nums text-sm text-foreground">{orgUnitsCount.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 text-xs dark:border-slate-700/60 dark:bg-slate-900/20">
                <div className="text-muted-foreground">Tags</div>
                <div className="font-mono tabular-nums text-sm text-foreground">{locationTagsCount.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 text-xs dark:border-slate-700/60 dark:bg-slate-900/20">
                <div className="text-muted-foreground">Assets</div>
                <div className="font-mono tabular-nums text-sm text-foreground">{assetsCount.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
