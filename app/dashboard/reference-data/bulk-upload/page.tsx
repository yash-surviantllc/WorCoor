"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Upload, FileText, Database, Package, ArrowRight, CheckCircle, AlertCircle, Loader2, RefreshCw, Plus, Edit, Trash2, Building, Save, X, Download, Clock } from "lucide-react"
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { orgUnitsApi, type OrgUnit } from "@/src/services/referenceData/orgUnits"
import { skusApi, type CreateSkuInput, type Sku, type UpdateSkuInput } from "@/src/services/referenceData/skus"
import { locationTagsApi, type CreateLocationTagInput, type LocationTag, type UpdateLocationTagInput } from "@/src/services/referenceData/locationTags"
import { assetsApi, type Asset, type CreateAssetInput, type UpdateAssetInput } from "@/src/services/referenceData/assets"

// Backend schema definitions
const BACKEND_SCHEMAS = {
  skus: {
    fields: ['id', 'organization_id', 'sku_name', 'sku_category', 'sku_unit', 'quantity', 'effective_date', 'expiry_date', 'location_tag_id', 'created_at'],
    required: ['sku_name', 'sku_unit'],
    types: {
      id: 'uuid4',
      organization_id: 'uuid4',
      sku_name: 'varchar',
      sku_category: 'varchar',
      sku_unit: 'varchar',
      quantity: 'numeric',
      effective_date: 'date',
      expiry_date: 'date',
      location_tag_id: 'uuid4',
      created_at: 'timestamptz'
    }
  },
  location_tags: {
    fields: ['id', 'organization_id', 'location_tag_name', 'capacity', 'created_at', 'unit_id'],
    required: ['location_tag_name'],
    types: {
      id: 'uuid4',
      organization_id: 'uuid4',
      location_tag_name: 'varchar',
      capacity: 'int4',
      created_at: 'timestamptz',
      unit_id: 'uuid4'
    }
  },
  assets: {
    fields: ['id', 'organization_id', 'asset_name', 'asset_type', 'location_tag_id', 'created_at'],
    required: ['asset_name'],
    types: {
      id: 'uuid4',
      organization_id: 'uuid4',
      asset_name: 'varchar',
      asset_type: 'varchar',
      location_tag_id: 'uuid4',
      created_at: 'timestamptz'
    }
  }
}

type UploadType = "skus" | "location_tags" | "assets"
type CrudOperation = "create" | "update" | "delete"

type UploadContext = {
  unitId?: string
}

type ParsedRow = {
  data: Record<string, any>
  rowNumber: number
}

type UploadHandler = {
  list: (context: UploadContext) => Promise<any[]>
  create: (row: Record<string, any>, context: UploadContext) => Promise<void>
  update: (row: Record<string, any>, context: UploadContext) => Promise<void>
  delete: (row: Record<string, any>, context: UploadContext) => Promise<void>
}

const ID_FIELD_MAP: Record<UploadType, string[]> = {
  skus: ["id", "sku_id"],
  location_tags: ["id", "location_tag_id"],
  assets: ["id", "asset_id"],
}

const getRowValue = (row: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key]
    }
  }
  return undefined
}

const toNumber = (value: any, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeSkuCategory = (value: any): Sku["skuCategory"] => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase() as Sku["skuCategory"]
    if (normalized === "raw_material" || normalized === "finished_good") {
      return normalized
    }
  }
  return "raw_material"
}

const mapSkuToDisplayRow = (sku: Sku) => ({
  id: sku.id,
  organization_id: sku.organizationId,
  sku_name: sku.skuName,
  sku_category: sku.skuCategory,
  sku_unit: sku.skuUnit,
  quantity: sku.quantity,
  effective_date: sku.effectiveDate,
  expiry_date: sku.expiryDate ?? "",
  location_tag_id: sku.locationTagId ?? "",
  unit_id: sku.unitId ?? "",
  created_at: sku.createdAt,
})

const buildSkuCreatePayload = (row: Record<string, any>): CreateSkuInput => {
  const skuName = getRowValue(row, ["sku_name", "skuName"])
  if (!skuName) {
    throw new Error("sku_name is required")
  }

  const skuUnit = getRowValue(row, ["sku_unit", "skuUnit"])
  if (!skuUnit) {
    throw new Error("sku_unit is required")
  }

  const quantity = toNumber(getRowValue(row, ["quantity", "qty", "current_quantity"]))

  return {
    skuName: String(skuName),
    skuCategory: normalizeSkuCategory(getRowValue(row, ["sku_category", "skuCategory"])),
    skuUnit: String(skuUnit),
    quantity,
    effectiveDate: String(getRowValue(row, ["effective_date", "effectiveDate"]) ?? new Date().toISOString()),
    expiryDate: getRowValue(row, ["expiry_date", "expiryDate"]) ?? null,
    locationTagId: getRowValue(row, ["location_tag_id", "locationTagId"]) ?? null,
  }
}

const buildSkuUpdatePayload = (row: Record<string, any>): UpdateSkuInput => {
  const payload: UpdateSkuInput = {}
  const skuName = getRowValue(row, ["sku_name", "skuName"])
  if (skuName) payload.skuName = String(skuName)
  const skuCategory = getRowValue(row, ["sku_category", "skuCategory"])
  if (skuCategory) payload.skuCategory = normalizeSkuCategory(skuCategory)
  const skuUnit = getRowValue(row, ["sku_unit", "skuUnit"])
  if (skuUnit) payload.skuUnit = String(skuUnit)
  const quantity = getRowValue(row, ["quantity", "qty", "current_quantity"])
  if (quantity !== undefined) payload.quantity = toNumber(quantity)
  const effectiveDate = getRowValue(row, ["effective_date", "effectiveDate"])
  if (effectiveDate) payload.effectiveDate = String(effectiveDate)
  const expiryDate = getRowValue(row, ["expiry_date", "expiryDate"])
  if (expiryDate !== undefined) payload.expiryDate = expiryDate ? String(expiryDate) : null
  const locationTagId = getRowValue(row, ["location_tag_id", "locationTagId"])
  if (locationTagId !== undefined) payload.locationTagId = locationTagId ? String(locationTagId) : null
  return payload
}

const mapLocationTagToDisplayRow = (tag: LocationTag) => ({
  id: tag.id,
  organization_id: tag.organizationId,
  location_tag_name: tag.locationTagName,
  capacity: tag.capacity,
  unit_id: tag.unitId,
  created_at: tag.createdAt,
})

const buildLocationTagCreatePayload = (
  row: Record<string, any>,
  context: UploadContext,
): CreateLocationTagInput => {
  if (!context.unitId) {
    throw new Error("Unit ID is required to create location tags")
  }
  const name = getRowValue(row, ["location_tag_name", "locationTagName"])
  if (!name) {
    throw new Error("location_tag_name is required")
  }
  const capacity = toNumber(getRowValue(row, ["capacity"]), 0)
  return {
    unitId: context.unitId,
    locationTagName: String(name),
    capacity,
  }
}

const buildLocationTagUpdatePayload = (
  row: Record<string, any>,
  context: UploadContext,
): UpdateLocationTagInput => {
  const payload: UpdateLocationTagInput = {}
  const name = getRowValue(row, ["location_tag_name", "locationTagName"])
  if (name) payload.locationTagName = String(name)
  const capacity = getRowValue(row, ["capacity"])
  if (capacity !== undefined) payload.capacity = toNumber(capacity)
  const unitId = getRowValue(row, ["unit_id", "unitId"])
  if (unitId) payload.unitId = String(unitId)
  // default to selected unit if payload still empty for unitId but other fields provided
  if (!payload.unitId && context.unitId && (payload.locationTagName || payload.capacity !== undefined)) {
    payload.unitId = context.unitId
  }
  return payload
}

const mapAssetToDisplayRow = (asset: Asset) => ({
  id: asset.id,
  organization_id: asset.organizationId ?? "",
  asset_name: asset.assetName,
  asset_type: asset.assetType,
  location_tag_id: asset.locationTagId ?? "",
  unit_id: asset.unitId ?? "",
  created_at: asset.createdAt,
})

const buildAssetCreatePayload = (row: Record<string, any>): CreateAssetInput => {
  const assetName = getRowValue(row, ["asset_name", "assetName"])
  if (!assetName) {
    throw new Error("asset_name is required")
  }
  const assetType = getRowValue(row, ["asset_type", "assetType"]) ?? "equipment"
  const locationTagId = getRowValue(row, ["location_tag_id", "locationTagId"])
  return {
    assetName: String(assetName),
    assetType: String(assetType),
    locationTagId: locationTagId ? String(locationTagId) : undefined,
  }
}

const buildAssetUpdatePayload = (row: Record<string, any>): UpdateAssetInput => {
  const payload: UpdateAssetInput = {}
  const assetName = getRowValue(row, ["asset_name", "assetName"])
  if (assetName) payload.assetName = String(assetName)
  const assetType = getRowValue(row, ["asset_type", "assetType"])
  if (assetType) payload.assetType = String(assetType)
  const locationTagId = getRowValue(row, ["location_tag_id", "locationTagId"])
  if (locationTagId !== undefined) payload.locationTagId = locationTagId ? String(locationTagId) : undefined
  return payload
}

const uploadHandlers: Record<UploadType, UploadHandler> = {
  skus: {
    list: async ({ unitId }) => {
      const { items } = await skusApi.list({ unitId: unitId || undefined, limit: 100 })
      return items.map(mapSkuToDisplayRow)
    },
    create: async (row) => {
      const payload = buildSkuCreatePayload(row)
      await skusApi.create(payload)
    },
    update: async (row) => {
      const id = getRowValue(row, ["id", "sku_id"])
      if (!id) throw new Error("id is required for update")
      const payload = buildSkuUpdatePayload(row)
      await skusApi.update(String(id), payload)
    },
    delete: async (row) => {
      const id = getRowValue(row, ["id", "sku_id"])
      if (!id) throw new Error("id is required for delete")
      await skusApi.remove(String(id))
    },
  },
  location_tags: {
    list: async ({ unitId }) => {
      if (!unitId) return []
      const tags = await locationTagsApi.listByUnit(unitId)
      return tags.map(mapLocationTagToDisplayRow)
    },
    create: async (row, context) => {
      const payload = buildLocationTagCreatePayload(row, context)
      await locationTagsApi.create(payload)
    },
    update: async (row, context) => {
      const id = getRowValue(row, ["id", "location_tag_id"])
      if (!id) throw new Error("id is required for update")
      const payload = buildLocationTagUpdatePayload(row, context)
      await locationTagsApi.update(String(id), payload)
    },
    delete: async () => {
      throw new Error("Deleting location tags is not supported yet")
    },
  },
  assets: {
    list: async ({ unitId }) => {
      const response = await assetsApi.list({ unitId: unitId || undefined, limit: 100 })
      return response.items.map(mapAssetToDisplayRow)
    },
    create: async (row) => {
      const payload = buildAssetCreatePayload(row)
      await assetsApi.create(payload)
    },
    update: async (row) => {
      const id = getRowValue(row, ["id", "asset_id"])
      if (!id) throw new Error("id is required for update")
      const payload = buildAssetUpdatePayload(row)
      await assetsApi.update(String(id), payload)
    },
    delete: async (row) => {
      const id = getRowValue(row, ["id", "asset_id"])
      if (!id) throw new Error("id is required for delete")
      await assetsApi.remove(String(id))
    },
  },
}

export default function BulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<UploadType>("skus")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [uploadResults, setUploadResults] = useState<{
    success: number
    errors: string[]
    total: number
  } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    imported: number
    failed: number
    total: number
    errors: string[]
  } | null>(null)
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([])
  const [isOrgUnitsLoading, setIsOrgUnitsLoading] = useState(true)
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState<string>("")
  const [crudOperation, setCrudOperation] = useState<CrudOperation>("create")
  const [isOperationConfirmed, setIsOperationConfirmed] = useState(false)
  const [displayedData, setDisplayedData] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)

  const selectedOrgUnit = useMemo(
    () => orgUnits.find((unit) => unit.id === selectedOrgUnitId) ?? null,
    [orgUnits, selectedOrgUnitId],
  )

  const uploadContext = useMemo<UploadContext>(
    () => ({ unitId: selectedOrgUnitId || undefined }),
    [selectedOrgUnitId],
  )

  const requiresUnitSelection = uploadType === "location_tags"
  const canDisplayData = !requiresUnitSelection || !!uploadContext.unitId

  const tableDescription = useMemo(() => {
    if (!canDisplayData) {
      return "Select an organizational unit to load data."
    }
    if (isDataLoading) {
      return "Loading latest records..."
    }
    if (displayedData.length === 0) {
      return "No records found yet. Import data to see it here."
    }
    return `Showing ${displayedData.length} record${displayedData.length === 1 ? "" : "s"}.`
  }, [canDisplayData, displayedData.length, isDataLoading])

  const loadOrgUnits = useCallback(async () => {
    setIsOrgUnitsLoading(true)
    try {
      const units = await orgUnitsApi.list()
      setOrgUnits(units)
      setSelectedOrgUnitId((current) => current || units[0]?.id || "")
    } catch (error) {
      console.error("Failed to load org units", error)
      toast({
        title: "Unable to load organizational units",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      })
    } finally {
      setIsOrgUnitsLoading(false)
    }
  }, [])

  const refreshDisplayedData = useCallback(async () => {
    const handler = uploadHandlers[uploadType]
    if (!handler) return
    if (requiresUnitSelection && !uploadContext.unitId) {
      setDisplayedData([])
      return
    }
    setIsDataLoading(true)
    try {
      const data = await handler.list(uploadContext)
      setDisplayedData(data)
    } catch (error) {
      console.error("Failed to load existing data", error)
      toast({
        title: "Failed to load data",
        description: "We couldn't load the latest records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDataLoading(false)
    }
  }, [uploadContext, requiresUnitSelection, uploadType])

  useEffect(() => {
    loadOrgUnits()
  }, [loadOrgUnits])

  useEffect(() => {
    refreshDisplayedData()
  }, [refreshDisplayedData])

  useEffect(() => {
    setIsOperationConfirmed(false)
  }, [selectedOrgUnitId, crudOperation, uploadType])

  const validateDataType = (value: any, type: string, fieldName: string): { valid: boolean; error?: string } => {
    if (value === null || value === undefined || value === '') {
      return { valid: true }
    }

    switch (type) {
      case 'uuid4':
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(String(value))) {
          return { valid: false, error: `${fieldName} must be a valid UUID` }
        }
        break
      case 'varchar':
        if (typeof value !== 'string') {
          return { valid: false, error: `${fieldName} must be a string` }
        }
        break
      case 'int4':
        const intValue = parseInt(String(value))
        if (isNaN(intValue) || !Number.isInteger(intValue)) {
          return { valid: false, error: `${fieldName} must be an integer` }
        }
        break
      case 'numeric':
        const numValue = parseFloat(String(value))
        if (isNaN(numValue)) {
          return { valid: false, error: `${fieldName} must be a number` }
        }
        break
      case 'date':
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(String(value))) {
          return { valid: false, error: `${fieldName} must be in YYYY-MM-DD format` }
        }
        break
      case 'timestamptz':
        const timestamp = new Date(String(value))
        if (isNaN(timestamp.getTime())) {
          return { valid: false, error: `${fieldName} must be a valid timestamp` }
        }
        break
    }
    return { valid: true }
  }

  const downloadErrorReport = () => {
    if (!uploadResults || uploadResults.errors.length === 0) return

    const errorReport = [
      'Error Report - Bulk Upload',
      `Date: ${new Date().toLocaleString()}`,
      `Upload Type: ${uploadType}`,
      `Total Rows: ${uploadResults.total}`,
      `Valid Rows: ${uploadResults.success}`,
      `Errors Found: ${uploadResults.errors.length}`,
      '',
      'Detailed Errors:',
      '-------------------',
      ...uploadResults.errors
    ].join('\n')

    const blob = new Blob([errorReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${uploadType}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing errors: ${results.errors.map((e: any) => e.message).join(', ')}`))
            } else {
              resolve(results.data)
            }
          },
          error: (error: any) => reject(error)
        })
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            const headers = jsonData[0] as string[]
            const rows = jsonData.slice(1) as any[][]
            const objects = rows.map(row => {
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = row[index]
              })
              return obj
            })

            resolve(objects)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(new Error('Failed to read Excel file'))
        reader.readAsArrayBuffer(file)
      } else {
        reject(new Error('Unsupported file format. Please use CSV or Excel files.'))
      }
    })
  }

  const validateData = (data: any[], type: UploadType, operation: CrudOperation): { valid: ParsedRow[]; errors: string[] } => {
    const errors: string[] = []
    const valid: ParsedRow[] = []

    const schema = BACKEND_SCHEMAS[type]
    if (!schema) {
      errors.push(`Unknown upload type: ${type}`)
      return { valid: [], errors }
    }

    const idFields = ID_FIELD_MAP[type]

    data.forEach((row, index) => {
      let isValid = true
      const rowErrors: string[] = []

      const rowFields = Object.keys(row)
      const invalidFields = rowFields.filter(field => !schema.fields.includes(field))
      if (invalidFields.length > 0) {
        rowErrors.push(`Invalid fields: ${invalidFields.join(', ')}. Expected fields: ${schema.fields.join(', ')}`)
        isValid = false
      }

      for (const requiredField of schema.required) {
        if (!row[requiredField] || String(row[requiredField]).trim() === '') {
          rowErrors.push(`Missing required field: ${requiredField}`)
          isValid = false
        }
      }

      for (const field of schema.fields) {
        if (row[field] !== null && row[field] !== undefined && row[field] !== '') {
          const fieldType = schema.types[field as keyof typeof schema.types]
          const typeValidation = validateDataType(row[field], fieldType, field)
          if (!typeValidation.valid) {
            rowErrors.push(typeValidation.error!)
            isValid = false
          }
        }
      }

      if ((operation === 'update' || operation === 'delete') && idFields?.length) {
        const hasIdentifier = idFields.some((field) => {
          const value = row[field]
          return value !== undefined && value !== null && String(value).trim() !== ''
        })
        if (!hasIdentifier) {
          rowErrors.push(`Missing identifier (${idFields.join(', ')}) for ${operation} operation`)
          isValid = false
        }
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join('; ')}`)
      }

      if (isValid) {
        valid.push({ data: row, rowNumber: index + 1 })
      }
    })

    return { valid, errors }
  }

  const importData = async (
    rows: ParsedRow[],
    type: UploadType,
    operation: CrudOperation,
    context: UploadContext,
  ): Promise<{ imported: number; failed: number; errors: string[] }> => {
    const handler = uploadHandlers[type]
    if (!handler) {
      return {
        imported: 0,
        failed: rows.length,
        errors: [`No handler configured for ${type}`],
      }
    }

    const errors: string[] = []
    let imported = 0
    let failed = 0

    for (const { data: row, rowNumber } of rows) {
      try {
        if (operation === "create") {
          await handler.create(row, context)
        } else if (operation === "update") {
          const idValue = ID_FIELD_MAP[type]
            .map((key) => row[key])
            .find((value) => value !== undefined && value !== null && value !== "")
          if (!idValue) {
            throw new Error("Missing ID for update operation")
          }
          await handler.update(row, context)
        } else if (operation === "delete") {
          const idValue = ID_FIELD_MAP[type]
            .map((key) => row[key])
            .find((value) => value !== undefined && value !== null && value !== "")
          if (!idValue) {
            throw new Error("Missing ID for delete operation")
          }
          await handler.delete(row, context)
        }
        imported++
      } catch (error) {
        failed++
        errors.push(
          `Row ${rowNumber} failed: ${
            error instanceof Error ? error.message : "Unknown error while importing"
          }`,
        )
      }
    }

    return { imported, failed, errors }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: "No data to import",
        description: "Upload a file and validate it before importing.",
        variant: "destructive",
      })
      return
    }

    if (requiresUnitSelection && !uploadContext.unitId) {
      toast({
        title: "Select an organizational unit",
        description: "Choose a unit before importing location tags.",
        variant: "destructive",
      })
      return
    }

    const totalRows = parsedData.length

    setIsImporting(true)
    setImportResults(null)

    try {
      const results = await importData(parsedData, uploadType, crudOperation, uploadContext)
      setImportResults({ ...results, total: totalRows })

      if (results.imported > 0) {
        setSelectedFile(null)
        setParsedData([])
        setUploadResults(null)
        await refreshDisplayedData()
        toast({
          title: "Import completed",
          description: `${results.imported} records processed successfully.`,
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      setImportResults({
        imported: 0,
        failed: totalRows,
        total: totalRows,
        errors: [error instanceof Error ? error.message : "Import failed"],
      })
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setParsedData([])
    setUploadResults(null)

    try {
      const data = await parseFile(selectedFile)
      const { valid, errors } = validateData(data, uploadType, crudOperation)

      setParsedData(valid)
      setUploadResults({
        success: valid.length,
        errors,
        total: data.length
      })
    } catch (error) {
      setUploadResults({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        total: 0
      })
    } finally {
      setIsUploading(false)
    }
  }

  const uploadTypes = [
    {
      id: "skus",
      name: "SKUs",
      icon: Package,
      description: "Upload SKU data from CSV/Excel",
      color: "blue"
    },
    {
      id: "location_tags",
      name: "Location Tags",
      icon: Database,
      description: "Upload location tags data",
      color: "green"
    },
    {
      id: "assets",
      name: "Assets",
      icon: FileText,
      description: "Upload asset and equipment data",
      color: "purple"
    }
  ]

  const getTableTitle = () => {
    switch (uploadType) {
      case 'skus':
        return 'SKUs Data'
      case 'location_tags':
        return 'Location Tags Data'
      case 'assets':
        return 'Assets Data'
      default:
        return 'Data'
    }
  }

  const formatCellValue = (value: any, field: string): string => {
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    // Format dates
    if (field.includes('date') || field.includes('created_at') || field.includes('updated_at')) {
      if (typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
      }
    }

    // Format UUIDs (show shorter version for display)
    if (field.includes('id') && typeof value === 'string' && value.length > 20) {
      return `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
    }

    // Format numbers
    if (field.includes('quantity') || field.includes('capacity')) {
      const num = parseFloat(value)
      if (!isNaN(num)) {
        return num.toLocaleString()
      }
    }

    // Default: convert to string and truncate if too long
    const stringValue = String(value)
    return stringValue.length > 50 ? `${stringValue.substring(0, 47)}...` : stringValue
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bulk Upload"
        description="Import multiple items or data in bulk using CSV or Excel files"
        icon={Upload}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Target Org Unit</CardTitle>
          </CardHeader>
          <CardContent>
            {isOrgUnitsLoading ? (
              <div className="text-sm text-muted-foreground">Loading units…</div>
            ) : orgUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No organizational units found. Create one in the Org Units section first.
              </p>
            ) : (
              <Select value={selectedOrgUnitId} onValueChange={(value) => setSelectedOrgUnitId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select org unit" />
                </SelectTrigger>
                <SelectContent>
                  {orgUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitName} ({unit.unitType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Operation</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={crudOperation} onValueChange={(value: CrudOperation) => setCrudOperation(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New
                  </div>
                </SelectItem>
                <SelectItem value="update">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Update Existing
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Records
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 pt-4 border-t">
              <Button 
                className={`w-full ${isOperationConfirmed ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => {
                  // Confirm operation - could trigger validation or proceed to next step
                  if (requiresUnitSelection && !uploadContext.unitId) {
                    toast({
                      title: "Select an organizational unit",
                      description: "Choose a unit before confirming this action.",
                      variant: "destructive",
                    })
                    return
                  }
                  if (!isOperationConfirmed) {
                    setIsOperationConfirmed(true)
                    console.log('Operation confirmed:', {
                      unit: uploadContext.unitId,
                      type: uploadType,
                      operation: crudOperation
                    })
                  }
                }}
                disabled={requiresUnitSelection && !uploadContext.unitId}
              >
                {isOperationConfirmed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Configuration Confirmed
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Configuration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Operation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unit:</span>
                <Badge variant="outline">
                  {selectedOrgUnit?.unitName || "None"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Type:</span>
                <Badge variant="outline" className="capitalize">
                  {uploadType}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Operation:</span>
                <Badge variant={crudOperation === "delete" ? "destructive" : "default"} className="capitalize">
                  {crudOperation}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <Badge variant={isOperationConfirmed ? "default" : "secondary"} className={isOperationConfirmed ? "bg-green-100 text-green-800 border-green-200" : ""}>
                  {isOperationConfirmed ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {uploadTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-200 ${
              uploadType === type.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "hover:shadow-md"
            }`}
            onClick={() => setUploadType(type.id as UploadType)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 flex items-center justify-center text-white shadow-sm mb-4`}>
                <type.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
              {uploadType === type.id && (
                <Badge variant="secondary" className="mt-3">
                  Selected
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Select or drag and drop your CSV or Excel file to upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedFile ? "File Selected" : "Drop your file here"}
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedFile
                ? selectedFile.name
                : "or click to browse files (CSV, XLS, XLSX)"}
            </p>
            <div className="flex gap-4 justify-center">
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Choose File
              </Button>
              {selectedFile && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upload File
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 h-full grow rounded-2xl border-0 sm:border border-slate-200 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">File Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Information about the uploaded file
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{selectedFile.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{selectedFile.type || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Type:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{uploadTypes.find(t => t.id === uploadType)?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadResults && (
        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {uploadResults.errors.length === 0 ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload Results</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Processing completed for {uploadResults.total} rows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-6 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{uploadResults.success}</div>
              <div className="text-sm text-green-700 dark:text-green-300 font-medium">Valid Rows</div>
            </div>
            <div className="text-center p-6 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{uploadResults.errors.length}</div>
              <div className="text-sm text-red-700 dark:text-red-300 font-medium">Errors</div>
            </div>
            <div className="text-center p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{uploadResults.total}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Rows</div>
            </div>
          </div>

          {uploadResults.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">Errors Found</h4>
              <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 max-h-64 overflow-y-auto">
                <ul className="list-disc list-inside space-y-2 text-sm text-red-700 dark:text-red-300">
                  {uploadResults.errors.map((error, index) => (
                    <li key={index} className="leading-relaxed">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Data Preview (first 5 rows)</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(parsedData[0].data).map((key) => (
                        <TableHead key={key}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row.data).map((value: any, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {formatCellValue(value, Object.keys(parsedData[0].data)[cellIndex])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedData.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  ... and {parsedData.length - 5} more rows
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
              onClick={handleImport}
              disabled={isImporting || uploadResults.success === 0}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {uploadResults.success} Valid Records
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadErrorReport} 
              disabled={uploadResults.errors.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Error Report
            </Button>
          </div>
        </div>
      )}

      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResults.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              Import Results
            </CardTitle>
            <CardDescription>
              Import completed for {importResults.total} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                <div className="text-sm text-green-700">Successfully Imported</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                <div className="text-sm text-red-700">Failed to Import</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                <div className="text-sm text-blue-700">Total Processed</div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-red-700 mb-2">Import Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {importResults.imported > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-700">Import Successful!</h4>
                </div>
                <p className="text-sm text-green-700">
                  {importResults.imported} {uploadTypes.find(t => t.id === uploadType)?.name} records have been successfully imported and added to the data table below.
                </p>
                <div className="mt-4 flex gap-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Link href={`/dashboard/reference-data/${uploadType}`}>
                      View Imported Data
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImportResults(null)
                      setSelectedFile(null)
                      setParsedData([])
                      setUploadResults(null)
                    }}
                  >
                    Upload Another File
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getTableTitle()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {tableDescription}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {BACKEND_SCHEMAS[uploadType as keyof typeof BACKEND_SCHEMAS].fields.map((field) => (
                  <TableHead key={field}>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!canDisplayData ? (
                <TableRow>
                  <TableCell colSpan={BACKEND_SCHEMAS[uploadType as keyof typeof BACKEND_SCHEMAS].fields.length} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    Select an organizational unit to view {uploadType.replace('_', ' ')} data.
                  </TableCell>
                </TableRow>
              ) : isDataLoading ? (
                <TableRow>
                  <TableCell colSpan={BACKEND_SCHEMAS[uploadType as keyof typeof BACKEND_SCHEMAS].fields.length} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : displayedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={BACKEND_SCHEMAS[uploadType as keyof typeof BACKEND_SCHEMAS].fields.length} 
                    className="h-24 text-center text-gray-500 dark:text-gray-400"
                  >
                    No data available. Upload a file to get started.
                  </TableCell>
                </TableRow>
              ) : (
                displayedData.map((row, index) => (
                  <TableRow key={index}>
                    {BACKEND_SCHEMAS[uploadType as keyof typeof BACKEND_SCHEMAS].fields.map((field) => (
                      <TableCell key={field} className="font-medium">
                        {formatCellValue((row as any)[field], field)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
