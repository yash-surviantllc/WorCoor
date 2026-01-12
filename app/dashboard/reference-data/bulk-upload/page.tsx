"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, Database, Package, ArrowRight, CheckCircle, AlertCircle, Loader2, RefreshCw, Plus, Edit, Trash2 } from "lucide-react"
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import localStorageService from "@/src/services/localStorageService"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types
interface OrgUnit {
  id: string
  name: string
  type: "Warehouse" | "Production" | "Office"
  status: "active" | "inactive"
  location: string
  description?: string
  createdAt: string
  updatedAt: string
}

type CrudOperation = "create" | "update" | "delete"

export default function BulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<string>("skus")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [uploadResults, setUploadResults] = useState<{
    success: number
    errors: string[]
    total: number
  } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    imported: number
    failed: number
    errors: string[]
  } | null>(null)
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([])
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>("")
  const [crudOperation, setCrudOperation] = useState<CrudOperation>("create")
  const [cleanExistingData, setCleanExistingData] = useState(false)

  // Load org units on component mount
  useEffect(() => {
    const storedUnits = localStorage.getItem("worcoor-org-units")
    if (storedUnits) {
      try {
        const parsedUnits = JSON.parse(storedUnits)
        setOrgUnits(parsedUnits)
        // Auto-select first active org unit
        const activeUnit = parsedUnits.find((unit: OrgUnit) => unit.status === "active")
        if (activeUnit) {
          setSelectedOrgUnit(activeUnit.id)
        }
      } catch (error) {
        console.error("Error parsing stored org units:", error)
      }
    }
  }, [])

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
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
            } else {
              resolve(results.data)
            }
          },
          error: (error) => reject(error)
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

            // Convert to object format with first row as headers
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

  const validateData = (data: any[], type: string, operation: CrudOperation, orgUnitId: string): { valid: any[], errors: string[] } => {
    const errors: string[] = []
    const valid: any[] = []

    // Get existing data for validation
    const storageKey = `${type}_${orgUnitId}`
    const existingData = localStorageService.getItem<any[]>(storageKey) || []

    data.forEach((row, index) => {
      let isValid = true

      if (operation === 'delete') {
        // For delete, only need the ID field
        const idField = type === 'skus' ? 'sku_id' : type === 'locations' ? 'location_id' : 'asset_id'
        if (!row[idField]) {
          errors.push(`Row ${index + 1}: Missing ${idField} for delete operation`)
          isValid = false
        } else {
          // Check if record exists
          const exists = existingData.some(item => item.id === row[idField])
          if (!exists) {
            errors.push(`Row ${index + 1}: ${idField} ${row[idField]} not found for delete operation`)
            isValid = false
          }
        }
      } else if (operation === 'update') {
        // For update, need ID and at least one field to update
        const idField = type === 'skus' ? 'sku_id' : type === 'locations' ? 'location_id' : 'asset_id'
        if (!row[idField]) {
          errors.push(`Row ${index + 1}: Missing ${idField} for update operation`)
          isValid = false
        } else {
          // Check if record exists
          const exists = existingData.some(item => item.id === row[idField])
          if (!exists) {
            errors.push(`Row ${index + 1}: ${idField} ${row[idField]} not found for update operation`)
            isValid = false
          }
        }
      } else if (operation === 'create') {
        // For create, validate required fields
        if (type === 'skus') {
          if (!row.sku_id && !row.name) {
            errors.push(`Row ${index + 1}: Missing required fields (sku_id or name) for create operation`)
            isValid = false
          } else if (row.sku_id) {
            // Check for duplicate SKU ID
            const duplicate = existingData.find(sku => sku.id === row.sku_id)
            if (duplicate) {
              errors.push(`Row ${index + 1}: SKU ID ${row.sku_id} already exists`)
              isValid = false
            }
          }
        } else if (type === 'locations') {
          if (!row.location_id && !row.name) {
            errors.push(`Row ${index + 1}: Missing required fields (location_id or name) for create operation`)
            isValid = false
          } else if (row.location_id) {
            // Check for duplicate location ID
            const duplicate = existingData.find(location => location.id === row.location_id)
            if (duplicate) {
              errors.push(`Row ${index + 1}: Location ID ${row.location_id} already exists`)
              isValid = false
            }
          }
        } else if (type === 'assets') {
          if (!row.asset_id && !row.name) {
            errors.push(`Row ${index + 1}: Missing required fields (asset_id or name) for create operation`)
            isValid = false
          } else if (row.asset_id) {
            // Check for duplicate asset ID
            const duplicate = existingData.find(asset => asset.id === row.asset_id)
            if (duplicate) {
              errors.push(`Row ${index + 1}: Asset ID ${row.asset_id} already exists`)
              isValid = false
            }
          }
        }
      }

      if (isValid) {
        valid.push(row)
      }
    })

    return { valid, errors }
  }

  const importSkus = async (data: any[], orgUnitId: string, operation: CrudOperation, cleanData: boolean): Promise<{ imported: number; failed: number; errors: string[] }> => {
    const errors: string[] = []
    let imported = 0
    let failed = 0

    const storageKey = `skus_${orgUnitId}`

    try {
      let existingSkus = localStorageService.getItem<any[]>(storageKey) || []

      if (cleanData && operation === 'create') {
        existingSkus = []
      }

      if (operation === 'delete') {
        // For delete operation, remove records by sku_id
        const initialCount = existingSkus.length
        existingSkus = existingSkus.filter(sku => {
          const shouldDelete = data.some(row => row.sku_id === sku.id)
          if (shouldDelete) imported++
          return !shouldDelete
        })
        failed = data.length - imported
      } else if (operation === 'update') {
        // For update operation, update existing records
        for (const row of data) {
          const existingIndex = existingSkus.findIndex(sku => sku.id === row.sku_id)
          if (existingIndex >= 0) {
            existingSkus[existingIndex] = {
              ...existingSkus[existingIndex],
              parentResource: row.parent_resource || row.category || existingSkus[existingIndex].parentResource,
              name: row.name || existingSkus[existingIndex].name,
              brand: row.brand || existingSkus[existingIndex].brand,
              procuredDate: row.procured_date || existingSkus[existingIndex].procuredDate,
              location: row.location || existingSkus[existingIndex].location,
              skuCode: row.sku_code || existingSkus[existingIndex].skuCode,
              availableQuantity: parseInt(row.available_quantity) || existingSkus[existingIndex].availableQuantity,
              skuUnit: row.sku_unit || row.unit || existingSkus[existingIndex].skuUnit,
              unit: row.unit || existingSkus[existingIndex].unit,
              department: row.department || existingSkus[existingIndex].department,
              wastageQuantity: row.wastage_quantity || existingSkus[existingIndex].wastageQuantity,
              description: row.description || existingSkus[existingIndex].description,
              minQuantity: parseInt(row.min_quantity) || existingSkus[existingIndex].minQuantity,
              type: row.type || existingSkus[existingIndex].type,
              category: row.category || existingSkus[existingIndex].category,
              unitCost: parseFloat(row.unit_cost) || existingSkus[existingIndex].unitCost,
              currency: row.currency || existingSkus[existingIndex].currency,
              unitWeight: parseFloat(row.unit_weight) || existingSkus[existingIndex].unitWeight,
              weightUnit: row.weight_unit || existingSkus[existingIndex].weightUnit,
              quantityUnit: row.quantity_unit || existingSkus[existingIndex].quantityUnit,
              qualityRating: row.quality_rating || existingSkus[existingIndex].qualityRating,
              qualityCheckDone: row.quality_check_done === 'true' || existingSkus[existingIndex].qualityCheckDone,
              qualityCheckDate: row.quality_check_date || existingSkus[existingIndex].qualityCheckDate,
              qualityCheckNotes: row.quality_check_notes || existingSkus[existingIndex].qualityCheckNotes,
              taggedForProduction: parseInt(row.tagged_for_production) || existingSkus[existingIndex].taggedForProduction,
              wastage: parseInt(row.wastage) || existingSkus[existingIndex].wastage,
              totalProcured: parseInt(row.total_procured) || existingSkus[existingIndex].totalProcured,
            }
            imported++
          } else {
            errors.push(`SKU ID ${row.sku_id} not found for update`)
            failed++
          }
        }
      } else if (operation === 'create') {
        // For create operation, add new records
        for (const row of data) {
          try {
            // Generate SKU ID if not provided
            const skuId = row.sku_id || `SKU-${String(existingSkus.length + imported + 1).padStart(3, '0')}`

            // Check for duplicate SKU ID
            const duplicate = existingSkus.find(sku => sku.id === skuId)
            if (duplicate) {
              errors.push(`SKU ID ${skuId} already exists`)
              failed++
              continue
            }

            const newSku = {
              id: skuId,
              parentResource: row.parent_resource || row.category || 'Unknown',
              name: row.name || 'Unnamed SKU',
              brand: row.brand || '',
              procuredDate: row.procured_date || new Date().toISOString().split('T')[0],
              location: row.location || '',
              skuCode: row.sku_code || skuId,
              availableQuantity: parseInt(row.available_quantity) || 0,
              skuUnit: row.sku_unit || row.unit || 'Count',
              unit: row.unit || '',
              department: row.department || '',
              wastageQuantity: row.wastage_quantity || '',
              description: row.description || '',
              minQuantity: parseInt(row.min_quantity) || 0,
              type: row.type || 'Primary',
              category: row.category || 'General',
              unitCost: parseFloat(row.unit_cost) || 0,
              currency: row.currency || 'USD',
              unitWeight: parseFloat(row.unit_weight) || 0,
              weightUnit: row.weight_unit || 'kg',
              quantityUnit: row.quantity_unit || 'pieces',
              qualityRating: row.quality_rating || 'A',
              qualityCheckDone: row.quality_check_done === 'true' || false,
              qualityCheckDate: row.quality_check_date || '',
              qualityCheckNotes: row.quality_check_notes || '',
              taggedForProduction: parseInt(row.tagged_for_production) || 0,
              wastage: parseInt(row.wastage) || 0,
              totalProcured: parseInt(row.total_procured) || 0,
            }

            existingSkus.push(newSku)
            imported++
          } catch (error) {
            errors.push(`Failed to import SKU: ${error instanceof Error ? error.message : 'Unknown error'}`)
            failed++
          }
        }
      }

      localStorageService.setItem(storageKey, existingSkus)
    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { imported, failed, errors }
  }

  const importLocations = async (data: any[], orgUnitId: string, operation: CrudOperation, cleanData: boolean): Promise<{ imported: number; failed: number; errors: string[] }> => {
    const errors: string[] = []
    let imported = 0
    let failed = 0

    const storageKey = `locations_${orgUnitId}`

    try {
      let existingLocations = localStorageService.getItem<any[]>(storageKey) || []

      if (cleanData && operation === 'create') {
        existingLocations = []
      }

      if (operation === 'delete') {
        // For delete operation, remove records by location_id
        const initialCount = existingLocations.length
        existingLocations = existingLocations.filter(location => {
          const shouldDelete = data.some(row => row.location_id === location.id)
          if (shouldDelete) imported++
          return !shouldDelete
        })
        failed = data.length - imported
      } else if (operation === 'update') {
        // For update operation, update existing records
        for (const row of data) {
          const existingIndex = existingLocations.findIndex(location => location.id === row.location_id)
          if (existingIndex >= 0) {
            existingLocations[existingIndex] = {
              ...existingLocations[existingIndex],
              name: row.name || existingLocations[existingIndex].name,
              category: row.category || existingLocations[existingIndex].category,
              description: row.description || existingLocations[existingIndex].description,
              capacity: parseInt(row.capacity) || existingLocations[existingIndex].capacity,
              unit: row.unit || existingLocations[existingIndex].unit,
              zone: row.zone || existingLocations[existingIndex].zone,
              type: row.type || existingLocations[existingIndex].type,
              status: row.status || existingLocations[existingIndex].status,
            }
            imported++
          } else {
            errors.push(`Location ID ${row.location_id} not found for update`)
            failed++
          }
        }
      } else if (operation === 'create') {
        // For create operation, add new records
        for (const row of data) {
          try {
            const locationId = row.location_id || `LOC-${String(existingLocations.length + imported + 1).padStart(3, '0')}`

            // Check for duplicate location ID
            const duplicate = existingLocations.find(location => location.id === locationId)
            if (duplicate) {
              errors.push(`Location ID ${locationId} already exists`)
              failed++
              continue
            }

            const newLocation = {
              id: locationId,
              name: row.name || locationId,
              category: row.category || 'General',
              description: row.description || '',
              capacity: parseInt(row.capacity) || 0,
              unit: row.unit || '',
              zone: row.zone || '',
              type: row.type || 'Storage',
              status: row.status || 'Active',
            }

            existingLocations.push(newLocation)
            imported++
          } catch (error) {
            errors.push(`Failed to import location: ${error instanceof Error ? error.message : 'Unknown error'}`)
            failed++
          }
        }
      }

      localStorageService.setItem(storageKey, existingLocations)
    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { imported, failed, errors }
  }

  const importAssets = async (data: any[], orgUnitId: string, operation: CrudOperation, cleanData: boolean): Promise<{ imported: number; failed: number; errors: string[] }> => {
    const errors: string[] = []
    let imported = 0
    let failed = 0

    const storageKey = `assets_${orgUnitId}`

    try {
      let existingAssets = localStorageService.getItem<any[]>(storageKey) || []

      if (cleanData && operation === 'create') {
        existingAssets = []
      }

      if (operation === 'delete') {
        // For delete operation, remove records by asset_id
        const initialCount = existingAssets.length
        existingAssets = existingAssets.filter(asset => {
          const shouldDelete = data.some(row => row.asset_id === asset.id)
          if (shouldDelete) imported++
          return !shouldDelete
        })
        failed = data.length - imported
      } else if (operation === 'update') {
        // For update operation, update existing records
        for (const row of data) {
          const existingIndex = existingAssets.findIndex(asset => asset.id === row.asset_id)
          if (existingIndex >= 0) {
            existingAssets[existingIndex] = {
              ...existingAssets[existingIndex],
              name: row.name || existingAssets[existingIndex].name,
              category: row.category || existingAssets[existingIndex].category,
              type: row.type || existingAssets[existingIndex].type,
              location: row.location || existingAssets[existingIndex].location,
              serialNumber: row.serial_number || existingAssets[existingIndex].serialNumber,
              manufacturer: row.manufacturer || existingAssets[existingIndex].manufacturer,
              model: row.model || existingAssets[existingIndex].model,
              purchaseDate: row.purchase_date || existingAssets[existingIndex].purchaseDate,
              purchaseCost: parseFloat(row.purchase_cost) || existingAssets[existingIndex].purchaseCost,
              currency: row.currency || existingAssets[existingIndex].currency,
              status: row.status || existingAssets[existingIndex].status,
              description: row.description || existingAssets[existingIndex].description,
              maintenanceSchedule: row.maintenance_schedule || existingAssets[existingIndex].maintenanceSchedule,
              lastMaintenance: row.last_maintenance || existingAssets[existingIndex].lastMaintenance,
              nextMaintenance: row.next_maintenance || existingAssets[existingIndex].nextMaintenance,
            }
            imported++
          } else {
            errors.push(`Asset ID ${row.asset_id} not found for update`)
            failed++
          }
        }
      } else if (operation === 'create') {
        // For create operation, add new records
        for (const row of data) {
          try {
            const assetId = row.asset_id || `ASSET-${String(existingAssets.length + imported + 1).padStart(3, '0')}`

            // Check for duplicate asset ID
            const duplicate = existingAssets.find(asset => asset.id === assetId)
            if (duplicate) {
              errors.push(`Asset ID ${assetId} already exists`)
              failed++
              continue
            }

            const newAsset = {
              id: assetId,
              name: row.name || 'Unnamed Asset',
              category: row.category || 'Equipment',
              type: row.type || 'General',
              location: row.location || '',
              serialNumber: row.serial_number || '',
              manufacturer: row.manufacturer || '',
              model: row.model || '',
              purchaseDate: row.purchase_date || '',
              purchaseCost: parseFloat(row.purchase_cost) || 0,
              currency: row.currency || 'USD',
              status: row.status || 'Active',
              description: row.description || '',
              maintenanceSchedule: row.maintenance_schedule || '',
              lastMaintenance: row.last_maintenance || '',
              nextMaintenance: row.next_maintenance || '',
            }

            existingAssets.push(newAsset)
            imported++
          } catch (error) {
            errors.push(`Failed to import asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
            failed++
          }
        }
      }

      localStorageService.setItem(storageKey, existingAssets)
    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { imported, failed, errors }
  }

  const handleImport = async () => {
    if (parsedData.length === 0 || !selectedOrgUnit) return

    setIsImporting(true)
    setImportResults(null)

    try {
      let results: { imported: number; failed: number; errors: string[] }

      switch (uploadType) {
        case 'skus':
          results = await importSkus(parsedData, selectedOrgUnit, crudOperation, cleanExistingData)
          break
        case 'locations':
          results = await importLocations(parsedData, selectedOrgUnit, crudOperation, cleanExistingData)
          break
        case 'assets':
          results = await importAssets(parsedData, selectedOrgUnit, crudOperation, cleanExistingData)
          break
        default:
          results = { imported: 0, failed: parsedData.length, errors: ['Unknown upload type'] }
      }

      setImportResults(results)

      if (results.imported > 0) {
        // Reset form on successful import
        setSelectedFile(null)
        setParsedData([])
        setUploadResults(null)
      }
    } catch (error) {
      setImportResults({
        imported: 0,
        failed: parsedData.length,
        errors: [error instanceof Error ? error.message : 'Import failed']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setParsedData([]);
    setUploadResults(null);

    try {
      const data = await parseFile(selectedFile);
      const { valid, errors } = validateData(data, uploadType, crudOperation, selectedOrgUnit);

      setParsedData(valid);
      setUploadResults({
        success: valid.length,
        errors,
        total: data.length
      });
    } catch (error) {
      setUploadResults({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        total: 0
      });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadTypes = [
    {
      id: "skus",
      name: "SKUs",
      icon: Package,
      description: "Upload SKU data from CSV/Excel",
      color: "blue"
    },
    {
      id: "locations",
      name: "Locations",
      icon: Database,
      description: "Upload location tags and categories",
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bulk Upload"
        description="Import multiple items or data in bulk using CSV or Excel files"
        icon={Upload}
      />

      {/* Configuration Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Org Unit Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Target Org Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedOrgUnit} onValueChange={setSelectedOrgUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select org unit" />
              </SelectTrigger>
              <SelectContent>
                {orgUnits.filter(unit => unit.status === "active").map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {orgUnits.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No org units available. Please create one first.
              </p>
            )}
          </CardContent>
        </Card>

        {/* CRUD Operation Selection */}
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
          </CardContent>
        </Card>

        {/* Clean Data Option */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="clean-data"
                checked={cleanExistingData}
                onChange={(e) => setCleanExistingData(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="clean-data" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Clean existing data
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Replace all existing data for this org unit
            </p>
          </CardContent>
        </Card>

        {/* Operation Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Operation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unit:</span>
                <Badge variant="outline">
                  {orgUnits.find(u => u.id === selectedOrgUnit)?.name || "None"}
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
              {cleanExistingData && (
                <div className="flex justify-between text-sm">
                  <span>Clean:</span>
                  <Badge variant="destructive">Enabled</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Type Selection */}
      <div className="grid gap-4 md:grid-cols-3">
        {uploadTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-200 ${
              uploadType === type.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "hover:shadow-md"
            }`}
            onClick={() => setUploadType(type.id)}
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

      {/* File Upload Area */}
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
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">File Details:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedFile.name}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedFile.type || "Unknown"}
                </div>
                <div>
                  <span className="font-medium">Upload Type:</span> {uploadTypes.find(t => t.id === uploadType)?.name}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResults.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              Upload Results
            </CardTitle>
            <CardDescription>
              Processing completed for {uploadResults.total} rows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResults.success}</div>
                <div className="text-sm text-green-700">Valid Rows</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{uploadResults.errors.length}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{uploadResults.total}</div>
                <div className="text-sm text-blue-700">Total Rows</div>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-red-700 mb-2">Errors Found:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {parsedData.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Data Preview (first 5 rows):</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(parsedData[0]).map((key) => (
                          <th
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {String(value || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... and {parsedData.length - 5} more rows
                    </p>
                  )}
                </div>

                {uploadResults.success > 0 && (
                  <div className="mt-6 flex gap-4">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleImport}
                      disabled={isImporting}
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
                    <Button variant="outline">
                      Download Error Report
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
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
              Import completed for {parsedData.length} records
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
                <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
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
                  {importResults.imported} {uploadTypes.find(t => t.id === uploadType)?.name} records have been successfully imported and are now available in the system.
                </p>
                <div className="mt-4 flex gap-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Link href={`/dashboard/reference-data/${uploadType === 'skus' ? 'skus' : uploadType === 'locations' ? 'location-tags' : 'assets'}`}>
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use UTF-8 encoding</li>
                <li>Include headers in the first row</li>
                <li>Use commas as separators</li>
                <li>Ensure date fields are in YYYY-MM-DD format</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Excel Format Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use .xlsx or .xls format</li>
                <li>Data should start from cell A1</li>
                <li>Include clear column headers</li>
                <li>Avoid merged cells and complex formatting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
