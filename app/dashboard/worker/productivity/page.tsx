"use client"

import { useState } from "react"
import { BarChartIcon, Calendar, Clock, TrendingUp, Award, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
  XAxis,
  YAxis,
} from "recharts"

// Sample data for charts
const productivityTrendsData = [
  { day: "Mon", productivity: 85, efficiency: 82, quality: 90 },
  { day: "Tue", productivity: 88, efficiency: 86, quality: 92 },
  { day: "Wed", productivity: 92, efficiency: 89, quality: 91 },
  { day: "Thu", productivity: 90, efficiency: 88, quality: 93 },
  { day: "Fri", productivity: 95, efficiency: 92, quality: 95 },
  { day: "Sat", productivity: 87, efficiency: 84, quality: 90 },
  { day: "Sun", productivity: 82, efficiency: 80, quality: 88 },
]

const taskDistributionData = [
  { name: "Assembly", value: 40 },
  { name: "Woodworking", value: 30 },
  { name: "Finishing", value: 20 },
  { name: "Other", value: 10 },
]

const workerPerformanceData = [
  { name: "John Smith", productivity: 92, efficiency: 88, quality: 95 },
  { name: "Emily Johnson", productivity: 88, efficiency: 90, quality: 92 },
  { name: "Michael Brown", productivity: 85, efficiency: 82, quality: 88 },
  { name: "Sarah Davis", productivity: 90, efficiency: 87, quality: 91 },
  { name: "Robert Wilson", productivity: 86, efficiency: 85, quality: 89 },
]

const dailyWorkingHoursData = [
  { day: "Mon", hours: 7.5, average: 8 },
  { day: "Tue", hours: 8.2, average: 8 },
  { day: "Wed", hours: 8.0, average: 8 },
  { day: "Thu", hours: 7.8, average: 8 },
  { day: "Fri", hours: 8.5, average: 8 },
  { day: "Sat", hours: 4.5, average: 4 },
  { day: "Sun", hours: 0, average: 0 },
]

const timeAllocationData = [
  { name: "Productive Time", value: 75 },
  { name: "Setup Time", value: 10 },
  { name: "Breaks", value: 10 },
  { name: "Other", value: 5 },
]

const overtimeAnalysisData = [
  { week: "Week 1", regular: 40, overtime: 2 },
  { week: "Week 2", regular: 40, overtime: 5 },
  { week: "Week 3", regular: 40, overtime: 3 },
  { week: "Week 4", regular: 40, overtime: 0 },
]

const taskCompletionRateData = [
  { day: "Mon", completed: 5, target: 5 },
  { day: "Tue", completed: 6, target: 5 },
  { day: "Wed", completed: 4, target: 5 },
  { day: "Thu", completed: 7, target: 5 },
  { day: "Fri", completed: 5, target: 5 },
  { day: "Sat", completed: 3, target: 3 },
  { day: "Sun", completed: 0, target: 0 },
]

const taskCompletionBySkillData = [
  { skill: "Woodworking", completed: 12 },
  { skill: "Assembly", completed: 18 },
  { skill: "Finishing", completed: 8 },
  { skill: "Other", completed: 4 },
]

const taskDurationAnalysisData = [
  { task: "Task 1", actual: 2.5, estimated: 2.0 },
  { task: "Task 2", actual: 1.8, estimated: 2.0 },
  { task: "Task 3", actual: 3.2, estimated: 3.0 },
  { task: "Task 4", actual: 4.0, estimated: 4.5 },
  { task: "Task 5", actual: 1.5, estimated: 1.5 },
]

const qualityScoreTrendsData = [
  { week: "Week 1", quality: 92, target: 90 },
  { week: "Week 2", quality: 94, target: 90 },
  { week: "Week 3", quality: 91, target: 90 },
  { week: "Week 4", quality: 95, target: 90 },
]

const defectRateData = [
  { category: "Furniture", rate: 2.5 },
  { category: "Storage", rate: 1.8 },
  { category: "Accessories", rate: 1.2 },
]

const reworkAnalysisData = [
  { name: "Initial Work", value: 92 },
  { name: "Rework", value: 8 },
]

// COLORS
const COLORS = ["var(--color-productivity)", "var(--color-efficiency)", "var(--color-quality)", "var(--color-other)"]
const COLORS_PIE = ["var(--color-assembly)", "var(--color-woodworking)", "var(--color-finishing)", "var(--color-other)"]
const COLORS_TIME = ["var(--color-productive)", "var(--color-setup)", "var(--color-breaks)", "var(--color-other)"]
const COLORS_REWORK = ["var(--color-initial)", "var(--color-rework)"]

export default function WorkerProductivityPage() {
  const [timeframe, setTimeframe] = useState("week")
  const [worker, setWorker] = useState("all")

  // Calculate productivity metrics
  const productiveHours = 32.5
  const tasksCompleted = 24
  const efficiencyRate = 92
  const qualityScore = 95
  const completionPercentage = 80

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Worker Productivity Metrics</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="worker-select" className="whitespace-nowrap">
              Worker:
            </Label>
            <Select onValueChange={setWorker} defaultValue="all">
              <SelectTrigger id="worker-select" className="w-[180px]">
                <SelectValue placeholder="Select worker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workers</SelectItem>
                <SelectItem value="john-smith">John Smith</SelectItem>
                <SelectItem value="emily-johnson">Emily Johnson</SelectItem>
                <SelectItem value="michael-brown">Michael Brown</SelectItem>
                <SelectItem value="sarah-davis">Sarah Davis</SelectItem>
                <SelectItem value="robert-wilson">Robert Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="timeframe" className="whitespace-nowrap">
              Timeframe:
            </Label>
            <Select onValueChange={setTimeframe} defaultValue="week">
              <SelectTrigger id="timeframe" className="w-[150px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="ml-auto sm:ml-2">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productive Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productiveHours}h</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+2.5h</Badge>
              <span className="text-xs text-muted-foreground ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksCompleted}</div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Completion</span>
                <span className="text-xs font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiencyRate}%</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+2%</Badge>
              <span className="text-xs text-muted-foreground ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityScore}%</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+1%</Badge>
              <span className="text-xs text-muted-foreground ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Performance Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
          <CardDescription>Detailed metrics and analytics for worker productivity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b px-6">
              <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="time-tracking"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Time Tracking
                </TabsTrigger>
                <TabsTrigger
                  value="task-completion"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Task Completion
                </TabsTrigger>
                <TabsTrigger
                  value="quality"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Quality Metrics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Productivity Trends</CardTitle>
                    <CardDescription>Productivity metrics over time</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        productivity: {
                          label: "Productivity",
                          color: "hsl(var(--chart-1))",
                        },
                        efficiency: {
                          label: "Efficiency",
                          color: "hsl(var(--chart-2))",
                        },
                        quality: {
                          label: "Quality",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={productivityTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)" }} />
                          <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="productivity"
                            stroke="var(--color-productivity)"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line type="monotone" dataKey="efficiency" stroke="var(--color-efficiency)" strokeWidth={2} />
                          <Line type="monotone" dataKey="quality" stroke="var(--color-quality)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Task Distribution</CardTitle>
                    <CardDescription>Distribution of tasks by type</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        assembly: {
                          label: "Assembly",
                          color: "hsl(var(--chart-1))",
                        },
                        woodworking: {
                          label: "Woodworking",
                          color: "hsl(var(--chart-2))",
                        },
                        finishing: {
                          label: "Finishing",
                          color: "hsl(var(--chart-3))",
                        },
                        other: {
                          label: "Other",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {taskDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base">Worker Performance Comparison</CardTitle>
                  <CardDescription>Comparison of productivity metrics across workers</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ChartContainer
                    config={{
                      productivity: {
                        label: "Productivity",
                        color: "hsl(var(--chart-1))",
                      },
                      efficiency: {
                        label: "Efficiency",
                        color: "hsl(var(--chart-2))",
                      },
                      quality: {
                        label: "Quality",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workerPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)" }} />
                        <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="productivity" fill="var(--color-productivity)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="efficiency" fill="var(--color-efficiency)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="quality" fill="var(--color-quality)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time-tracking" className="p-6 pt-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base">Daily Working Hours</CardTitle>
                  <CardDescription>Working hours tracked per day</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ChartContainer
                    config={{
                      hours: {
                        label: "Working Hours",
                        color: "hsl(var(--chart-1))",
                      },
                      average: {
                        label: "Average",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyWorkingHoursData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)" }} />
                        <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="average" fill="var(--color-average)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Time Allocation</CardTitle>
                    <CardDescription>Distribution of time across different activities</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        productive: {
                          label: "Productive Time",
                          color: "hsl(var(--chart-1))",
                        },
                        setup: {
                          label: "Setup Time",
                          color: "hsl(var(--chart-2))",
                        },
                        breaks: {
                          label: "Breaks",
                          color: "hsl(var(--chart-3))",
                        },
                        other: {
                          label: "Other",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={timeAllocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {timeAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_TIME[index % COLORS_TIME.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Overtime Analysis</CardTitle>
                    <CardDescription>Regular hours vs. overtime hours</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        regular: {
                          label: "Regular Hours",
                          color: "hsl(var(--chart-1))",
                        },
                        overtime: {
                          label: "Overtime Hours",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overtimeAnalysisData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)" }} />
                          <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="regular" fill="var(--color-regular)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="overtime" fill="var(--color-overtime)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="task-completion" className="p-6 pt-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base">Task Completion Rate</CardTitle>
                  <CardDescription>Number of tasks completed over time</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ChartContainer
                    config={{
                      completed: {
                        label: "Completed Tasks",
                        color: "hsl(var(--chart-1))",
                      },
                      target: {
                        label: "Target",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={taskCompletionRateData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)" }} />
                        <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="var(--color-completed)"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="var(--color-target)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Task Completion by Skill</CardTitle>
                    <CardDescription>Tasks completed grouped by required skill</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        woodworking: {
                          label: "Woodworking",
                          color: "hsl(var(--chart-1))",
                        },
                        assembly: {
                          label: "Assembly",
                          color: "hsl(var(--chart-2))",
                        },
                        finishing: {
                          label: "Finishing",
                          color: "hsl(var(--chart-3))",
                        },
                        other: {
                          label: "Other Skills",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskCompletionBySkillData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="skill" tick={{ fill: "var(--muted-foreground)" }} />
                          <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                            {taskCompletionBySkillData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Task Duration Analysis</CardTitle>
                    <CardDescription>Actual vs. estimated task duration</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        actual: {
                          label: "Actual Duration",
                          color: "hsl(var(--chart-1))",
                        },
                        estimated: {
                          label: "Estimated Duration",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskDurationAnalysisData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="task" tick={{ fill: "var(--muted-foreground)" }} />
                          <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="actual" fill="var(--color-actual)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="estimated" fill="var(--color-estimated)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="p-6 pt-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base">Quality Score Trends</CardTitle>
                  <CardDescription>Quality scores over time</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ChartContainer
                    config={{
                      quality: {
                        label: "Quality Score",
                        color: "hsl(var(--chart-1))",
                      },
                      target: {
                        label: "Target",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={qualityScoreTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)" }} />
                        <YAxis domain={[80, 100]} tick={{ fill: "var(--muted-foreground)" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="quality"
                          stroke="var(--color-quality)"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="var(--color-target)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Defect Rate</CardTitle>
                    <CardDescription>Defect rate by product category</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        furniture: {
                          label: "Furniture",
                          color: "hsl(var(--chart-1))",
                        },
                        storage: {
                          label: "Storage",
                          color: "hsl(var(--chart-2))",
                        },
                        accessories: {
                          label: "Accessories",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={defectRateData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="category" tick={{ fill: "var(--muted-foreground)" }} />
                          <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                            {defectRateData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base">Rework Analysis</CardTitle>
                    <CardDescription>Time spent on rework vs. initial work</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ChartContainer
                      config={{
                        initial: {
                          label: "Initial Work",
                          color: "hsl(var(--chart-1))",
                        },
                        rework: {
                          label: "Rework",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reworkAnalysisData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {reworkAnalysisData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_REWORK[index % COLORS_REWORK.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
