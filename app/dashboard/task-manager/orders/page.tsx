"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreateTaskDialog } from "@/components/task-manager/create-task-dialog"
import { Search, Plus, Filter, MoreHorizontal, Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/simple-dropdown"
import { useReferenceData } from "@/contexts/reference-data-context"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample production orders data
const initialOrders = [
  {
    id: "PO-2023-001",
    name: "Office Furniture Set",
    customer: "ABC Corporation",
    orderDate: "2023-11-01",
    dueDate: "2023-12-15",
    status: "In Progress",
    priority: "High",
    progress: 65,
    items: [
      { name: "Office Chair - Standard", quantity: 10 },
      { name: "Office Desk - Adjustable", quantity: 5 },
    ],
  },
  {
    id: "PO-2023-002",
    name: "Bookshelf Order",
    customer: "XYZ Libraries",
    orderDate: "2023-11-05",
    dueDate: "2023-12-20",
    status: "In Progress",
    priority: "Medium",
    progress: 45,
    items: [{ name: "Bookshelf - 5 Shelf", quantity: 8 }],
  },
  {
    id: "PO-2023-003",
    name: "Filing Cabinet Order",
    customer: "Legal Firm LLC",
    orderDate: "2023-11-10",
    dueDate: "2023-12-25",
    status: "Not Started",
    priority: "Low",
    progress: 0,
    items: [{ name: "Filing Cabinet - 3 Drawer", quantity: 3 }],
  },
  {
    id: "PO-2023-004",
    name: "Conference Room Setup",
    customer: "Tech Startup Inc",
    orderDate: "2023-11-15",
    dueDate: "2023-12-30",
    status: "Not Started",
    priority: "High",
    progress: 0,
    items: [
      { name: "Conference Table - 8 Person", quantity: 2 },
      { name: "Executive Chair - Leather", quantity: 16 },
    ],
  },
  {
    id: "PO-2023-005",
    name: "Standing Desk Order",
    customer: "Health First Company",
    orderDate: "2023-11-20",
    dueDate: "2024-01-05",
    status: "In Progress",
    priority: "Medium",
    progress: 25,
    items: [{ name: "Standing Desk Converter", quantity: 15 }],
  },
  {
    id: "PO-2023-006",
    name: "Reception Area Furniture",
    customer: "Luxury Hotels Group",
    orderDate: "2023-11-25",
    dueDate: "2024-01-10",
    status: "Not Started",
    priority: "Medium",
    progress: 0,
    items: [
      { name: "Reception Desk - Custom", quantity: 1 },
      { name: "Visitor Chair - Padded", quantity: 6 },
      { name: "Coffee Table - Glass", quantity: 2 },
    ],
  },
]

export default function ProductionOrdersPage() {
  const { taskTypes, tgTypes, tgSchedules } = useReferenceData() || { taskTypes: [], tgTypes: [], tgSchedules: [] }
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)

  // Filter orders based on search term, status filter, and priority filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || order.status === statusFilter
    const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Handle creating a new task
  const handleCreateTask = (taskData: any) => {
    console.log("New task created:", taskData)
    // In a real application, you would save this to your database
    // and update the UI accordingly

    // For demo purposes, let's update the selected order's progress
    if (selectedOrder) {
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: "In Progress", progress: Math.min(order.progress + 10, 100) }
          : order,
      )
      setOrders(updatedOrders)
    }

    setIsCreateTaskDialogOpen(false)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
      case "Not Started":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Not Started</Badge>
      case "Delayed":
        return <Badge className="bg-red-500 hover:bg-red-600">Delayed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Production Orders" description="Manage and track production orders" />

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
            <Progress value={100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((order) => order.status === "In Progress").length}</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
            <Progress value={60} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((order) => order.status === "Completed").length}</div>
            <p className="text-xs text-muted-foreground">+0 from last week</p>
            <Progress value={0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((order) => order.status === "Delayed").length}</div>
            <p className="text-xs text-muted-foreground">+0 from last week</p>
            <Progress value={0} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Orders</CardTitle>
          <CardDescription>View and manage production orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
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
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="priority-filter" className="whitespace-nowrap">
                    Priority:
                  </Label>
                  <Select onValueChange={(value) => setPriorityFilter(value)} defaultValue="All">
                    <SelectTrigger id="priority-filter" className="w-[180px]">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          // Add context menu functionality here
                          alert(`Right-clicked on ${order.id}`)
                        }}
                      >
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.name}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={order.progress} className="h-2 w-[60px]" />
                            <span className="text-xs">{order.progress}%</span>
                          </div>
                        </TableCell>
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsCreateTaskDialogOpen(true)
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Task
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="mr-2 h-4 w-4" />
                                View Timeline
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onSave={handleCreateTask}
        taskTypes={taskTypes}
        tgTypes={tgTypes}
        tgSchedules={tgSchedules}
      />
    </div>
  )
}
