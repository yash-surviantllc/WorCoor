"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/dashboard/page-header"
import { SimpleProductForm } from "@/components/product-manager/simple-product-form"
import { Label } from "@/components/ui/label"

// Sample product data
const initialProducts = [
  {
    id: 1,
    name: "Bookshelf - 5 Shelf",
    sku: "SHELF-001",
    category: "storage",
    description: "Five-shelf bookcase for office or home use with adjustable shelves.",
    price: "149.99",
    minimumStock: "5",
    inventory: 15,
    updatedAt: "2023-11-04T14:45:00Z",
    status: "active",
  },
  {
    id: 2,
    name: "Conference Table - 8 Person",
    sku: "TABLE-001",
    category: "furniture",
    description: "Large conference table suitable for meetings of up to 8 people.",
    price: "599.99",
    minimumStock: "2",
    inventory: 5,
    updatedAt: "2023-11-05T14:15:00Z",
    status: "active",
  },
  {
    id: 3,
    name: "Desk Lamp - LED",
    sku: "LAMP-001",
    category: "lighting",
    description: "Adjustable LED desk lamp with multiple brightness levels and color temperatures.",
    price: "39.99",
    minimumStock: "10",
    inventory: 50,
    updatedAt: "2023-11-10T09:20:00Z",
    status: "active",
  },
  {
    id: 4,
    name: "Ergonomic Footrest",
    sku: "FOOT-001",
    category: "office-supplies",
    description: "Adjustable footrest with massage surface for under-desk comfort.",
    price: "29.99",
    minimumStock: "8",
    inventory: 0,
    updatedAt: "2024-02-20T14:15:00Z",
    status: "discontinued",
  },
]

export default function ProductDefinitionPage() {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory.toLowerCase()
    const matchesStatus = selectedStatus === "All Statuses" || product.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories
  const categories = [
    "All Categories",
    ...new Set(
      products.map((product) => {
        // Capitalize first letter of each word
        return product.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }),
    ),
  ]

  // Get unique statuses
  const statuses = [
    "All Statuses",
    ...new Set(
      products.map((product) => {
        // Capitalize first letter
        return product.status.charAt(0).toUpperCase() + product.status.slice(1)
      }),
    ),
  ]

  // Calculate metrics
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.status === "active").length
  const lowStockProducts = products.filter(
    (p) => Number.parseInt(p.minimumStock) > p.inventory && p.inventory > 0,
  ).length
  const totalSKUs = products.length // In this simplified version, each product has one SKU

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle adding a new product
  const handleAddProduct = (productData: any) => {
    const id = products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1
    const now = new Date().toISOString()

    setProducts([
      ...products,
      {
        id,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        description: productData.description || "",
        price: productData.price,
        minimumStock: productData.minimumStock,
        inventory: 0,
        updatedAt: now,
        status: "active",
      },
    ])
    setIsAddDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Product Management"
        icon={FileText}
        action={{
          label: "Add Product",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => setIsAddDialogOpen(true),
          variant: "default"
        }}
      />

      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600">Total Products</div>
                <div className="text-3xl font-bold text-blue-900 mt-2">{totalProducts}</div>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-emerald-600">Active Products</div>
                <div className="text-3xl font-bold text-emerald-900 mt-2">{activeProducts}</div>
              </div>
              <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-amber-600">Low Stock</div>
                <div className="text-3xl font-bold text-amber-900 mt-2">{lowStockProducts}</div>
              </div>
              <div className="h-12 w-12 bg-amber-500 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-purple-600">Total SKUs</div>
                <div className="text-3xl font-bold text-purple-900 mt-2">{totalSKUs}</div>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-2xl font-bold text-slate-800">Products Catalog</h2>
            <p className="text-slate-600 mt-1">Manage your product inventory and specifications</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search products by name or SKU..."
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-filter" className="whitespace-nowrap text-white">
                    Category:
                  </Label>
                  <Select onValueChange={setSelectedCategory} defaultValue="All Categories">
                    <SelectTrigger
                      id="category-filter"
                      className="w-[180px] bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="text-white hover:bg-slate-600 focus:bg-slate-600"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter" className="whitespace-nowrap text-white">
                    Status:
                  </Label>
                  <Select onValueChange={setSelectedStatus} defaultValue="All Statuses">
                    <SelectTrigger
                      id="status-filter"
                      className="w-[150px] bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {statuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-white hover:bg-slate-600 focus:bg-slate-600"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-600 hover:bg-slate-600 text-white bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-white">Product Name</th>
                    <th className="text-left p-4 font-semibold text-white">Category</th>
                    <th className="text-left p-4 font-semibold text-white">SKUs</th>
                    <th className="text-left p-4 font-semibold text-white">Inventory</th>
                    <th className="text-left p-4 font-semibold text-white">Status</th>
                    <th className="text-left p-4 font-semibold text-white">Last Updated</th>
                    <th className="text-left p-4 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-25"
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-sm text-slate-500">{product.sku}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                          {product.category.replace("-", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">1</td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${
                            product.inventory === 0
                              ? "text-red-600"
                              : product.inventory < Number.parseInt(product.minimumStock)
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }`}
                        >
                          {product.inventory}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={product.status === "active" ? "default" : "destructive"}
                          className={`${
                            product.status === "active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          } border-0 font-medium`}
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{formatDate(product.updatedAt)}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No products found</div>
                <div className="text-slate-500 text-sm">Try adjusting your search or filter criteria</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800">Add New Product</DialogTitle>
            <DialogDescription className="text-slate-600">Create a new product entry in your catalog</DialogDescription>
          </DialogHeader>
          <SimpleProductForm onSubmit={handleAddProduct} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
