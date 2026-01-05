"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"

// Mock data for SKUs
const skus = [
  {
    id: "SKU001",
    name: "Basic Widget",
    productId: "P001",
    productName: "Widget",
    category: "Electronics",
    price: 19.99,
    cost: 8.5,
    stockLevel: 245,
    status: "Active",
    location: "Warehouse A",
  },
  {
    id: "SKU002",
    name: "Premium Widget",
    productId: "P001",
    productName: "Widget",
    category: "Electronics",
    price: 29.99,
    cost: 12.75,
    stockLevel: 120,
    status: "Active",
    location: "Warehouse A",
  },
  {
    id: "SKU003",
    name: "Basic Gadget",
    productId: "P002",
    productName: "Gadget",
    category: "Electronics",
    price: 24.99,
    cost: 10.25,
    stockLevel: 78,
    status: "Low Stock",
    location: "Warehouse B",
  },
  {
    id: "SKU004",
    name: "Premium Gadget",
    productId: "P002",
    productName: "Gadget",
    category: "Electronics",
    price: 34.99,
    cost: 15.5,
    stockLevel: 0,
    status: "Out of Stock",
    location: "Warehouse B",
  },
  {
    id: "SKU005",
    name: "Standard Thingamajig",
    productId: "P003",
    productName: "Thingamajig",
    category: "Tools",
    price: 14.99,
    cost: 6.25,
    stockLevel: 320,
    status: "Active",
    location: "Warehouse C",
  },
  {
    id: "SKU006",
    name: "Deluxe Thingamajig",
    productId: "P003",
    productName: "Thingamajig",
    category: "Tools",
    price: 24.99,
    cost: 11.25,
    stockLevel: 15,
    status: "Low Stock",
    location: "Warehouse C",
  },
  {
    id: "SKU007",
    name: "Basic Doohickey",
    productId: "P004",
    productName: "Doohickey",
    category: "Tools",
    price: 9.99,
    cost: 4.5,
    stockLevel: 180,
    status: "Active",
    location: "Warehouse A",
  },
]

// Get unique categories for filter
const categories = Array.from(new Set(skus.map((sku) => sku.category)))

// Get unique statuses for filter
const statuses = Array.from(new Set(skus.map((sku) => sku.status)))

export default function SkusPage() {
  const router = useRouter()
  
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="SKU Management"
        description="Manage product SKUs and inventory"
        icon={Tag}
        action={{
          label: "Add New SKU",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => router.push("/dashboard/product-manager/skus/new")
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>SKU Overview</CardTitle>
          <CardDescription>View and manage all SKUs across your product catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search SKUs..." className="w-full pl-8" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select defaultValue="all-categories">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="all-statuses">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase().replace(" ", "-")}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">SKU ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skus.map((sku) => (
                    <TableRow key={sku.id}>
                      <TableCell className="font-medium">{sku.id}</TableCell>
                      <TableCell>{sku.name}</TableCell>
                      <TableCell>{sku.productName}</TableCell>
                      <TableCell>{sku.category}</TableCell>
                      <TableCell className="text-right">${sku.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{sku.stockLevel}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sku.status === "Active" ? "default" : sku.status === "Low Stock" ? "warning" : "destructive"
                          }
                        >
                          {sku.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sku.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/product-manager/skus/${sku.id}`}>Edit</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>SKU Summary</CardTitle>
            <CardDescription>Overview of SKU status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total SKUs</span>
                <span className="font-medium">{skus.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active SKUs</span>
                <span className="font-medium">{skus.filter((sku) => sku.status === "Active").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low Stock SKUs</span>
                <span className="font-medium">{skus.filter((sku) => sku.status === "Low Stock").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Out of Stock SKUs</span>
                <span className="font-medium">{skus.filter((sku) => sku.status === "Out of Stock").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Value</CardTitle>
            <CardDescription>Total value of inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retail Value</span>
                <span className="font-medium">
                  ${skus.reduce((sum, sku) => sum + sku.price * sku.stockLevel, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Value</span>
                <span className="font-medium">
                  ${skus.reduce((sum, sku) => sum + sku.cost * sku.stockLevel, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Profit</span>
                <span className="font-medium">
                  ${skus.reduce((sum, sku) => sum + (sku.price - sku.cost) * sku.stockLevel, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>SKUs by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const count = skus.filter((sku) => sku.category === category).length
                const percentage = Math.round((count / skus.length) * 100)

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{category}</span>
                      <span className="font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
