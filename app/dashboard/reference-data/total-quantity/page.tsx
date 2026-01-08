"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample SKUs data
const initialSkus = [
  {
    id: 1,
    name: "WD-FRAME-01",
    description: "Wooden Frame - Oak",
    quantity: 45,
    totalProcured: 60,
    minQuantity: 50,
    maxQuantity: 100,
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
    taggedForProduction: 10,
    wastage: 5,
    lastUpdated: "2023-11-01",
  },
  {
    id: 2,
    name: "WD-FRAME-02",
    description: "Wooden Frame - Maple",
    quantity: 60,
    totalProcured: 75,
    minQuantity: 40,
    maxQuantity: 80,
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
    taggedForProduction: 15,
    wastage: 0,
    lastUpdated: "2023-11-02",
  },
  {
    id: 3,
    name: "WD-FRAME-03",
    description: "Wooden Frame - Walnut",
    quantity: 30,
    totalProcured: 35,
    minQuantity: 25,
    maxQuantity: 60,
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
    taggedForProduction: 5,
    wastage: 0,
    lastUpdated: "2023-11-03",
  },
  {
    id: 4,
    name: "MT-LEG-01",
    description: "Metal Legs - Chrome",
    quantity: 120,
    totalProcured: 150,
    minQuantity: 100,
    maxQuantity: 200,
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
    taggedForProduction: 30,
    wastage: 0,
    lastUpdated: "2023-11-01",
  },
  {
    id: 5,
    name: "MT-LEG-02",
    description: "Metal Legs - Black",
    quantity: 85,
    totalProcured: 100,
    minQuantity: 80,
    maxQuantity: 150,
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
    taggedForProduction: 10,
    wastage: 5,
    lastUpdated: "2023-11-02",
  },
  {
    id: 6,
    name: "FABRIC-01",
    description: "Upholstery Fabric - Blue",
    quantity: 200,
    totalProcured: 250,
    minQuantity: 150,
    maxQuantity: 300,
    type: "Primary",
    category: "Raw Material",
    location: "Warehouse C",
    unitCost: 8.75,
    currency: "USD",
    unitWeight: 0.5,
    weightUnit: "kg",
    quantityUnit: "meters",
    qualityRating: "A",
    qualityCheckDone: true,
    qualityCheckDate: "2023-11-05",
    qualityCheckNotes: "Excellent color consistency and durability.",
    taggedForProduction: 50,
    wastage: 0,
    lastUpdated: "2023-11-05",
  },
  {
    id: 7,
    name: "PAINT-01",
    description: "Wood Paint - White",
    quantity: 45,
    totalProcured: 50,
    minQuantity: 20,
    maxQuantity: 60,
    type: "Secondary",
    category: "Raw Material",
    location: "Warehouse D",
    unitCost: 12.3,
    currency: "USD",
    unitWeight: 1.0,
    weightUnit: "kg",
    quantityUnit: "liters",
    qualityRating: "A",
    qualityCheckDone: true,
    qualityCheckDate: "2023-11-10",
    qualityCheckNotes: "Good consistency and coverage.",
    taggedForProduction: 5,
    wastage: 0,
    lastUpdated: "2023-11-10",
  },
]

export default function TotalQuantityPage() {
  const [skus, setSkus] = useState(initialSkus)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [qualityFilter, setQualityFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("quantity")

  const itemsPerPage = 5

  // Calculate total quantity and weight
  const calculateTotalQuantity = () => {
    return skus.reduce((total, sku) => total + sku.quantity, 0)
  }

  const calculateTotalWeight = () => {
    return skus
      .reduce((total, sku) => {
        if (sku.weightUnit === "kg") {
          return total + sku.quantity * (sku.unitWeight || 0)
        } else if (sku.weightUnit === "g") {
          return total + (sku.quantity * (sku.unitWeight || 0)) / 1000
        } else if (sku.weightUnit === "lb") {
          return total + sku.quantity * (sku.unitWeight || 0) * 0.453592
        } else if (sku.weightUnit === "oz") {
          return total + sku.quantity * (sku.unitWeight || 0) * 0.0283495
        }
        return total
      }, 0)
      .toFixed(2)
  }

  const calculateTotalValue = () => {
    return skus
      .reduce((total, sku) => {
        return total + sku.quantity * (sku.unitCost || 0)
      }, 0)
      .toFixed(2)
  }

  // Get quality badge
  const getQualityBadge = (rating: string) => {
    switch (rating) {
      case "A":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">A - Premium</Badge>
      case "B":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">B - Standard</Badge>
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

  // Filter SKUs based on search term, category filter, and quality filter
  const filteredSkus = skus.filter((sku) => {
    const matchesSearch =
      sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || sku.category === categoryFilter
    const matchesQuality = qualityFilter === "All" || sku.qualityRating === qualityFilter
    return matchesSearch && matchesCategory && matchesQuality
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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Total Inventory Quantity"
        description="View total quantities and specifications for all SKUs"
        icon={Calculator}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skus.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalQuantity()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalWeight()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalValue()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
          <CardDescription>View total quantities and specifications for all SKUs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quantity" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quantity">Quantity View</TabsTrigger>
              <TabsTrigger value="quality">Quality View</TabsTrigger>
              <TabsTrigger value="production">Production View</TabsTrigger>
            </TabsList>
            <div className="mt-4">
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
                  {activeTab === "quality" && (
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
                  )}
                </div>
              </div>
            </div>

            <TabsContent value="quantity" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Weight</TableHead>
                      <TableHead>Total Weight</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Location</TableHead>
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
                            {sku.quantity} {sku.quantityUnit}
                          </TableCell>
                          <TableCell>
                            {sku.unitWeight} {sku.weightUnit}
                          </TableCell>
                          <TableCell>
                            {(sku.unitWeight * sku.quantity).toFixed(2)} {sku.weightUnit}
                          </TableCell>
                          <TableCell>
                            {sku.unitCost} {sku.currency}
                          </TableCell>
                          <TableCell>
                            {(sku.unitCost * sku.quantity).toFixed(2)} {sku.currency}
                          </TableCell>
                          <TableCell>
                            <div className="w-full max-w-[100px]">
                              <Progress value={(sku.quantity / sku.maxQuantity) * 100} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{sku.location}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No SKUs found.
                        </TableCell>
                      </TableRow>
                    )}
                    {currentSkus.length > 0 && (
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell>{calculateTotalQuantity()}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{calculateTotalWeight()} kg</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>${calculateTotalValue()}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Quality Rating</TableHead>
                      <TableHead>Quality Check</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Category</TableHead>
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
                            {sku.quantity} {sku.quantityUnit}
                          </TableCell>
                          <TableCell>
                            {sku.qualityRating ? getQualityBadge(sku.qualityRating) : getQualityBadge("Not Rated")}
                          </TableCell>
                          <TableCell>{getQualityCheckBadge(sku.qualityCheckDone)}</TableCell>
                          <TableCell>{sku.lastUpdated}</TableCell>
                          <TableCell>{sku.category}</TableCell>
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
            </TabsContent>

            <TabsContent value="production" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Total Procured</TableHead>
                      <TableHead>Current Quantity</TableHead>
                      <TableHead>Tagged for Production</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Wastage</TableHead>
                      <TableHead>Wastage %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSkus.length > 0 ? (
                      currentSkus.map((sku) => {
                        const wastagePercentage = sku.totalProcured > 0 ? (sku.wastage / sku.totalProcured) * 100 : 0

                        return (
                          <TableRow key={sku.id}>
                            <TableCell className="font-medium">{sku.name}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={sku.description}>
                                {sku.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              {sku.totalProcured} {sku.quantityUnit}
                            </TableCell>
                            <TableCell>
                              {sku.quantity} {sku.quantityUnit}
                            </TableCell>
                            <TableCell>
                              {sku.taggedForProduction} {sku.quantityUnit}
                            </TableCell>
                            <TableCell>
                              {sku.quantity - sku.taggedForProduction} {sku.quantityUnit}
                            </TableCell>
                            <TableCell>
                              {sku.wastage} {sku.quantityUnit}
                            </TableCell>
                            <TableCell>{wastagePercentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No SKUs found.
                        </TableCell>
                      </TableRow>
                    )}
                    {currentSkus.length > 0 && (
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell>{currentSkus.reduce((total, sku) => total + sku.totalProcured, 0)}</TableCell>
                        <TableCell>{currentSkus.reduce((total, sku) => total + sku.quantity, 0)}</TableCell>
                        <TableCell>{currentSkus.reduce((total, sku) => total + sku.taggedForProduction, 0)}</TableCell>
                        <TableCell>
                          {currentSkus.reduce((total, sku) => total + (sku.quantity - sku.taggedForProduction), 0)}
                        </TableCell>
                        <TableCell>{currentSkus.reduce((total, sku) => total + sku.wastage, 0)}</TableCell>
                        <TableCell>
                          {(
                            (currentSkus.reduce((total, sku) => total + sku.wastage, 0) /
                              currentSkus.reduce((total, sku) => total + sku.totalProcured, 0)) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {filteredSkus.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstSku + 1} to {Math.min(indexOfLastSku, filteredSkus.length)} of{" "}
                {filteredSkus.length} SKUs
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
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
        </CardContent>
      </Card>
    </div>
  )
}
