"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  MoreHorizontal,
  Search,
  Trash2,
  FilePlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/simple-dropdown"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample procurement data
const initialProcurements = [
  {
    id: "PR-2023-001",
    sku: "WD-FRAME-01",
    name: "Wooden Frame - Oak",
    quantity: 50,
    quantityUnit: "pieces",
    status: "Pending Approval",
    requestedBy: "John Doe",
    requestDate: "2023-11-01",
    expectedDelivery: "2023-11-15",
    supplier: "Oak Supplies Inc.",
    cost: 1275.0,
    currency: "USD",
    unitCost: 25.5,
  },
  {
    id: "PR-2023-002",
    sku: "MT-LEG-01",
    name: "Metal Legs - Chrome",
    quantity: 100,
    quantityUnit: "pieces",
    status: "Approved",
    requestedBy: "Jane Smith",
    requestDate: "2023-11-02",
    expectedDelivery: "2023-11-20",
    supplier: "Metal Works Co.",
    cost: 1525.0,
    currency: "USD",
    unitCost: 15.25,
  },
  {
    id: "PR-2023-003",
    sku: "UPH-SEAT-02",
    name: "Upholstered Seat - Leather",
    quantity: 30,
    quantityUnit: "pieces",
    status: "Ordered",
    requestedBy: "Robert Johnson",
    requestDate: "2023-11-03",
    expectedDelivery: "2023-11-25",
    supplier: "Leather Crafts Ltd.",
    cost: 1800.0,
    currency: "USD",
    unitCost: 60.0,
  },
]

// Sample SKUs data
const skus = [
  { value: "WD-FRAME-01", label: "WD-FRAME-01 - Wooden Frame - Oak", unit: "pieces" },
  { value: "WD-FRAME-02", label: "WD-FRAME-02 - Wooden Frame - Maple", unit: "pieces" },
  { value: "WD-FRAME-03", label: "WD-FRAME-03 - Wooden Frame - Walnut", unit: "pieces" },
  { value: "MT-LEG-01", label: "MT-LEG-01 - Metal Legs - Chrome", unit: "pieces" },
  { value: "MT-LEG-02", label: "MT-LEG-02 - Metal Legs - Black", unit: "pieces" },
  { value: "UPH-SEAT-01", label: "UPH-SEAT-01 - Upholstered Seat - Fabric", unit: "pieces" },
  { value: "UPH-SEAT-02", label: "UPH-SEAT-02 - Upholstered Seat - Leather", unit: "pieces" },
  { value: "HW-SCREWS-01", label: "HW-SCREWS-01 - Hardware - Screws Pack", unit: "boxes" },
  { value: "HW-BOLTS-01", label: "HW-BOLTS-01 - Hardware - Bolts Pack", unit: "boxes" },
  { value: "PKG-BOX-01", label: "PKG-BOX-01 - Packaging - Standard Box", unit: "pieces" },
  { value: "FABRIC-01", label: "FABRIC-01 - Upholstery Fabric - Blue", unit: "meters" },
  { value: "PAINT-01", label: "PAINT-01 - Wood Paint - White", unit: "liters" },
]

// Sample suppliers data
const suppliers = [
  { value: "oak-supplies", label: "Oak Supplies Inc." },
  { value: "metal-works", label: "Metal Works Co." },
  { value: "leather-crafts", label: "Leather Crafts Ltd." },
  { value: "box-packaging", label: "Box & Packaging Co." },
  { value: "hardware-supplies", label: "Hardware Supplies Inc." },
  { value: "textile-suppliers", label: "Textile Suppliers Ltd." },
  { value: "paint-supplies", label: "Paint Supplies Co." },
]

// Sample currencies
const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
]

// Sample quantity units
const quantityUnits = [
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kilograms (KG)" },
  { value: "liters", label: "Liters" },
  { value: "meters", label: "Meters" },
  { value: "boxes", label: "Boxes" },
  { value: "pairs", label: "Pairs" },
]

export default function ProcurementManagementPage() {
  const [procurements, setProcurements] = useState(initialProcurements)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProcurement, setSelectedProcurement] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewTotalDialogOpen, setIsViewTotalDialogOpen] = useState(false)
  const [newProcurement, setNewProcurement] = useState({
    sku: "",
    quantity: 1,
    quantityUnit: "pieces",
    supplier: "",
    unitCost: 0,
    currency: "USD",
    notes: "",
  })
  const [isEditProcurementDialogOpen, setIsEditProcurementDialogOpen] = useState(false)

  const itemsPerPage = 5

  // Filter procurements based on search term and status filter
  const filteredProcurements = procurements.filter((procurement) => {
    const matchesSearch =
      procurement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.supplier.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || procurement.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Paginate procurements
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProcurements.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProcurements.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Approval":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending Approval
          </Badge>
        )
      case "Approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Approved
          </Badge>
        )
      case "Ordered":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Ordered
          </Badge>
        )
      case "Received":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Received
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate total cost based on quantity and unit cost
  const calculateTotalCost = (quantity: number, unitCost: number) => {
    return quantity * unitCost
  }

  // Handle adding a new procurement
  const handleAddProcurement = () => {
    const selectedSku = skus.find((sku) => sku.value === newProcurement.sku)
    const selectedSupplier = suppliers.find((supplier) => supplier.value === newProcurement.supplier)

    if (!selectedSku || !selectedSupplier) {
      toast({
        title: "Error",
        description: "Please select a valid SKU and supplier.",
        variant: "destructive",
      })
      return
    }

    if (newProcurement.unitCost <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid unit cost greater than zero.",
        variant: "destructive",
      })
      return
    }

    const id = `PR-${new Date().getFullYear()}-${String(procurements.length + 1).padStart(3, "0")}`
    const today = new Date().toISOString().split("T")[0]
    const expectedDelivery = new Date()
    expectedDelivery.setDate(expectedDelivery.getDate() + 14) // 2 weeks from now

    const totalCost = calculateTotalCost(Number(newProcurement.quantity), Number(newProcurement.unitCost))

    const newItem = {
      id,
      sku: newProcurement.sku,
      name: selectedSku.label.split(" - ")[1],
      quantity: Number(newProcurement.quantity),
      quantityUnit: newProcurement.quantityUnit,
      status: "Pending Approval",
      requestedBy: "Current User", // In a real app, this would be the logged-in user
      requestDate: today,
      expectedDelivery: expectedDelivery.toISOString().split("T")[0],
      supplier: selectedSupplier.label,
      cost: totalCost,
      currency: newProcurement.currency,
      unitCost: Number(newProcurement.unitCost),
    }

    setProcurements([newItem, ...procurements])
    setIsAddDialogOpen(false)
    setNewProcurement({
      sku: "",
      quantity: 1,
      quantityUnit: "pieces",
      supplier: "",
      unitCost: 0,
      currency: "USD",
      notes: "",
    })

    toast({
      title: "Procurement request created",
      description: `Procurement request ${id} has been created successfully.`,
    })
  }

  // Handle updating procurement status
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setProcurements(
      procurements.map((procurement) => (procurement.id === id ? { ...procurement, status: newStatus } : procurement)),
    )

    toast({
      title: "Status updated",
      description: `Procurement status has been updated to ${newStatus}.`,
    })
  }

  // Handle deleting a procurement
  const handleDeleteProcurement = () => {
    if (!selectedProcurement) return

    setProcurements(procurements.filter((procurement) => procurement.id !== selectedProcurement.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Procurement request deleted",
      description: `Procurement request ${selectedProcurement.id} has been deleted successfully.`,
    })
  }

  // Handle double-click on procurement row
  const handleProcurementRowDoubleClick = (procurement: any) => {
    setSelectedProcurement(procurement)
    setIsEditProcurementDialogOpen(true)
  }

  // Calculate total SKUs by category
  const calculateTotalSkusByCategory = () => {
    const categories: Record<string, { count: number; quantity: number }> = {}

    procurements.forEach((procurement) => {
      const skuPrefix = procurement.sku.split("-")[0]

      if (!categories[skuPrefix]) {
        categories[skuPrefix] = { count: 0, quantity: 0 }
      }

      categories[skuPrefix].count += 1
      categories[skuPrefix].quantity += procurement.quantity
    })

    return Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      quantity: data.quantity,
    }))
  }

  // Get SKU category name
  const getSkuCategoryName = (prefix: string) => {
    const categoryMap: Record<string, string> = {
      WD: "Wood Components",
      MT: "Metal Components",
      UPH: "Upholstery",
      HW: "Hardware",
      PKG: "Packaging",
      FABRIC: "Fabrics",
      PAINT: "Paints",
    }

    return categoryMap[prefix] || prefix
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Procurement Management"
        description="Manage procurement requests for inventory items"
        icon={FilePlus}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Procurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procurements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {procurements.filter((item) => item.status === "Pending Approval").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {procurements.filter((item) => item.status === "Approved" || item.status === "Ordered").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procurements.filter((item) => item.status === "Received").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procurement Requests</CardTitle>
          <CardDescription>Manage procurement requests for inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search procurements..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
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
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Ordered">Ordered</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((procurement) => (
                      <TableRow
                        key={procurement.id}
                        onDoubleClick={() => handleProcurementRowDoubleClick(procurement)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{procurement.id}</TableCell>
                        <TableCell>{procurement.sku}</TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={procurement.name}>
                            {procurement.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {procurement.quantity} {procurement.quantityUnit}
                        </TableCell>
                        <TableCell>
                          {procurement.unitCost.toFixed(2)} {procurement.currency}
                        </TableCell>
                        <TableCell>
                          {procurement.cost.toFixed(2)} {procurement.currency}
                        </TableCell>
                        <TableCell>{getStatusBadge(procurement.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={procurement.supplier}>
                            {procurement.supplier}
                          </div>
                        </TableCell>
                        <TableCell>{procurement.expectedDelivery}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {procurement.status === "Pending Approval" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(procurement.id, "Approved")}>
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {procurement.status === "Approved" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(procurement.id, "Ordered")}>
                                  Mark as Ordered
                                </DropdownMenuItem>
                              )}
                              {procurement.status === "Ordered" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(procurement.id, "Received")}>
                                  Mark as Received
                                </DropdownMenuItem>
                              )}
                              {(procurement.status === "Pending Approval" || procurement.status === "Approved") && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(procurement.id, "Cancelled")}>
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProcurement(procurement)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No procurement requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredProcurements.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProcurements.length)} of{" "}
                  {filteredProcurements.length} items
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

      {/* Add Procurement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Procurement Request</DialogTitle>
            <DialogDescription>Create a new procurement request for inventory items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Select
                onValueChange={(value) => {
                  const selectedSku = skus.find((sku) => sku.value === value)
                  setNewProcurement({
                    ...newProcurement,
                    sku: value,
                    quantityUnit: selectedSku ? selectedSku.unit : "pieces",
                  })
                }}
                value={newProcurement.sku}
              >
                <SelectTrigger id="sku">
                  <SelectValue placeholder="Select a SKU" />
                </SelectTrigger>
                <SelectContent>
                  {skus.map((sku) => (
                    <SelectItem key={sku.value} value={sku.value}>
                      {sku.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={newProcurement.quantity}
                  onChange={(e) => setNewProcurement({ ...newProcurement, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityUnit">Unit</Label>
                <Select
                  onValueChange={(value) => setNewProcurement({ ...newProcurement, quantityUnit: value })}
                  value={newProcurement.quantityUnit}
                >
                  <SelectTrigger id="quantityUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                onValueChange={(value) => setNewProcurement({ ...newProcurement, supplier: value })}
                value={newProcurement.supplier}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.value} value={supplier.value}>
                      {supplier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={newProcurement.unitCost}
                  onChange={(e) => setNewProcurement({ ...newProcurement, unitCost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => setNewProcurement({ ...newProcurement, currency: value })}
                  value={newProcurement.currency}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost</Label>
              <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                {calculateTotalCost(newProcurement.quantity, newProcurement.unitCost).toFixed(2)}{" "}
                {newProcurement.currency}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes..."
                value={newProcurement.notes}
                onChange={(e) => setNewProcurement({ ...newProcurement, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProcurement}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Procurement Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Procurement Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this procurement request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProcurement && (
            <div className="py-4">
              <p>
                You are about to delete procurement request: <strong>{selectedProcurement.id}</strong>
              </p>
              <p className="mt-2">
                SKU: {selectedProcurement.sku} - {selectedProcurement.name}
              </p>
              <p>
                Quantity: {selectedProcurement.quantity} {selectedProcurement.quantityUnit}
              </p>
              <p>Supplier: {selectedProcurement.supplier}</p>
              <p>
                Cost: {selectedProcurement.cost.toFixed(2)} {selectedProcurement.currency}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProcurement}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Total SKUs Dialog */}
      <Dialog open={isViewTotalDialogOpen} onOpenChange={setIsViewTotalDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Total SKU Inventory</DialogTitle>
            <DialogDescription>Overview of all SKUs in the inventory system</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Category</TableHead>
                    <TableHead>Number of SKUs</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculateTotalSkusByCategory().map((category) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{getSkuCategoryName(category.category)}</TableCell>
                      <TableCell>{category.count}</TableCell>
                      <TableCell>{category.quantity}</TableCell>
                      <TableCell>
                        {category.quantity > 100 ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Sufficient</Badge>
                        ) : category.quantity > 20 ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Moderate</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">Low</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Total SKU Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{procurements.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{procurements.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {procurements.reduce((sum, item) => sum + item.cost, 0).toFixed(2)} USD
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewTotalDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Procurement Dialog */}
      <Dialog open={isEditProcurementDialogOpen} onOpenChange={setIsEditProcurementDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Procurement Request</DialogTitle>
            <DialogDescription>Update procurement request details</DialogDescription>
          </DialogHeader>
          {selectedProcurement && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-procurement-id">ID</Label>
                  <Input id="edit-procurement-id" value={selectedProcurement.id} disabled />
                </div>
                <div>
                  <Label htmlFor="edit-procurement-sku">SKU</Label>
                  <Input id="edit-procurement-sku" value={selectedProcurement.sku} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-procurement-name">Name</Label>
                <Input
                  id="edit-procurement-name"
                  value={selectedProcurement.name}
                  onChange={(e) => setSelectedProcurement({ ...selectedProcurement, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-procurement-quantity">Quantity</Label>
                  <Input
                    id="edit-procurement-quantity"
                    type="number"
                    value={selectedProcurement.quantity}
                    onChange={(e) => {
                      const newQuantity = Number.parseInt(e.target.value)
                      setSelectedProcurement({
                        ...selectedProcurement,
                        quantity: newQuantity,
                        cost: calculateTotalCost(newQuantity, selectedProcurement.unitCost),
                      })
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-procurement-unit">Unit</Label>
                  <Input
                    id="edit-procurement-unit"
                    value={selectedProcurement.quantityUnit}
                    onChange={(e) => setSelectedProcurement({ ...selectedProcurement, quantityUnit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-procurement-unit-cost">Unit Cost</Label>
                  <Input
                    id="edit-procurement-unit-cost"
                    type="number"
                    step="0.01"
                    value={selectedProcurement.unitCost}
                    onChange={(e) => {
                      const newUnitCost = Number.parseFloat(e.target.value)
                      setSelectedProcurement({
                        ...selectedProcurement,
                        unitCost: newUnitCost,
                        cost: calculateTotalCost(selectedProcurement.quantity, newUnitCost),
                      })
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-procurement-currency">Currency</Label>
                  <Input
                    id="edit-procurement-currency"
                    value={selectedProcurement.currency}
                    onChange={(e) => setSelectedProcurement({ ...selectedProcurement, currency: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-procurement-supplier">Supplier</Label>
                <Input
                  id="edit-procurement-supplier"
                  value={selectedProcurement.supplier}
                  onChange={(e) => setSelectedProcurement({ ...selectedProcurement, supplier: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-procurement-status">Status</Label>
                  <Select
                    value={selectedProcurement.status}
                    onValueChange={(value) => setSelectedProcurement({ ...selectedProcurement, status: value })}
                  >
                    <SelectTrigger id="edit-procurement-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Ordered">Ordered</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-procurement-expected-delivery">Expected Delivery</Label>
                  <Input
                    id="edit-procurement-expected-delivery"
                    type="date"
                    value={selectedProcurement.expectedDelivery}
                    onChange={(e) =>
                      setSelectedProcurement({ ...selectedProcurement, expectedDelivery: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProcurementDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Update the procurement in the state
                setProcurements(
                  procurements.map((procurement) =>
                    procurement.id === selectedProcurement.id ? selectedProcurement : procurement,
                  ),
                )
                setIsEditProcurementDialogOpen(false)
                toast({
                  title: "Procurement updated",
                  description: `Procurement request ${selectedProcurement.id} has been updated successfully.`,
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
