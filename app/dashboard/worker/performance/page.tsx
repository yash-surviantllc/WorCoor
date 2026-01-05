"use client"

import { BarChart, Calendar, CheckCircle, Clock, TrendingDown, TrendingUp, Users, LineChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"

// First, let's add the necessary imports for the charts at the top of the file
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for worker performance
const topPerformers = [
  {
    id: 1,
    name: "Emma Johnson",
    department: "Assembly",
    efficiency: 98,
    tasksCompleted: 145,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Michael Chen",
    department: "Quality Control",
    efficiency: 96,
    tasksCompleted: 132,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Sarah Williams",
    department: "Packaging",
    efficiency: 95,
    tasksCompleted: 128,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "David Rodriguez",
    department: "Assembly",
    efficiency: 94,
    tasksCompleted: 137,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    department: "Machining",
    efficiency: 93,
    tasksCompleted: 124,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
]

const needsImprovement = [
  {
    id: 6,
    name: "James Wilson",
    department: "Assembly",
    efficiency: 72,
    tasksCompleted: 87,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Olivia Martinez",
    department: "Packaging",
    efficiency: 75,
    tasksCompleted: 92,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Robert Taylor",
    department: "Quality Control",
    efficiency: 78,
    tasksCompleted: 95,
    avatar: "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg?height=40&width=40",
  },
]

const departmentPerformance = [
  { id: 1, department: "Assembly", avgEfficiency: 89, totalTasks: 1245, workers: 14 },
  { id: 2, department: "Packaging", avgEfficiency: 87, totalTasks: 982, workers: 10 },
  { id: 3, department: "Quality Control", avgEfficiency: 92, totalTasks: 876, workers: 8 },
  { id: 4, department: "Machining", avgEfficiency: 85, totalTasks: 754, workers: 7 },
  { id: 5, department: "Maintenance", avgEfficiency: 83, totalTasks: 432, workers: 5 },
]

// Add mock data for the performance distribution chart
const performanceDistributionData = [
  { range: "60-65%", count: 2 },
  { range: "65-70%", count: 3 },
  { range: "70-75%", count: 5 },
  { range: "75-80%", count: 8 },
  { range: "80-85%", count: 12 },
  { range: "85-90%", count: 15 },
  { range: "90-95%", count: 10 },
  { range: "95-100%", count: 5 },
]

// Add mock data for the task completion trends chart
const taskCompletionTrendsData = [
  { month: "Jan", completed: 320, target: 350 },
  { month: "Feb", completed: 340, target: 350 },
  { month: "Mar", completed: 360, target: 350 },
  { month: "Apr", completed: 375, target: 380 },
  { month: "May", completed: 390, target: 380 },
  { month: "Jun", completed: 400, target: 380 },
  { month: "Jul", completed: 420, target: 400 },
  { month: "Aug", completed: 430, target: 400 },
  { month: "Sep", completed: 435, target: 420 },
  { month: "Oct", completed: 450, target: 420 },
  { month: "Nov", completed: 470, target: 450 },
  { month: "Dec", completed: 480, target: 450 },
]

// Add mock data for productivity trends
const productivityTrendsData = [
  { month: "Jan", productivity: 78, industry: 75 },
  { month: "Feb", productivity: 80, industry: 75 },
  { month: "Mar", productivity: 82, industry: 76 },
  { month: "Apr", productivity: 85, industry: 76 },
  { month: "May", productivity: 83, industry: 77 },
  { month: "Jun", productivity: 87, industry: 77 },
  { month: "Jul", productivity: 89, industry: 78 },
  { month: "Aug", productivity: 88, industry: 78 },
  { month: "Sep", productivity: 91, industry: 79 },
  { month: "Oct", productivity: 92, industry: 79 },
  { month: "Nov", productivity: 94, industry: 80 },
  { month: "Dec", productivity: 95, industry: 80 },
]

// Add mock data for task distribution
const taskDistributionData = [
  { category: "Assembly", value: 35 },
  { category: "Quality Control", value: 20 },
  { category: "Packaging", value: 15 },
  { category: "Machining", value: 12 },
  { category: "Maintenance", value: 8 },
  { category: "Training", value: 5 },
  { category: "Administrative", value: 5 },
]

// Add mock data for worker performance comparison
const workerComparisonData = [
  { name: "Emma J.", efficiency: 98, quality: 96, productivity: 95, attendance: 99 },
  { name: "Michael C.", efficiency: 96, quality: 97, productivity: 94, attendance: 98 },
  { name: "Sarah W.", efficiency: 95, quality: 95, productivity: 96, attendance: 97 },
  { name: "David R.", efficiency: 94, quality: 93, productivity: 92, attendance: 96 },
  { name: "Lisa T.", efficiency: 93, quality: 94, productivity: 93, attendance: 95 },
]

// Colors for the pie chart
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#6366f1", "#14b8a6", "#f97316", "#f43f5f"]

export default function WorkerPerformancePage() {
  // Helper function to determine performance trend badge
  const getTrendBadge = (value: number) => {
    if (value >= 5) {
      return (
        <Badge key={`trend-${value}`} className="bg-green-100 text-green-800 hover:bg-green-100">
          <TrendingUp className="h-3 w-3 mr-1" /> {value}%
        </Badge>
      )
    } else if (value <= -5) {
      return (
        <Badge key={`trend-${value}`} className="bg-red-100 text-red-800 hover:bg-red-100">
          <TrendingDown className="h-3 w-3 mr-1" /> {Math.abs(value)}%
        </Badge>
      )
    } else {
      return (
        <Badge key={`trend-${value}`} className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          {value > 0 ? "+" : ""}
          {value}%
        </Badge>
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Worker Performance Analytics"
        description="Track and analyze worker productivity, efficiency, and performance metrics"
        icon={LineChart}
      />

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Search workers..." className="w-full sm:w-[250px]" />
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="assembly">Assembly</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
              <SelectItem value="quality">Quality Control</SelectItem>
              <SelectItem value="machining">Machining</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="month">
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            <Progress value={87} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,289</div>
            <p className="text-xs text-muted-foreground">+342 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 hrs</div>
            <p className="text-xs text-muted-foreground">-0.3 hrs from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Rating</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
            <Progress value={92} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Worker performance by efficiency range</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    count: {
                      label: "Worker Count",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-count)"
                        fill="var(--color-count)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
                <CardDescription>Tasks completed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    completed: {
                      label: "Tasks Completed",
                      color: "#10b981",
                    },
                    target: {
                      label: "Target",
                      color: "#8b5cf6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={taskCompletionTrendsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={2} dot={false} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Workers with highest efficiency ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={worker.avatar || "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg"} alt={worker.name} />
                          <AvatarFallback>
                            {worker.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">{worker.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{worker.efficiency}%</p>
                        <p className="text-sm text-muted-foreground">{worker.tasksCompleted} tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Needs Improvement</CardTitle>
                <CardDescription>Workers with lower efficiency ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {needsImprovement.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={worker.avatar || "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg"} alt={worker.name} />
                          <AvatarFallback>
                            {worker.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">{worker.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{worker.efficiency}%</p>
                        <p className="text-sm text-muted-foreground">{worker.tasksCompleted} tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <CardTitle>Worker Performance Details</CardTitle>
              <CardDescription>Detailed performance metrics for all workers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Worker</th>
                      <th className="py-3 px-4 text-left font-medium">Department</th>
                      <th className="py-3 px-4 text-left font-medium">Efficiency</th>
                      <th className="py-3 px-4 text-left font-medium">Tasks</th>
                      <th className="py-3 px-4 text-left font-medium">Quality</th>
                      <th className="py-3 px-4 text-left font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...topPerformers, ...needsImprovement].map((worker) => {
                      // Pre-calculate random values to avoid regenerating them in JSX
                      const qualityValue = Math.floor(Math.random() * 20) + 80
                      const trendValue = Math.floor(Math.random() * 21) - 10

                      return (
                        <tr key={worker.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={worker.avatar || "https://dwnn5f7i77za.cloudfront.net/assets-web/general/placeholder.svg"} alt={worker.name} />
                                <AvatarFallback>
                                  {worker.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>{worker.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{worker.department}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={worker.efficiency} className="h-2 w-16" />
                              <span>{worker.efficiency}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{worker.tasksCompleted}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={qualityValue} className="h-2 w-16" />
                              <span>{qualityValue}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{getTrendBadge(trendValue)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Performance metrics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Department</th>
                      <th className="py-3 px-4 text-left font-medium">Workers</th>
                      <th className="py-3 px-4 text-left font-medium">Avg. Efficiency</th>
                      <th className="py-3 px-4 text-left font-medium">Tasks Completed</th>
                      <th className="py-3 px-4 text-left font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentPerformance.map((dept) => {
                      // Pre-calculate random values
                      const trendValue = Math.floor(Math.random() * 21) - 10

                      return (
                        <tr key={dept.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{dept.department}</td>
                          <td className="py-3 px-4">{dept.workers}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={dept.avgEfficiency} className="h-2 w-16" />
                              <span>{dept.avgEfficiency}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{dept.totalTasks}</td>
                          <td className="py-3 px-4">{getTrendBadge(trendValue)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Trends</CardTitle>
                <CardDescription>Worker efficiency over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    efficiency: {
                      label: "Average Efficiency",
                      color: "#f59e0b",
                    },
                    target: {
                      label: "Target",
                      color: "#6366f1",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { month: "Jan", efficiency: 82, target: 85 },
                        { month: "Feb", efficiency: 83, target: 85 },
                        { month: "Mar", efficiency: 84, target: 85 },
                        { month: "Apr", efficiency: 85, target: 85 },
                        { month: "May", efficiency: 84, target: 85 },
                        { month: "Jun", efficiency: 86, target: 85 },
                        { month: "Jul", efficiency: 87, target: 87 },
                        { month: "Aug", efficiency: 86, target: 87 },
                        { month: "Sep", efficiency: 88, target: 87 },
                        { month: "Oct", efficiency: 89, target: 87 },
                        { month: "Nov", efficiency: 90, target: 90 },
                        { month: "Dec", efficiency: 91, target: 90 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[75, 95]} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="efficiency" stroke="var(--color-efficiency)" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="var(--color-target)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Quality ratings over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    quality: {
                      label: "Quality Rating",
                      color: "#14b8a6",
                    },
                    target: {
                      label: "Target",
                      color: "#f97316",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { month: "Jan", quality: 88, target: 90 },
                        { month: "Feb", quality: 89, target: 90 },
                        { month: "Mar", quality: 90, target: 90 },
                        { month: "Apr", quality: 91, target: 90 },
                        { month: "May", quality: 90, target: 90 },
                        { month: "Jun", quality: 92, target: 90 },
                        { month: "Jul", quality: 93, target: 92 },
                        { month: "Aug", quality: 92, target: 92 },
                        { month: "Sep", quality: 94, target: 92 },
                        { month: "Oct", quality: 93, target: 92 },
                        { month: "Nov", quality: 95, target: 95 },
                        { month: "Dec", quality: 96, target: 95 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[85, 100]} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="quality" stroke="var(--color-quality)" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="var(--color-target)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Productivity Trends</CardTitle>
                <CardDescription>Worker productivity compared to industry average</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    productivity: {
                      label: "Our Workforce",
                      color: "#f43f5f",
                    },
                    industry: {
                      label: "Industry Average",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={productivityTrendsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="productivity" stroke="var(--color-productivity)" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="industry"
                        stroke="var(--color-industry)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Distribution of tasks by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    value: {
                      label: "Percentage",
                      color: "#10b981",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={taskDistributionData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="category" width={100} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Worker Performance Comparison</CardTitle>
                <CardDescription>Comparison of key performance metrics across workers</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <ChartContainer
                  config={{
                    efficiency: {
                      label: "Efficiency",
                      color: "#8b5cf6",
                    },
                    quality: {
                      label: "Quality",
                      color: "#f59e0b",
                    },
                    productivity: {
                      label: "Productivity",
                      color: "#6366f1",
                    },
                    attendance: {
                      label: "Attendance",
                      color: "#14b8a6",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={workerComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="efficiency" fill="var(--color-efficiency)" />
                      <Bar dataKey="quality" fill="var(--color-quality)" />
                      <Bar dataKey="productivity" fill="var(--color-productivity)" />
                      <Bar dataKey="attendance" fill="var(--color-attendance)" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution by Department</CardTitle>
                <CardDescription>Percentage of tasks handled by each department</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <ChartContainer 
                  className="h-[400px]"
                  config={{
                    task: { color: "#2563eb" },
                    complete: { color: "#16a34a" },
                    inProgress: { color: "#d97706" },
                    pending: { color: "#dc2626" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
