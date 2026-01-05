"use client"

import type React from "react"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
  ShoppingCart,
  Plus,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample inventory data
const initialInventory = [
  {
    id: 1,
    sku: "WD-FRAME-01",
    name: "Wooden Frame - Oak",
    quantity: 45,
    minQuantity: 50,
    maxQuantity: 100,
    category: "Raw Material",
    location: "Warehouse A",
    lastUpdated: "2023-11-01",
  },
  {
    id: 2,
    sku: "WD-FRAME-02",
    name: "Wooden Frame - Maple",
    quantity: 60,
    minQuantity: 40,
    maxQuantity: 80,
    category: "Raw Material",
    location: "Warehouse A",
    lastUpdated: "2023-11-02",
  },
  {
    id: 3,
    sku: "WD-FRAME-03",
    name: "Wooden Frame - Walnut",
    quantity: 30,
    minQuantity: 25,
    maxQuantity: 60,
    category: "Raw Material",
    location: "Warehouse A",
    lastUpdated: "2023-11-03",
  },
  {
    id: 4,
    sku: "MT-LEG-01",
    name: "Metal Legs - Chrome",
    quantity: 120,
    minQuantity: 100,
    maxQuantity: 200,
    category: "Component",
    location: "Warehouse B",
    lastUpdated: "2023-11-01",
  },
  {
    id: 5,
    sku: "MT-LEG-02",
    name: "Metal Legs - Black",
    quantity: 85,
    minQuantity: 80,
    maxQuantity: 150,
    category: "Component",
    location: "Warehouse B",
    lastUpdated: "2023-11-02",
  },
  {
    id: 6,
    sku: "UPH-SEAT-01",
    name: "Upholstered Seat - Fabric",
    quantity: 55,
    minQuantity: 50,
    maxQuantity: 100,
    category: "Component",
    location: "Warehouse C",
    lastUpdated: "2023-11-03",
  },
  {
    id: 7,
    sku: "UPH-SEAT-02",
    name: "Upholstered Seat - Leather",
    quantity: 25,
    minQuantity: 30,
    maxQuantity: 60,
    category: "Component",
    location: "Warehouse C",
    lastUpdated: "2023-11-04",
  },
  {
    id: 8,
    sku: "HW-SCREWS-01",
    name: "Hardware - Screws Pack",
    quantity: 200,
    minQuantity: 150,
    maxQuantity: 300,
    category: "Hardware",
    location: "Warehouse D",
    lastUpdated: "2023-11-01",
  },
  {
    id: 9,
    sku: "HW-BOLTS-01",
    name: "Hardware - Bolts Pack",
    quantity: 180,
    minQuantity: 150,
    maxQuantity: 300,
    category: "Hardware",
    location: "Warehouse D",
    lastUpdated: "2023-11-02",
  },
  {
    id: 10,
    sku: "PKG-BOX-01",
    name: "Packaging - Standard Box",
    quantity: 90,
    minQuantity: 100,
    maxQuantity: 200,
    category: "Packaging",
    location: "Warehouse E",
    lastUpdated: "2023-11-03",
  },
]

export default function InventoryLevelsPage() {
  const [inventory, setInventory] = useState(initialInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isProcurementDialogOpen, setIsProcurementDialogOpen] = useState(false)
  const [isViewEditDialogOpen, setIsViewEditDialogOpen] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null)

  const itemsPerPage = 5

  // Define all utility functions before they are used

  // Get inventory status
  const getInventoryStatus = (quantity: number, minQuantity: number): string => {
    if (quantity <= 0) {
      return "Out of Stock"
    } else if (quantity < minQuantity) {
      return "Low Stock"
    } else {
      return "In Stock"
    }
  }

  // Get inventory status badge
  const getInventoryBadge = (quantity: number, minQuantity: number) => {
    const status = getInventoryStatus(quantity, minQuantity)

    switch (status) {
      case "Out of Stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
      case "Low Stock":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Low Stock</Badge>
      case "In Stock":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Calculate inventory level percentage
  const calculateInventoryPercentage = (quantity: number, minQuantity: number, maxQuantity: number): number => {
    if (quantity <= 0) return 0
    if (quantity >= maxQuantity) return 100

    return Math.round((quantity / maxQuantity) * 100)
  }

  // Handle raising procurement
  const handleRaiseProcurement = (): void => {
    if (!selectedItem) return

    // In a real app, this would send a request to the server
    // For this example, we'll just close the dialog
    setIsProcurementDialogOpen(false)
  }

  // Handle pagination
  const handlePageChange = (pageNumber: number): void => {
    setCurrentPage(pageNumber)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  // Handle category filter change
  const handleCategoryChange = (value: string): void => {
    setCategoryFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle status filter change
  const handleStatusChange = (value: string): void => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle item selection for procurement
  const handleSelectItem = (item: any): void => {
    setSelectedItem(item)
    setIsProcurementDialogOpen(true)
  }

  // Handle double-click on inventory item row
  const handleInventoryRowDoubleClick = (item: any) => {
    setSelectedInventoryItem(item)
    setIsViewEditDialogOpen(true)
  }

  // Filter inventory based on search term, category filter, and status filter
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter

    const status = getInventoryStatus(item.quantity, item.minQuantity)
    const matchesStatus = statusFilter === "All" || statusFilter === status

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Paginate inventory
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)

  // Calculate summary metrics
  const lowStockCount = inventory.filter((item) => item.quantity < item.minQuantity && item.quantity > 0).length
  const outOfStockCount = inventory.filter((item) => item.quantity <= 0).length
  const healthyStockCount = inventory.filter((item) => item.quantity >= item.minQuantity).length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory Levels"
        description="Monitor and manage inventory stock levels"
        icon={BarChart3}
        action={{
          label: "New Item",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setSelectedInventoryItem({
              id: inventory.length > 0 ? Math.max(...inventory.map((item) => item.id)) + 1 : 1,
              sku: "",
              name: "",
              quantity: 0,
              minQuantity: 0,
              maxQuantity: 0,
              category: "Raw Material",
              location: "Warehouse A",
              lastUpdated: new Date().toISOString().split("T")[0],
            })
            setIsViewEditDialogOpen(true)
          },
        }}
      />

      <div className="flex justify-end mb-2">
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 pl-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="ml-4">
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
          <CardDescription>View and manage current inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-filter" className="whitespace-nowrap">
                    Category:
                  </Label>
                  <Select onValueChange={handleCategoryChange} defaultValue="All">
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
                  <Label htmlFor="status-filter" className="whitespace-nowrap">
                    Status:
                  </Label>
                  <Select onValueChange={handleStatusChange} defaultValue="All">
                    <SelectTrigger id="status-filter" className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted text-muted-foreground font-medium">SKU</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium">Name</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium">Quantity</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium">Level</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium">Location</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium">Last Updated</TableHead>
                    <TableHead className="bg-muted text-muted-foreground font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow
                        key={item.id}
                        onDoubleClick={() => handleInventoryRowDoubleClick(item)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={item.name}>
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{getInventoryBadge(item.quantity, item.minQuantity)}</TableCell>
                        <TableCell>
                          <div className="w-full max-w-[100px]">
                            <Progress
                              value={calculateInventoryPercentage(item.quantity, item.minQuantity, item.maxQuantity)}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <Dialog
                            open={isProcurementDialogOpen && selectedItem?.id === item.id}
                            onOpenChange={setIsProcurementDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectItem(item)}
                                disabled={item.quantity >= item.minQuantity}
                              >
                                <ShoppingCart className="mr-2 h-3 w-3" />
                                Procure
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Raise Procurement</DialogTitle>
                                <DialogDescription>
                                  Raise a procurement request for this inventory item.
                                </DialogDescription>
                              </DialogHeader>
                              {selectedItem && (
                                <div className="py-4">
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                                      <p className="text-base">{selectedItem.sku}</p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                                      <p className="text-base">{selectedItem.name}</p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground">Current Quantity</h3>
                                      <p className="text-base">{selectedItem.quantity}</p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground">Minimum Quantity</h3>
                                      <p className="text-base">{selectedItem.minQuantity}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="procurement-quantity">Quantity to Procure</Label>
                                    <Input
                                      id="procurement-quantity"
                                      type="number"
                                      defaultValue={selectedItem.minQuantity - selectedItem.quantity}
                                      min={1}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsProcurementDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleRaiseProcurement}>Raise Procurement</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No inventory items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredInventory.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInventory.length)} of{" "}
                  {filteredInventory.length} items
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
      {/* View/Edit Inventory Item Dialog */}
      <Dialog open={isViewEditDialogOpen} onOpenChange={setIsViewEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>View and edit inventory item details</DialogDescription>
          </DialogHeader>
          {selectedInventoryItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={selectedInventoryItem.sku}
                    onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedInventoryItem.name}
                    onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={selectedInventoryItem.quantity}
                    onChange={(e) =>
                      setSelectedInventoryItem({ ...selectedInventoryItem, quantity: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-min-quantity">Min Quantity</Label>
                  <Input
                    id="edit-min-quantity"
                    type="number"
                    value={selectedInventoryItem.minQuantity}
                    onChange={(e) =>
                      setSelectedInventoryItem({
                        ...selectedInventoryItem,
                        minQuantity: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-max-quantity">Max Quantity</Label>
                  <Input
                    id="edit-max-quantity"
                    type="number"
                    value={selectedInventoryItem.maxQuantity}
                    onChange={(e) =>
                      setSelectedInventoryItem({
                        ...selectedInventoryItem,
                        maxQuantity: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={selectedInventoryItem.category}
                    onValueChange={(value) => setSelectedInventoryItem({ ...selectedInventoryItem, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Material">Raw Material</SelectItem>
                      <SelectItem value="Component">Component</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Select
                    value={selectedInventoryItem.location}
                    onValueChange={(value) => setSelectedInventoryItem({ ...selectedInventoryItem, location: value })}
                  >
                    <SelectTrigger id="edit-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                      <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                      <SelectItem value="Warehouse C">Warehouse C</SelectItem>
                      <SelectItem value="Warehouse D">Warehouse D</SelectItem>
                      <SelectItem value="Warehouse E">Warehouse E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Update the inventory item in the state
                setInventory(
                  inventory.map((item) => (item.id === selectedInventoryItem.id ? selectedInventoryItem : item)),
                )
                setIsViewEditDialogOpen(false)
                toast({
                  title: "Inventory item updated",
                  description: `${selectedInventoryItem.name} has been updated successfully.`,
                })
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
