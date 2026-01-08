"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Package,
} from "lucide-react"
import { PageTitle } from "@/components/page-title"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample products data
const initialProducts = [
  {
    id: 1,
    name: "Office Chair - Standard",
    category: "Furniture",
    skuCount: 3,
    totalInventory: 45,
    status: "Active",
    lastUpdated: "2023-11-01",
  },
  {
    id: 2,
    name: "Office Desk - Adjustable",
    category: "Furniture",
    skuCount: 4,
    totalInventory: 30,
    status: "Active",
    lastUpdated: "2023-11-02",
  },
  {
    id: 3,
    name: "Filing Cabinet - 3 Drawer",
    category: "Storage",
    skuCount: 2,
    totalInventory: 20,
    status: "Active",
    lastUpdated: "2023-11-03",
  },
  {
    id: 4,
    name: "Bookshelf - 5 Shelf",
    category: "Storage",
    skuCount: 2,
    totalInventory: 15,
    status: "Low Stock",
    lastUpdated: "2023-11-04",
  },
  {
    id: 5,
    name: "Conference Table - 8 Person",
    category: "Furniture",
    skuCount: 1,
    totalInventory: 5,
    status: "Low Stock",
    lastUpdated: "2023-11-05",
  },
  {
    id: 6,
    name: "Executive Chair - Leather",
    category: "Furniture",
    skuCount: 2,
    totalInventory: 10,
    status: "Active",
    lastUpdated: "2023-11-06",
  },
  {
    id: 7,
    name: "Standing Desk Converter",
    category: "Furniture",
    skuCount: 3,
    totalInventory: 25,
    status: "Active",
    lastUpdated: "2023-11-07",
  },
  {
    id: 8,
    name: "Monitor Stand - Dual",
    category: "Accessories",
    skuCount: 1,
    totalInventory: 40,
    status: "Active",
    lastUpdated: "2023-11-08",
  },
  {
    id: 9,
    name: "Keyboard Tray - Adjustable",
    category: "Accessories",
    skuCount: 2,
    totalInventory: 30,
    status: "Active",
    lastUpdated: "2023-11-09",
  },
  {
    id: 10,
    name: "Desk Lamp - LED",
    category: "Accessories",
    skuCount: 3,
    totalInventory: 50,
    status: "Active",
    lastUpdated: "2023-11-10",
  },
]

// Sample product details (SKUs for each product)
const productSkus = {
  1: [
    { sku: "CHAIR-STD-BLK", name: "Office Chair - Standard (Black)", quantity: 20 },
    { sku: "CHAIR-STD-BLU", name: "Office Chair - Standard (Blue)", quantity: 15 },
    { sku: "CHAIR-STD-RED", name: "Office Chair - Standard (Red)", quantity: 10 },
  ],
  2: [
    { sku: "DESK-ADJ-OAK", name: "Office Desk - Adjustable (Oak)", quantity: 10 },
    { sku: "DESK-ADJ-MAP", name: "Office Desk - Adjustable (Maple)", quantity: 8 },
    { sku: "DESK-ADJ-WAL", name: "Office Desk - Adjustable (Walnut)", quantity: 7 },
    { sku: "DESK-ADJ-WHT", name: "Office Desk - Adjustable (White)", quantity: 5 },
  ],
  // Add more as needed
}

export default function InventoryProductsPage() {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const itemsPerPage = 5

  // Filter products based on search term, category filter, and status filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter
    const matchesStatus = statusFilter === "All" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Paginate products
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Low Stock":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Low Stock</Badge>
      case "Out of Stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
      case "Discontinued":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Discontinued</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Handle deleting a product
  const handleDeleteProduct = () => {
    if (!selectedProduct) return

    setProducts(products.filter((product) => product.id !== selectedProduct.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Product deleted",
      description: `Product "${selectedProduct.name}" has been deleted successfully.`,
    })
  }

  // Handle double-click on product row
  const handleProductRowDoubleClick = (product: any) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventory Products" icon={Package} />

      <div className="flex items-center justify-between">
        <PageTitle title="Inventory Products" /> {/* PageTitle is now declared */}
        <Button className="flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((product) => product.status === "Active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((product) => product.status === "Low Stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.reduce((total, product) => total + product.skuCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage products and their inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
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
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Discontinued">Discontinued</SelectItem>
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
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKUs</TableHead>
                    <TableHead>Total Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((product) => (
                      <TableRow
                        key={product.id}
                        onDoubleClick={() => handleProductRowDoubleClick(product)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.skuCount}</TableCell>
                        <TableCell>{product.totalInventory}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>{product.lastUpdated}</TableCell>
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
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedProduct(product)
                                    setIsDetailsDialogOpen(true)
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProduct(product)
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
                      <TableCell colSpan={7} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
                  {filteredProducts.length} products
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

      {/* Product Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View detailed information about this product.</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Product Name</h3>
                  <p className="text-base font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="text-base">{selectedProduct.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div>{getStatusBadge(selectedProduct.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="text-base">{selectedProduct.lastUpdated}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">SKUs</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productSkus[selectedProduct.id as keyof typeof productSkus]?.map((sku, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{sku.sku}</TableCell>
                          <TableCell>{sku.name}</TableCell>
                          <TableCell>{sku.quantity}</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No SKUs found for this product.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="py-4">
              <p>
                You are about to delete: <strong>{selectedProduct.name}</strong>
              </p>
              <p className="mt-2">
                This product has {selectedProduct.skuCount} SKUs and a total inventory of{" "}
                {selectedProduct.totalInventory} units.
              </p>
              <p className="text-destructive mt-2">
                Warning: Deleting this product will also delete all associated SKUs and inventory records.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Edit product details</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={selectedProduct.category}
                    onValueChange={(value) => setSelectedProduct({ ...selectedProduct, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={selectedProduct.status}
                    onValueChange={(value) => setSelectedProduct({ ...selectedProduct, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sku-count">SKU Count</Label>
                  <Input
                    id="edit-sku-count"
                    type="number"
                    value={selectedProduct.skuCount}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, skuCount: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-total-inventory">Total Inventory</Label>
                  <Input
                    id="edit-total-inventory"
                    type="number"
                    value={selectedProduct.totalInventory}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, totalInventory: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Update the product in the state
                setProducts(products.map((product) => (product.id === selectedProduct.id ? selectedProduct : product)))
                setIsEditDialogOpen(false)
                toast({
                  title: "Product updated",
                  description: `${selectedProduct.name} has been updated successfully.`,
                })
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Add a new product to inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="add-name">Product Name</Label>
                <Input id="add-name" placeholder="Enter product name" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-category">Category</Label>
                <Select defaultValue="Furniture">
                  <SelectTrigger id="add-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-status">Status</Label>
                <Select defaultValue="Active">
                  <SelectTrigger id="add-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-sku-count">SKU Count</Label>
                <Input id="add-sku-count" type="number" defaultValue="1" />
              </div>
              <div>
                <Label htmlFor="add-total-inventory">Total Inventory</Label>
                <Input id="add-total-inventory" type="number" defaultValue="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Add new product logic would go here
                const newProduct = {
                  id: products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1,
                  name: (document.getElementById("add-name") as HTMLInputElement).value,
                  category:
                    (document.querySelector("#add-category [data-value]") as HTMLElement)?.getAttribute("data-value") ||
                    "Furniture",
                  skuCount: Number.parseInt((document.getElementById("add-sku-count") as HTMLInputElement).value),
                  totalInventory: Number.parseInt(
                    (document.getElementById("add-total-inventory") as HTMLInputElement).value,
                  ),
                  status:
                    (document.querySelector("#add-status [data-value]") as HTMLElement)?.getAttribute("data-value") ||
                    "Active",
                  lastUpdated: new Date().toISOString().split("T")[0],
                }

                setProducts([newProduct, ...products])
                setIsAddDialogOpen(false)
                toast({
                  title: "Product added",
                  description: `${newProduct.name} has been added successfully.`,
                })
              }}
            >
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
