"use client"

import { useState } from "react"
import { BarChartIcon, Calendar, Clock, Package, LayoutDashboard } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"

// Manufacturing Progress Chart Data
const manufacturingProgressData = [
  { name: "Office Chairs", completed: 75, inProgress: 25 },
  { name: "Bookshelves", completed: 45, inProgress: 55 },
  { name: "Filing Cabinets", completed: 25, inProgress: 75 },
  { name: "Conference Tables", completed: 10, inProgress: 90 },
  { name: "Standing Desks", completed: 60, inProgress: 40 },
]

// Worker Productivity Chart Data
const workerProductivityData = [
  { name: "John Smith", productivity: 85, target: 80 },
  { name: "Emily Johnson", productivity: 92, target: 80 },
  { name: "Michael Brown", productivity: 78, target: 80 },
  { name: "Sarah Davis", productivity: 88, target: 80 },
  { name: "Robert Wilson", productivity: 82, target: 80 },
]

// Inventory Overview Chart Data
const inventoryData = [
  { name: "Wood", value: 35 },
  { name: "Metal", value: 25 },
  { name: "Fabric", value: 20 },
  { name: "Hardware", value: 15 },
  { name: "Packaging", value: 5 },
]

// Order Timeline Data
const orderTimelineData = [
  { name: "Week 1", chairs: 5, tables: 2, shelves: 0 },
  { name: "Week 2", chairs: 3, tables: 1, shelves: 4 },
  { name: "Week 3", chairs: 2, tables: 0, shelves: 3 },
  { name: "Week 4", chairs: 0, tables: 3, shelves: 1 },
]

// Manufacturing Efficiency Data
const manufacturingEfficiencyData = [
  { name: "Cutting", efficiency: 92 },
  { name: "Assembly", efficiency: 85 },
  { name: "Finishing", efficiency: 78 },
  { name: "QC", efficiency: 95 },
  { name: "Packaging", efficiency: 88 },
]

// Production Bottlenecks Data
const bottlenecksData = [
  { name: "Mon", assembly: 65, finishing: 80 },
  { name: "Tue", assembly: 72, finishing: 75 },
  { name: "Wed", assembly: 68, finishing: 82 },
  { name: "Thu", assembly: 75, finishing: 85 },
  { name: "Fri", assembly: 80, finishing: 77 },
]

// Worker Productivity Detailed Data
const workerDetailedData = [
  { name: "John", tasks: 24, hours: 38 },
  { name: "Emily", tasks: 28, hours: 40 },
  { name: "Michael", tasks: 22, hours: 39 },
  { name: "Sarah", tasks: 26, hours: 37 },
  { name: "Robert", tasks: 23, hours: 40 },
]

// Inventory Levels Data
const inventoryLevelsData = [
  { name: "Wood", current: 65, minimum: 50 },
  { name: "Metal", current: 80, minimum: 50 },
  { name: "Fabric", current: 45, minimum: 50 },
  { name: "Hardware", current: 90, minimum: 50 },
  { name: "Packaging", current: 75, minimum: 50 },
]

// Wastage Data
const wastageData = [
  { name: "Wood", value: 45 },
  { name: "Metal", value: 20 },
  { name: "Fabric", value: 25 },
  { name: "Other", value: 10 },
]

// Custom colors for pie charts
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#6366f1", "#14b8a6", "#f97316", "#f43f5f"]

export default function TaskManagerDashboardsPage() {
  const [timeframe, setTimeframe] = useState("week")

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center pb-2 sm:pb-4">
        <PageHeader 
        title="Task Manager Dashboards" 
        description="Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for" 
        icon={LayoutDashboard} />

        <div className="relative flex flex-wrap align-middle gap-2 ml-auto md:flex-none mt-1">
          {/* <Label htmlFor="timeframe" className="whitespace-nowrap">
            Timeframe:
          </Label> */}
          <Select onValueChange={setTimeframe} defaultValue="week">
            <SelectTrigger id="timeframe" className="w-[160px] bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
            <label
              htmlFor="status"
              className={`absolute left-2.5 z-10 bg-background px-1 text-sm text-muted-foreground transition-all duration-200 
                ${timeframe ? '-top-2 text-xs scale-90' : 'top-4 text-sm'}
              `}
            >
              Timeframe
          </label>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex justify-start h-14 bg-gray-200 p-0 dark:bg-gray-900 overflow-y-auto rounded-xl dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  scrollbar-thumb-hover dark-scrollbar-thumb-hover dark:[&::-webkit-scrollbar]y:w-[4px] [&::-webkit-scrollbar]:h-[2px] mb-4">
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="orders">Order Tracking</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="manufacturing">Manufacturing Progress</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="workers">Worker Productivity</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="inventory">Inventory & Wastage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
              <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
                <CardTitle className="text-base font-medium">Active Orders</CardTitle>
                <Package className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4 mt-2 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+2 from last week</p>
                <Progress value={65} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
              <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
                <CardTitle className="text-base font-medium">Tasks In Progress</CardTitle>
                <Calendar className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4  text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+8 from last week</p>
                <Progress value={42} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10">
              <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
                <CardTitle className="text-base font-medium">On-Time Completion</CardTitle>
                <Clock className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4  text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">+2% from last week</p>
                <Progress value={87} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between  bg-gradient-to-br from-indigo-100  to-rose-50/10  dark:from-slate-500 dark:to-indigo-200/10"> 
              <CardHeader className="flex flex-row items-baseline justify-between space-y-0.5 pb-2">
                <CardTitle className="text-base font-medium">Resource Utilization</CardTitle>
                <BarChartIcon className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4  text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">+5% from last week</p>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-3 md:col-span-3 lg:col-span-2">
              <CardHeader className="space-y-0.5">
                <CardTitle>Manufacturing Progress</CardTitle>
                <CardDescription>Overview of manufacturing progress by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart className="text-xs" data={manufacturingProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill="#8b5cf6" name="Completed" />
                      <Bar dataKey="inProgress" stackId="a" fill="#10b981" name="In Progress" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 md:col-span-3 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Production orders due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Office Chairs (10)</p>
                      <p className="text-xs text-muted-foreground">PO-2023-001</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Due in 2 days</Badge>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bookshelves (8)</p>
                      <p className="text-xs text-muted-foreground">PO-2023-002</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Due in 5 days</Badge>
                  </div>
                  <Progress value={45} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Filing Cabinets (3)</p>
                      <p className="text-xs text-muted-foreground">PO-2023-003</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Due in 10 days</Badge>
                  </div>
                  <Progress value={25} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Conference Tables (2)</p>
                      <p className="text-xs text-muted-foreground">PO-2023-004</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Due in 14 days</Badge>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Worker Productivity</CardTitle>
                <CardDescription>Productivity metrics by worker</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart className="text-xs" data={workerProductivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="productivity" fill="#3b82f6" name="Productivity" />
                      <Bar dataKey="target" fill="#f59e0b" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Inventory Overview</CardTitle>
                <CardDescription>Current inventory levels and wastage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart className="text-xs">
                      <Pie className="text-xs"
                        data={inventoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-0.5">
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription className="mt-0">Track the progress of production orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Office Chairs (10)</h3>
                      <p className="text-xs text-muted-foreground">PO-2023-001 • Due: Nov 10, 2023</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Materials</span>
                    <span>Assembly</span>
                    <span>Finishing</span>
                    <span>QC</span>
                    <span>Shipping</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Bookshelves (8)</h3>
                      <p className="text-xs text-muted-foreground">PO-2023-002 • Due: Nov 15, 2023</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Materials</span>
                    <span>Assembly</span>
                    <span>Finishing</span>
                    <span>QC</span>
                    <span>Shipping</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Filing Cabinets (3)</h3>
                      <p className="text-xs text-muted-foreground">PO-2023-003 • Due: Nov 20, 2023</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Materials Prep</Badge>
                  </div>
                  <Progress value={25} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Materials</span>
                    <span>Assembly</span>
                    <span>Finishing</span>
                    <span>QC</span>
                    <span>Shipping</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Conference Tables (2)</h3>
                      <p className="text-xs text-muted-foreground">PO-2023-004 • Due: Nov 25, 2023</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Materials Prep</Badge>
                  </div>
                  <Progress value={10} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Materials</span>
                    <span>Assembly</span>
                    <span>Finishing</span>
                    <span>QC</span>
                    <span>Shipping</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Standing Desk Converters (15)</h3>
                      <p className="text-xs text-muted-foreground">PO-2023-005 • Due: Nov 30, 2023</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Materials</span>
                    <span>Assembly</span>
                    <span>Finishing</span>
                    <span>QC</span>
                    <span>Shipping</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0.5">
              <CardTitle>Tentative Completion Dates</CardTitle>
              <CardDescription>Projected completion dates for all production orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart className="text-xs" data={orderTimelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="chairs" fill="#6366f1" name="Office Chairs" />
                    <Bar dataKey="tables" fill="#14b8a6" name="Conference Tables" />
                    <Bar dataKey="shelves" fill="#f97316" name="Bookshelves" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manufacturing" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-0.5">
              <CardTitle>Product Manufacturing Progress</CardTitle>
              <CardDescription>Track the manufacturing progress of each product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Office Chair - Standard</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cut Fabric</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assemble Chair Base</span>
                        <span className="text-sm font-medium">80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Upholster Seat and Back</span>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Final Assembly</span>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quality Control</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Office Desk - Adjustable</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cut Wood Panels</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assemble Frame</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Install Adjustment Mechanism</span>
                        <span className="text-sm font-medium">50%</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Apply Finish</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quality Control</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Manufacturing Efficiency</CardTitle>
                <CardDescription>Efficiency metrics by manufacturing step</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart className="text-xs" data={manufacturingEfficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="efficiency" fill="#f43f5f" name="Efficiency" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Production Bottlenecks</CardTitle>
                <CardDescription>Identify bottlenecks in the manufacturing process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart  className="text-xs"  data={bottlenecksData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="assembly" stroke="#8b5cf6" name="Assembly" strokeWidth={2} />
                      <Line type="monotone" dataKey="finishing" stroke="#10b981" name="Finishing" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-0.5">
              <CardTitle>Worker Productivity</CardTitle>
              <CardDescription>Productivity metrics for each worker</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart className="text-sm" data={workerDetailedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3b82f6" name="Tasks Completed" />
                    <Bar dataKey="hours" fill="#f59e0b" name="Hours Worked" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Task Completion Rate</CardTitle>
                <CardDescription>Task completion rate by worker</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">John Smith</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Emily Johnson</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Michael Brown</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Sarah Davis</span>
                      <span>97%</span>
                    </div>
                    <Progress value={97} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Robert Wilson</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Worker Utilization</CardTitle>
                <CardDescription>Current workload and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">John Smith</span>
                      <Badge className="bg-orange-100 text-orange-800">Medium Load</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Emily Johnson</span>
                      <Badge className="bg-green-100 text-green-800">Low Load</Badge>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Michael Brown</span>
                      <Badge className="bg-red-100 text-red-800">High Load</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Sarah Davis</span>
                      <Badge className="bg-green-100 text-green-800">Low Load</Badge>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Robert Wilson</span>
                      <Badge className="bg-orange-100 text-orange-800">Medium Load</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>Current inventory levels by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart className="text-xs" data={inventoryLevelsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current" fill="#6366f1" name="Current" />
                      <Bar dataKey="minimum" fill="#14b8a6" name="Minimum" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="space-y-0.5">
                <CardTitle>Wastage Tracking</CardTitle>
                <CardDescription>Material wastage by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart className="text-xs">
                      <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={wastageData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {wastageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="space-y-0.5">
              <CardTitle>Critical Inventory Items</CardTitle>
              <CardDescription>Items that are low in stock or need reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Wooden Panels - Oak</h3>
                      <p className="text-xs text-muted-foreground">SKU: WD-FRAME-01</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                  </div>
                  <Progress value={15} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current: 15 units</span>
                    <span className="text-muted-foreground">Minimum: 50 units</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Upholstery Fabric - Black</h3>
                      <p className="text-xs text-muted-foreground">SKU: UPH-FAB-02</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                  </div>
                  <Progress value={20} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current: 25 yards</span>
                    <span className="text-muted-foreground">Minimum: 100 yards</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Metal Legs - Chrome</h3>
                      <p className="text-xs text-muted-foreground">SKU: MT-LEG-01</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Reorder Soon</Badge>
                  </div>
                  <Progress value={35} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current: 45 sets</span>
                    <span className="text-muted-foreground">Minimum: 30 sets</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Adjustment Mechanisms</h3>
                      <p className="text-xs text-muted-foreground">SKU: ADJ-MECH-01</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Reorder Soon</Badge>
                  </div>
                  <Progress value={40} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current: 28 units</span>
                    <span className="text-muted-foreground">Minimum: 20 units</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
