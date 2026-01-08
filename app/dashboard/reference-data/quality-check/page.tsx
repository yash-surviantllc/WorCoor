"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample SKUs data
const initialSkus = [
  {
    id: 1,
    name: "WD-FRAME-01",
    description: "Wooden Frame - Oak",
    quantity: 45,
    minQuantity: 50,
    type: "Primary",
    category: "Raw Material",
    location: "Warehouse A",
    unitCost: 25.5,
    currency: "USD",
    unitWeight: 2.3,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "A",
    qualityCheckDone: true,
    qualityCheckDate: "2023-11-01",
    qualityCheckNotes: "Passed all quality tests. No defects found.",
  },
  {
    id: 2,
    name: "WD-FRAME-02",
    description: "Wooden Frame - Maple",
    quantity: 60,
    minQuantity: 40,
    type: "Secondary",
    category: "Raw Material",
    location: "Warehouse A",
    unitCost: 28.75,
    currency: "USD",
    unitWeight: 2.1,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "B",
    qualityCheckDone: true,
    qualityCheckDate: "2023-11-02",
    qualityCheckNotes: "Minor grain inconsistencies, but within acceptable range.",
  },
  {
    id: 3,
    name: "WD-FRAME-03",
    description: "Wooden Frame - Walnut",
    quantity: 30,
    minQuantity: 25,
    type: "Secondary",
    category: "Raw Material",
    location: "Warehouse A",
    unitCost: 32.0,
    currency: "USD",
    unitWeight: 2.5,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "A",
    qualityCheckDone: false,
    qualityCheckDate: "",
    qualityCheckNotes: "",
  },
  {
    id: 4,
    name: "MT-LEG-01",
    description: "Metal Legs - Chrome",
    quantity: 120,
    minQuantity: 100,
    type: "Primary",
    category: "Component",
    location: "Warehouse B",
    unitCost: 15.25,
    currency: "USD",
    unitWeight: 1.8,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "A",
    qualityCheckDone: true,
    qualityCheckDate: "2023-11-01",
    qualityCheckNotes: "All measurements within specification. Finish is excellent.",
  },
  {
    id: 5,
    name: "MT-LEG-02",
    description: "Metal Legs - Black",
    quantity: 85,
    minQuantity: 80,
    type: "Secondary",
    category: "Component",
    location: "Warehouse B",
    unitCost: 14.5,
    currency: "USD",
    unitWeight: 1.7,
    weightUnit: "kg",
    quantityUnit: "pieces",
    qualityRating: "B",
    qualityCheckDone: true,
    qualityCheckDate: "2023-11-02",
    qualityCheckNotes: "Some minor finish imperfections, but structurally sound.",
  },
]

export default function QualityCheckPage() {
  const [skus, setSkus] = useState(initialSkus)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [qualityFilter, setQualityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSku, setSelectedSku] = useState<any>(null)
  const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false)
  const [qualityFormData, setQualityFormData] = useState({
    qualityRating: "",
    qualityCheckDone: false,
    qualityCheckNotes: "",
  })

  const itemsPerPage = 5

  // Get quality badge
  const getQualityBadge = (rating: string) => {
    switch (rating) {
      case "A":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">A - Premium</Badge>
      case "B":
        return <Badge className="bg-white text-blue-800 border border-blue-200 hover:bg-white">B - Standard</Badge>
      case "C":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">C - Economy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Rated</Badge>
    }
  }

  // Get quality check badge
  const getQualityCheckBadge = (checked: boolean) => {
    return checked ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Checked</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pending</Badge>
    )
  }

  // Filter SKUs based on search term, category filter, quality filter, and status filter
  const filteredSkus = skus.filter((sku) => {
    // Search filter
    const matchesSearch =
      sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.description?.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === "All" || sku.category === categoryFilter

    // Quality filter
    const matchesQuality = qualityFilter === "All" || sku.qualityRating === qualityFilter

    // Status filter
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Checked" && sku.qualityCheckDone) ||
      (statusFilter === "Pending" && !sku.qualityCheckDone)

    return matchesSearch && matchesCategory && matchesQuality && matchesStatus
  })

  // Paginate SKUs
  const indexOfLastSku = currentPage * itemsPerPage
  const indexOfFirstSku = indexOfLastSku - itemsPerPage
  const currentSkus = filteredSkus.slice(indexOfFirstSku, indexOfLastSku)
  const totalPages = Math.ceil(filteredSkus.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Handle opening quality check dialog
  const handleOpenQualityDialog = (sku: any) => {
    setSelectedSku(sku)
    setQualityFormData({
      qualityRating: sku.qualityRating || "Not Rated",
      qualityCheckDone: sku.qualityCheckDone,
      qualityCheckNotes: sku.qualityCheckNotes || "",
    })
    setIsQualityDialogOpen(true)
  }

  // Handle quality check form submission
  const handleQualityCheckSubmit = () => {
    if (!selectedSku) return

    const today = new Date().toISOString().split("T")[0]

    const updatedSkus = skus.map((sku) =>
      sku.id === selectedSku.id
        ? {
            ...sku,
            qualityRating: qualityFormData.qualityRating,
            qualityCheckDone: qualityFormData.qualityCheckDone,
            qualityCheckNotes: qualityFormData.qualityCheckNotes,
            qualityCheckDate: qualityFormData.qualityCheckDone ? today : "",
          }
        : sku,
    )

    setSkus(updatedSkus)
    setIsQualityDialogOpen(false)

    toast({
      title: "Quality check updated",
      description: `Quality check for ${selectedSku.name} has been updated.`,
    })
  }

  // Calculate summary metrics
  const checkedCount = skus.filter((sku) => sku.qualityCheckDone).length
  const pendingCount = skus.filter((sku) => !sku.qualityCheckDone).length
  const premiumCount = skus.filter((sku) => sku.qualityRating === "A").length
  const standardCount = skus.filter((sku) => sku.qualityRating === "B").length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Quality Check"
        description="Monitor and analyze material quality across your operations"
        icon={CheckCircle}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Quality (A)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard Quality (B)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{standardCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Check Management</CardTitle>
          <CardDescription>Manage quality checks for all SKUs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SKUs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-filter" className="whitespace-nowrap">
                    Category:
                  </Label>
                  <Select onValueChange={(value) => setCategoryFilter(value)} defaultValue="All">
                    <SelectTrigger id="category-filter" className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Raw Material">Raw Material</SelectItem>
                      <SelectItem value="Component">Component</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="quality-filter" className="whitespace-nowrap">
                    Quality:
                  </Label>
                  <Select onValueChange={(value) => setQualityFilter(value)} defaultValue="All">
                    <SelectTrigger id="quality-filter" className="w-[180px]">
                      <SelectValue placeholder="All Qualities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Qualities</SelectItem>
                      <SelectItem value="A">A - Premium</SelectItem>
                      <SelectItem value="B">B - Standard</SelectItem>
                      <SelectItem value="C">C - Economy</SelectItem>
                      <SelectItem value="Not Rated">Not Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter" className="whitespace-nowrap">
                    Status:
                  </Label>
                  <Select onValueChange={(value) => setStatusFilter(value)} defaultValue="All">
                    <SelectTrigger id="status-filter" className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Checked">Checked</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quality Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSkus.length > 0 ? (
                    currentSkus.map((sku) => (
                      <TableRow key={sku.id}>
                        <TableCell className="font-medium">{sku.name}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={sku.description}>
                            {sku.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sku.qualityRating ? getQualityBadge(sku.qualityRating) : getQualityBadge("Not Rated")}
                        </TableCell>
                        <TableCell>{getQualityCheckBadge(sku.qualityCheckDone)}</TableCell>
                        <TableCell>{sku.qualityCheckDate || "Not checked"}</TableCell>
                        <TableCell>{sku.category}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenQualityDialog(sku)}>
                            {sku.qualityCheckDone ? "Update" : "Check"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No SKUs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredSkus.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstSku + 1} to {Math.min(indexOfLastSku, filteredSkus.length)} of{" "}
                  {filteredSkus.length} SKUs
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

      {/* Quality Check Dialog */}
      <Dialog open={isQualityDialogOpen} onOpenChange={setIsQualityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quality Check</DialogTitle>
            <DialogDescription>{selectedSku && `Perform quality check for ${selectedSku.name}`}</DialogDescription>
          </DialogHeader>
          {selectedSku && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quality-rating" className="text-right">
                  Quality Rating
                </Label>
                <Select
                  value={qualityFormData.qualityRating}
                  onValueChange={(value) => setQualityFormData({ ...qualityFormData, qualityRating: value })}
                >
                  <SelectTrigger id="quality-rating" className="col-span-3">
                    <SelectValue placeholder="Select quality rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Premium</SelectItem>
                    <SelectItem value="B">B - Standard</SelectItem>
                    <SelectItem value="C">C - Economy</SelectItem>
                    <SelectItem value="Not Rated">Not Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quality-check" className="text-right">
                  Check Complete
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="quality-check"
                    checked={qualityFormData.qualityCheckDone}
                    onCheckedChange={(checked) =>
                      setQualityFormData({ ...qualityFormData, qualityCheckDone: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="quality-check"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as checked
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quality-notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="quality-notes"
                  className="col-span-3"
                  placeholder="Enter quality check notes..."
                  value={qualityFormData.qualityCheckNotes}
                  onChange={(e) => setQualityFormData({ ...qualityFormData, qualityCheckNotes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQualityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQualityCheckSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
