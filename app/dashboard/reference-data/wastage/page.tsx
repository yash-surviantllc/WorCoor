"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
  Trash,
  TrendingUp,
  AlertTriangle,
  Package,
  Calendar,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/dashboard/page-header"

// Types
interface WastageRecord {
  id: number
  date: string
  sku: string
  skuName: string
  quantity: number
  reason: string
  notes: string
  reportedBy: string
  cost?: number
  category: string
}

interface WastageSummary {
  totalEvents: number
  totalUnits: number
  totalCost: number
  topReasons: Array<{ reason: string; count: number; percentage: number }>
  topSKUs: Array<{ sku: string; quantity: number; cost: number }>
  monthlyTrend: Array<{ month: string; quantity: number; cost: number }>
}

// Sample SKUs data with categories and costs
const skus = [
  { value: "WD-FRAME-01", label: "WD-FRAME-01 - Wooden Frame - Oak", category: "RAW Material", unitCost: 45.5 },
  { value: "WD-FRAME-02", label: "WD-FRAME-02 - Wooden Frame - Maple", category: "RAW Material", unitCost: 42.0 },
  { value: "WD-FRAME-03", label: "WD-FRAME-03 - Wooden Frame - Walnut", category: "RAW Material", unitCost: 55.75 },
  { value: "MT-LEG-01", label: "MT-LEG-01 - Metal Legs - Chrome", category: "RAW Material", unitCost: 28.9 },
  { value: "MT-LEG-02", label: "MT-LEG-02 - Metal Legs - Black", category: "RAW Material", unitCost: 26.5 },
  { value: "UPH-SEAT-01", label: "UPH-SEAT-01 - Upholstered Seat - Fabric", category: "RAW Material", unitCost: 65.0 },
  { value: "UPH-SEAT-02", label: "UPH-SEAT-02 - Leather", category: "RAW Material", unitCost: 95.0 },
  { value: "HW-SCREWS-01", label: "HW-SCREWS-01 - Hardware - Screws Pack", category: "Spare Parts", unitCost: 12.25 },
  { value: "HW-BOLTS-01", label: "HW-BOLTS-01 - Hardware - Bolts Pack", category: "Spare Parts", unitCost: 15.75 },
  {
    value: "PKG-BOX-01",
    label: "PKG-BOX-01 - Packaging - Standard Box",
    category: "Packaging Material",
    unitCost: 3.5,
  },
]

// Sample wastage reasons with severity levels
const wastageReasons = [
  { value: "damaged", label: "Damaged during manufacturing", severity: "high" },
  { value: "defective", label: "Defective material", severity: "high" },
  { value: "expired", label: "Expired material", severity: "medium" },
  { value: "spillage", label: "Spillage", severity: "medium" },
  { value: "incorrect-measurement", label: "Incorrect measurement", severity: "low" },
  { value: "testing", label: "Used for testing", severity: "low" },
  { value: "other", label: "Other", severity: "medium" },
]

// Enhanced initial wastage data with costs and categories
const initialWastage: WastageRecord[] = [
  {
    id: 1,
    date: "2024-01-15",
    sku: "WD-FRAME-01",
    skuName: "Wooden Frame - Oak",
    quantity: 3,
    reason: "Damaged during manufacturing",
    notes: "Frames were damaged during assembly process.",
    reportedBy: "John Smith",
    cost: 136.5,
    category: "RAW Material",
  },
  {
    id: 2,
    date: "2024-01-14",
    sku: "MT-LEG-01",
    skuName: "Metal Legs - Chrome",
    quantity: 5,
    reason: "Defective material",
    notes: "Legs had manufacturing defects and couldn't be used.",
    reportedBy: "Emily Johnson",
    cost: 144.5,
    category: "RAW Material",
  },
  {
    id: 3,
    date: "2024-01-13",
    sku: "UPH-SEAT-01",
    skuName: "Upholstered Seat - Fabric",
    quantity: 2,
    reason: "Incorrect measurement",
    notes: "Fabric was cut incorrectly and couldn't be used.",
    reportedBy: "Michael Brown",
    cost: 130.0,
    category: "RAW Material",
  },
  {
    id: 4,
    date: "2024-01-12",
    sku: "HW-SCREWS-01",
    skuName: "Hardware - Screws Pack",
    quantity: 10,
    reason: "Spillage",
    notes: "Screws were spilled and couldn't be recovered.",
    reportedBy: "Sarah Davis",
    cost: 122.5,
    category: "Spare Parts",
  },
  {
    id: 5,
    date: "2024-01-11",
    sku: "PKG-BOX-01",
    skuName: "Packaging - Standard Box",
    quantity: 8,
    reason: "Damaged during manufacturing",
    notes: "Boxes were damaged during handling.",
    reportedBy: "Robert Wilson",
    cost: 28.0,
    category: "Packaging Material",
  },
  {
    id: 6,
    date: "2024-01-10",
    sku: "UPH-SEAT-02",
    skuName: "Upholstered Seat - Leather",
    quantity: 1,
    reason: "Defective material",
    notes: "Leather had visible defects.",
    reportedBy: "Lisa Anderson",
    cost: 95.0,
    category: "RAW Material",
  },
  {
    id: 7,
    date: "2024-01-09",
    sku: "WD-FRAME-02",
    skuName: "Wooden Frame - Maple",
    quantity: 4,
    reason: "Expired material",
    notes: "Wood had been stored too long and warped.",
    reportedBy: "David Miller",
    cost: 168.0,
    category: "RAW Material",
  },
  {
    id: 8,
    date: "2024-01-08",
    sku: "HW-BOLTS-01",
    skuName: "Hardware - Bolts Pack",
    quantity: 6,
    reason: "Testing",
    notes: "Used for quality testing procedures.",
    reportedBy: "Jennifer Taylor",
    cost: 94.5,
    category: "Spare Parts",
  },
]

// Form schema
const formSchema = z.object({
  sku: z.string({
    required_error: "Please select a SKU.",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be a positive number.",
  }),
  reason: z.string({
    required_error: "Please select a reason.",
  }),
  notes: z.string().optional(),
})

type WastageFormValues = z.infer<typeof formSchema>

export default function WastageTrackingPage() {
  const [wastage, setWastage] = useState<WastageRecord[]>(initialWastage)
  const [searchTerm, setSearchTerm] = useState("")
  const [reasonFilter, setReasonFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const itemsPerPage = 5

  // Initialize form
  const form = useForm<WastageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      quantity: 1,
      reason: "",
      notes: "",
    },
  })

  // Calculate wastage summary with real-time updates
  const wastageSummary: WastageSummary = useMemo(() => {
    const totalEvents = wastage.length
    const totalUnits = wastage.reduce((total, item) => total + item.quantity, 0)
    const totalCost = wastage.reduce((total, item) => total + (item.cost || 0), 0)

    // Calculate top reasons
    const reasonCounts = wastage.reduce((acc: Record<string, number>, item) => {
      acc[item.reason] = (acc[item.reason] || 0) + 1
      return acc
    }, {})

    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: Math.round((count / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate top SKUs by quantity and cost
    const skuData = wastage.reduce((acc: Record<string, { quantity: number; cost: number }>, item) => {
      if (!acc[item.sku]) {
        acc[item.sku] = { quantity: 0, cost: 0 }
      }
      acc[item.sku].quantity += item.quantity
      acc[item.sku].cost += item.cost || 0
      return acc
    }, {})

    const topSKUs = Object.entries(skuData)
      .map(([sku, data]) => ({ sku, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)

    // Calculate monthly trend (last 6 months)
    const monthlyData = wastage.reduce((acc: Record<string, { quantity: number; cost: number }>, item) => {
      const month = new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      if (!acc[month]) {
        acc[month] = { quantity: 0, cost: 0 }
      }
      acc[month].quantity += item.quantity
      acc[month].cost += item.cost || 0
      return acc
    }, {})

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6)

    return {
      totalEvents,
      totalUnits,
      totalCost,
      topReasons,
      topSKUs,
      monthlyTrend,
    }
  }, [wastage])

  // Filter wastage based on all filters
  const filteredWastage = useMemo(() => {
    return wastage.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.skuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesReason = reasonFilter === "All" || item.reason.includes(reasonFilter)
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter

      let matchesDate = true
      if (dateFilter !== "All") {
        const itemDate = new Date(item.date)
        const now = new Date()
        switch (dateFilter) {
          case "Today":
            matchesDate = itemDate.toDateString() === now.toDateString()
            break
          case "This Week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = itemDate >= weekAgo
            break
          case "This Month":
            matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
            break
        }
      }

      return matchesSearch && matchesReason && matchesCategory && matchesDate
    })
  }, [wastage, searchTerm, reasonFilter, categoryFilter, dateFilter])

  // Paginate wastage
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredWastage.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredWastage.length / itemsPerPage)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, reasonFilter, categoryFilter, dateFilter])

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Handle form submission
  const onSubmit = (data: WastageFormValues) => {
    setIsSubmitting(true)

    // Simulate API call with setTimeout
    setTimeout(() => {
      const selectedSku = skus.find((sku) => sku.value === data.sku)
      const selectedReason = wastageReasons.find((reason) => reason.value === data.reason)

      if (!selectedSku || !selectedReason) {
        toast({
          title: "Error",
          description: "Invalid SKU or reason selected.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const cost = selectedSku.unitCost * Number(data.quantity)

      const newWastage: WastageRecord = {
        id: wastage.length > 0 ? Math.max(...wastage.map((item) => item.id)) + 1 : 1,
        date: new Date().toISOString().split("T")[0],
        sku: data.sku,
        skuName: selectedSku.label.split(" - ").slice(1).join(" - "),
        quantity: Number(data.quantity),
        reason: selectedReason.label,
        notes: data.notes || "",
        reportedBy: "Current User", // In a real app, this would be the logged-in user
        cost,
        category: selectedSku.category,
      }

      setWastage([newWastage, ...wastage])

      toast({
        title: "Wastage recorded successfully",
        description: `${data.quantity} units of ${data.sku} recorded. Cost impact: $${cost.toFixed(2)}`,
      })

      form.reset()
      setIsSubmitting(false)
    }, 1000)
  }

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ["Date", "SKU", "Description", "Quantity", "Reason", "Cost", "Category", "Reported By", "Notes"],
      ...filteredWastage.map((item) => [
        item.date,
        item.sku,
        item.skuName,
        item.quantity.toString(),
        item.reason,
        `$${(item.cost || 0).toFixed(2)}`,
        item.category,
        item.reportedBy,
        item.notes,
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wastage-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: `Exported ${filteredWastage.length} wastage records to CSV.`,
    })
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(wastage.map((item) => item.category)))

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center pb-2 sm:pb-4">
          <PageHeader
            title="Wastage Tracking"
            description="Monitor and analyze material wastage across your operations"
            icon={Trash}
            // action={{
            //   label: "Export Report",
            //   icon: <Download className="h-4 w-4" />,
            //   onClick: handleExport,
            //   variant: "outline",
            // }}
          />
           <Button 
              className="border border-darkblue text-darkblue hover:bg-darkblue/90 ml-auto" variant={"outline"}
              onClick={() => handleExport()}>
              <Download className="h-4 w-4 block mr-2 text-darkblue" />
               <span className="hidden md:block"> Export Report</span>
            </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
          <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
            <CardTitle className="text-base font-medium">Total Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wastageSummary.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {wastageSummary.monthlyTrend.length > 1 && (
                <>
                  {wastageSummary.monthlyTrend[wastageSummary.monthlyTrend.length - 1].quantity >
                  wastageSummary.monthlyTrend[wastageSummary.monthlyTrend.length - 2].quantity
                    ? "↑"
                    : "↓"}{" "}
                  from last period
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
          <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
            <CardTitle className="text-base font-medium">Total Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wastageSummary.totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units wasted</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
          <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
            <CardTitle className="text-base font-medium">Total Cost Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${wastageSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Financial impact</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
          <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
            <CardTitle className="text-base font-medium">Avg Cost/Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {wastageSummary.totalEvents > 0
                ? (wastageSummary.totalCost / wastageSummary.totalEvents).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per wastage event</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Record Wastage Form */}
        <Card>
          <CardHeader>
            <CardTitle>Record Wastage</CardTitle>
            <CardDescription>Record material wastage and specify the reason</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a SKU" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skus.map((sku) => (
                            <SelectItem key={sku.value} value={sku.value}>
                              <div className="flex flex-col">
                                <span>{sku.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${sku.unitCost.toFixed(2)} per unit
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the SKU for which wastage occurred.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Wasted</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        ></Input>
                      </FormControl>
                      <FormDescription>
                        Enter the quantity of material wasted.
                        {form.watch("sku") && form.watch("quantity") && (
                          <span className="block text-sm font-medium text-foreground mt-1">
                            Estimated cost: $
                            {(
                              (skus.find((s) => s.value === form.watch("sku"))?.unitCost || 0) *
                              (Number(form.watch("quantity")) || 0)
                            ).toFixed(2)}
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wastageReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              <div className="flex items-center gap-2">
                                <span>{reason.label}</span>
                                <Badge
                                  variant={
                                    reason.severity === "high"
                                      ? "destructive"
                                      : reason.severity === "medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {reason.severity}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the reason for the wastage.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter any additional notes or details about the wastage..." {...field} />
                      </FormControl>
                      <FormDescription>Provide any additional information about the wastage.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Recording..." : "Record Wastage"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Enhanced Wastage Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Wastage Analytics</CardTitle>
              <CardDescription>Detailed breakdown of wastage patterns</CardDescription>
            </div>
            <Trash className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Reasons */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Top Wastage Reasons</div>
                {wastageSummary.topReasons.slice(0, 3).map((reason, index) => (
                  <div key={reason.reason} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{reason.reason}</span>
                      <span className="font-medium">{reason.percentage}%</span>
                    </div>
                    <Progress value={reason.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Top SKUs by Cost */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Highest Cost Impact SKUs</div>
                {wastageSummary.topSKUs.slice(0, 3).map((sku, index) => (
                  <div key={sku.sku} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{sku.sku}</span>
                      <span className="text-xs text-muted-foreground">{sku.quantity} units</span>
                    </div>
                    <span className="text-sm font-medium">${sku.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Monthly Trend */}
              {wastageSummary.monthlyTrend.length > 1 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Monthly Trend</div>
                  <div className="space-y-2">
                    {wastageSummary.monthlyTrend.slice(-3).map((month) => (
                      <div key={month.month} className="flex items-center justify-between text-sm">
                        <span>{month.month}</span>
                        <div className="text-right">
                          <div className="font-medium">{month.quantity} units</div>
                          <div className="text-xs text-muted-foreground">${month.cost.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Wastage History */}
      <Card>
        <CardHeader>
          <CardTitle>Wastage History</CardTitle>
          <CardDescription>Comprehensive view of all recorded material wastage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Enhanced Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU, description, or reporter..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="reason-filter" className="whitespace-nowrap text-sm">
                    Reason:
                  </Label>
                  <Select onValueChange={(value) => setReasonFilter(value)} value={reasonFilter}>
                    <SelectTrigger id="reason-filter" className="w-[180px]">
                      <SelectValue placeholder="All Reasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Reasons</SelectItem>
                      {wastageReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.label}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-filter" className="whitespace-nowrap text-sm">
                    Category:
                  </Label>
                  <Select onValueChange={(value) => setCategoryFilter(value)} value={categoryFilter}>
                    <SelectTrigger id="category-filter" className="w-[160px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="date-filter" className="whitespace-nowrap text-sm">
                    Period:
                  </Label>
                  <Select onValueChange={(value) => setDateFilter(value)} value={dateFilter}>
                    <SelectTrigger id="date-filter" className="w-[140px]">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Time</SelectItem>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="This Week">This Week</SelectItem>
                      <SelectItem value="This Month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {(searchTerm || reasonFilter !== "All" || categoryFilter !== "All" || dateFilter !== "All") && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Showing {filteredWastage.length} of {wastage.length} records
                </span>
                {filteredWastage.length !== wastage.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setReasonFilter("All")
                      setCategoryFilter("All")
                      setDateFilter("All")
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reported By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="truncate font-medium" title={item.skuName}>
                              {item.skuName}
                            </div>
                            {item.notes && (
                              <div className="truncate text-xs text-muted-foreground" title={item.notes}>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">${(item.cost || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={item.reason}>
                            {item.reason}
                          </div>
                        </TableCell>
                        <TableCell>{item.reportedBy}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        {searchTerm || reasonFilter !== "All" || categoryFilter !== "All" || dateFilter !== "All"
                          ? "No wastage records match your filters."
                          : "No wastage records found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            {filteredWastage.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredWastage.length)} of{" "}
                  {filteredWastage.length} records
                  {filteredWastage.length !== wastage.length && (
                    <span className="ml-2">(filtered from {wastage.length} total)</span>
                  )}
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
                  <span className="text-sm font-medium">
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
    </div>
  )
}
