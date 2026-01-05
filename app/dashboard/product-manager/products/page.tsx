"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Download, Package2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/dashboard/page-header"
import { SimpleProductForm } from "@/components/product-manager/simple-product-form"
import { useReferenceData } from "@/contexts/reference-data-context"

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
    totalSku: 2,
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
    totalSku: 1,
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
    totalSku: 2,
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
    status: "decommissioned",
    totalSku: 1,
  },
]

export default function ProductsPage() {
  const { productCategories } = useReferenceData()
  
  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  // Define explicit mapping between existing categories and Product Category reference data
  const categoryMapping: Record<string, string> = {
    'storage': 'Storage Solutions',     // Maps to PRC-003
    'furniture': 'Office Furniture',    // Maps to PRC-001
    'lighting': 'Lighting',            // Maps to PRC-004
    'office-supplies': 'Office Supplies', // Maps to PRC-005
  }
  
  // Helper function to get product category name from category ID/code
  const getCategoryNameFromId = (categoryId: string) => {
    // First check our explicit mapping
    if (categoryMapping[categoryId]) {
      return categoryMapping[categoryId]
    }
    
    // Fallback to fuzzy matching if we don't have an explicit mapping
    const matchingCategory = productCategories.find(category => {
      return category.PRC_Name.toLowerCase().includes(categoryId.toLowerCase()) ||
             categoryId.toLowerCase().includes(category.PRC_Name.toLowerCase())
    })
    
    return matchingCategory?.PRC_Name || categoryId
  }
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    // Map product category to reference category
    const productCategoryMatch = getCategoryNameFromId(product.category)
    const matchesCategory = selectedCategory === "All Categories" || 
      productCategoryMatch?.toLowerCase() === selectedCategory.toLowerCase()
    const matchesStatus = selectedStatus === "All Statuses" || product.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get categories from reference data
  const categories = [
    "All Categories",
    ...productCategories.map(category => category.PRC_Name)
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
    return date.toISOString().split("T")[0]
  }

  // Handle adding a new product
  const handleAddProduct = (productData: any) => {
    const newProduct = {
      id: products.length + 1,
      name: productData.name,
      sku: productData.sku,
      category: productData.category,
      description: productData.description,
      price: productData.price,
      minimumStock: productData.minimumStock,
      inventory: parseInt(productData.inventory) || 0,
      updatedAt: new Date().toISOString(),
      status: "active",
      totalSku: Math.random() < 0.5 ? 1 : 2, // Randomly assign 1 or 2 for new products
    }

    setProducts([...products, newProduct])
    setIsAddDialogOpen(false)
  }
  
  // Handle editing a product
  const handleEditProduct = (productData: any) => {
    const updatedProducts = products.map(product => 
      product.id === editingProduct.id ? {
        ...product,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        minimumStock: productData.minimumStock,
        inventory: parseInt(productData.inventory) || 0,
        updatedAt: new Date().toISOString(),
        // Preserve existing totalSku value
        totalSku: product.totalSku || (Math.random() < 0.5 ? 1 : 2),
      } : product
    )
    
    setProducts(updatedProducts)
    setIsEditDialogOpen(false)
  }
  
  // Open edit dialog with product data
  const openEditDialog = (product: any) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <PageHeader title="Product Definition" icon={Package2} />
        <Button
          className="flex items-center gap-2 bg-black text-white hover:bg-black/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium">Total Products</div>
            <div className="text-3xl font-bold mt-2">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium">Active Products</div>
            <div className="text-3xl font-bold mt-2">{activeProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium">Low Stock Products</div>
            <div className="text-3xl font-bold mt-2">{lowStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium">Total SKUs</div>
            <div className="text-3xl font-bold mt-2">{totalSKUs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Products</h2>
            <p className="text-sm text-muted-foreground">Manage products and their inventory levels</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                <select
                  className="border border-gray-600 rounded p-2 text-sm bg-gray-900 text-white w-40"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <select
                  className="border border-gray-600 rounded p-2 text-sm bg-gray-900 text-white"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Product Name</th>
                  <th className="text-left p-3">Product Category</th>
                  <th className="text-left p-3">Total SKU</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last Updated</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className="border-b cursor-pointer hover:bg-muted/50"
                    onDoubleClick={() => openEditDialog(product)}
                  >
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">
                      {getCategoryNameFromId(product.category)}
                    </td>
                    <td className="p-3">{product.totalSku}</td>
                    <td className="p-3">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.status === "active"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-3">{formatDate(product.updatedAt)}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(product);
                      }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Add a new product to the system</DialogDescription>
          </DialogHeader>
          <SimpleProductForm onSubmit={handleAddProduct} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <SimpleProductForm 
              onSubmit={handleEditProduct} 
              onCancel={() => setIsEditDialogOpen(false)} 
              initialValues={editingProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
