"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Box, Database, Package, Trash, Warehouse } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"

export default function InventoryManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reference Data Management"
        description="Manage units, location tags, SKU's across your manufacturing operations"
        icon={Warehouse}
      />

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-100">Total SKUs</p>
                <p className="text-3xl font-bold text-white">248</p>
                <p className="text-xs text-blue-200 font-medium">+12.5% from last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Box className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-100">Total Value</p>
                <p className="text-3xl font-bold text-white">$125,750</p>
                <p className="text-xs text-emerald-200 font-medium">+8.2% from last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-100">Low Stock Items</p>
                <p className="text-3xl font-bold text-white">45</p>
                <p className="text-xs text-purple-200 font-medium">-3.1% from last week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">Wastage Rate</p>
                <p className="text-3xl font-bold text-white">2.4%</p>
                <p className="text-xs text-amber-200 font-medium">Target: 3.0%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trash className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                  <Box className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">SKU Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    Manage SKUs and inventory levels
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Available SKUs:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  248 SKUs
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/skus" className="flex items-center justify-center gap-2">
                  Manage SKUs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm">
                  <Trash className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">Wastage Tracking</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    Track and report material wastage
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Current rate:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  2.4% wastage
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/wastage" className="flex items-center justify-center gap-2">
                  Track Wastage
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">Procurement</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    Manage procurement requests
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Pending orders:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  8 orders
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/procurement" className="flex items-center justify-center gap-2">
                  Manage Procurement
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">Inventory Analytics</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    View inventory analytics and reports
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Data points:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  90 days
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/analytics" className="flex items-center justify-center gap-2">
                  View Analytics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                  <Warehouse className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">Manage Org Units</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    Define units or places for layouts (warehouses, production units, office floors)
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Total units:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  12 units
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/org-units" className="flex items-center justify-center gap-2">
                  Manage Org Units
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">Location Tags</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    Manage and organize location tags and categories
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Total tags:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  24 tags
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/location-tags" className="flex items-center justify-center gap-2">
                  Manage Tags
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Access Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Health</CardTitle>
            <CardDescription>Current inventory status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Total SKUs</p>
                  <p className="text-2xl font-bold">248</p>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">$125,750</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Healthy Stock</p>
                  <p className="text-2xl font-bold text-muted-foreground">182</p>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-muted-foreground">45</p>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-muted-foreground">21</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Stock Received",
                  sku: "WD-FRAME-01",
                  quantity: 25,
                  date: "Today, 10:30 AM",
                },
                {
                  action: "Wastage Recorded",
                  sku: "MT-LEG-02",
                  quantity: 3,
                  date: "Today, 9:15 AM",
                },
                {
                  action: "Procurement Created",
                  sku: "UPH-SEAT-02",
                  quantity: 30,
                  date: "Yesterday, 4:45 PM",
                },
                {
                  action: "Stock Adjusted",
                  sku: "HW-SCREWS-01",
                  quantity: -5,
                  date: "Yesterday, 2:30 PM",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.sku} • {item.quantity > 0 ? "+" : ""}
                      {item.quantity} units
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground dark:text-slate-50 text-lg">Location Tags</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    Manage and organize location tags and categories
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-muted-foreground dark:text-slate-300">Total tags:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  24 tags
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-16 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/reference-data/location-tags" className="flex items-center justify-center gap-2">
                  Manage Tags
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
