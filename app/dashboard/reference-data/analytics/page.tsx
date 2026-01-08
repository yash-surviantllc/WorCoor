"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  BarChart,
  AreaChart,
  ComposedChart,
  PieChart,
  RadarChart,
  Line,
  Bar,
  Area,
  Cell,
  Pie,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { PageHeader } from "@/components/dashboard/page-header"
import { TrendingUp } from "lucide-react"

// Sample data for Inventory Value Trends
const inventoryValueData = [
  { month: "Jan", value: 120000 },
  { month: "Feb", value: 132000 },
  { month: "Mar", value: 125000 },
  { month: "Apr", value: 140000 },
  { month: "May", value: 160000 },
  { month: "Jun", value: 175000 },
  { month: "Jul", value: 185000 },
  { month: "Aug", value: 190000 },
  { month: "Sep", value: 188000 },
  { month: "Oct", value: 195000 },
  { month: "Nov", value: 210000 },
  { month: "Dec", value: 230000 },
]

// Sample data for Category Distribution
const categoryData = [
  { name: "Furniture", value: 45 },
  { name: "Storage", value: 30 },
  { name: "Accessories", value: 25 },
]

// Sample data for Inventory Levels
const inventoryLevelsData = [
  { date: "Jan", furniture: 450, storage: 300, accessories: 250 },
  { date: "Feb", furniture: 470, storage: 310, accessories: 260 },
  { date: "Mar", furniture: 460, storage: 320, accessories: 270 },
  { date: "Apr", furniture: 480, storage: 330, accessories: 280 },
  { date: "May", furniture: 500, storage: 340, accessories: 290 },
  { date: "Jun", furniture: 520, storage: 350, accessories: 300 },
  { date: "Jul", furniture: 540, storage: 360, accessories: 310 },
  { date: "Aug", furniture: 560, storage: 370, accessories: 320 },
  { date: "Sep", furniture: 550, storage: 380, accessories: 330 },
  { date: "Oct", furniture: 570, storage: 390, accessories: 340 },
  { date: "Nov", furniture: 590, storage: 400, accessories: 350 },
  { date: "Dec", furniture: 610, storage: 410, accessories: 360 },
]

// Sample data for Stock Status
const stockStatusData = [
  { product: "Office Desk", current: 45, minimum: 20 },
  { product: "Office Chair", current: 60, minimum: 30 },
  { product: "Filing Cabinet", current: 25, minimum: 15 },
  { product: "Bookshelf", current: 30, minimum: 10 },
  { product: "Monitor Stand", current: 15, minimum: 10 },
  { product: "Desk Lamp", current: 40, minimum: 20 },
  { product: "Keyboard Tray", current: 35, minimum: 15 },
  { product: "Whiteboard", current: 20, minimum: 5 },
  { product: "Desk Organizer", current: 50, minimum: 25 },
  { product: "Office Sofa", current: 10, minimum: 5 },
  { product: "Conference Table", current: 5, minimum: 2 },
  { product: "Projector Screen", current: 8, minimum: 3 },
]

// Sample data for Turnover Ratio
const turnoverData = [
  { category: "Furniture", turnover: 4.2, industry: 3.8 },
  { category: "Storage", turnover: 5.1, industry: 4.5 },
  { category: "Accessories", turnover: 6.3, industry: 5.8 },
  { category: "Electronics", turnover: 7.2, industry: 6.5 },
  { category: "Lighting", turnover: 3.9, industry: 3.5 },
  { category: "Decor", turnover: 4.8, industry: 4.2 },
]

// Sample data for Aging Analysis
const agingData = [
  { age: "0-30 days", value: 65 },
  { age: "31-60 days", value: 20 },
  { age: "61-90 days", value: 10 },
  { age: "91+ days", value: 5 },
]

// Sample data for Wastage Trends
const wastageData = [
  { month: "Jan", damaged: 12, expired: 5, defective: 8 },
  { month: "Feb", damaged: 10, expired: 6, defective: 7 },
  { month: "Mar", damaged: 11, expired: 4, defective: 9 },
  { month: "Apr", damaged: 9, expired: 7, defective: 6 },
  { month: "May", damaged: 8, expired: 8, defective: 5 },
  { month: "Jun", damaged: 10, expired: 5, defective: 7 },
  { month: "Jul", damaged: 12, expired: 6, defective: 8 },
  { month: "Aug", damaged: 11, expired: 7, defective: 9 },
  { month: "Sep", damaged: 9, expired: 8, defective: 7 },
  { month: "Oct", damaged: 10, expired: 6, defective: 8 },
  { month: "Nov", damaged: 8, expired: 5, defective: 6 },
  { month: "Dec", damaged: 7, expired: 4, defective: 5 },
]

// COLORS - using the KPI card gradient colors
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#6366f1", "#14b8a6", "#f97316", "#f43f5f"]

export default function InventoryAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("month")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory Analytics"
        description="Analyze inventory performance and trends"
        icon={TrendingUp}
      />

      <div className="flex items-center justify-end space-x-2">
        <Label htmlFor="timeframe" className="text-sm font-medium leading-none">
          Timeframe:
        </Label>
        <Select onValueChange={setTimeframe} defaultValue="month">
          <SelectTrigger id="timeframe" className="w-[180px] text-sm">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,750</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3x</div>
            <p className="text-xs text-muted-foreground">+0.5x from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockout Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">-0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wastage Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250</div>
            <p className="text-xs text-muted-foreground">-15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory-levels">Inventory Levels</TabsTrigger>
          <TabsTrigger value="turnover">Turnover Analysis</TabsTrigger>
          <TabsTrigger value="wastage">Wastage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value Trends</CardTitle>
                <CardDescription>Monthly inventory value over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryValueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Inventory Value"]} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" activeDot={{ r: 8, fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Distribution of inventory across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#10b981"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Status by Product</CardTitle>
              <CardDescription>Current stock levels compared to minimum required</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#8b5cf6" name="Current Stock" />
                  <Bar dataKey="minimum" fill="#f59e0b" name="Minimum Required" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory-levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels by Category</CardTitle>
              <CardDescription>Stock levels over time by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={inventoryLevelsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="furniture"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.8}
                    name="Furniture"
                  />
                  <Area
                    type="monotone"
                    dataKey="storage"
                    stackId="1"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.8}
                    name="Storage"
                  />
                  <Area
                    type="monotone"
                    dataKey="accessories"
                    stackId="1"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.8}
                    name="Accessories"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
                <CardDescription>Distribution of products by stock status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "In Stock", value: 65 },
                        { name: "Low Stock", value: 25 },
                        { name: "Out of Stock", value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#f43f5f"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                      <Cell fill={COLORS[2]} />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Aging</CardTitle>
                <CardDescription>Age distribution of inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Bar dataKey="value" fill="#3b82f6">
                      {agingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="turnover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Turnover Ratio</CardTitle>
              <CardDescription>Turnover ratio by product category compared to industry average</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={turnoverData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="turnover" fill="#10b981" name="Our Turnover" />
                  <Bar dataKey="industry" fill="#8b5cf6" name="Industry Average" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Turnover Performance</CardTitle>
                <CardDescription>Radar chart of turnover metrics by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={turnoverData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 8]} />
                    <Radar name="Our Turnover" dataKey="turnover" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Radar
                      name="Industry Average"
                      dataKey="industry"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Days in Inventory</CardTitle>
                <CardDescription>Average days in inventory by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={[
                      { category: "Furniture", days: 85 },
                      { category: "Storage", days: 70 },
                      { category: "Accessories", days: 55 },
                      { category: "Electronics", days: 45 },
                      { category: "Lighting", days: 90 },
                      { category: "Decor", days: 75 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" />
                    <Tooltip formatter={(value) => [`${value} days`, "Average Days"]} />
                    <Bar dataKey="days" fill="#14b8a6">
                      {turnoverData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wastage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wastage Trends</CardTitle>
              <CardDescription>Monthly wastage by reason</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={wastageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="damaged"
                    stackId="1"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.8}
                    name="Damaged"
                  />
                  <Area
                    type="monotone"
                    dataKey="expired"
                    stackId="1"
                    stroke="#f43f5f"
                    fill="#f43f5f"
                    fillOpacity={0.8}
                    name="Expired"
                  />
                  <Area
                    type="monotone"
                    dataKey="defective"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.8}
                    name="Defective"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Wastage by Reason</CardTitle>
                <CardDescription>Distribution of wastage by reason</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Damaged", value: 45 },
                        { name: "Expired", value: 30 },
                        { name: "Defective", value: 25 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#10b981"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                      <Cell fill={COLORS[2]} />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wastage Cost by Category</CardTitle>
                <CardDescription>Wastage costs by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={[
                      { category: "Furniture", cost: 450, percentage: 2.5 },
                      { category: "Storage", cost: 320, percentage: 1.8 },
                      { category: "Accessories", cost: 280, percentage: 3.2 },
                      { category: "Electronics", cost: 150, percentage: 4.5 },
                      { category: "Lighting", cost: 50, percentage: 1.2 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cost" fill="#8b5cf6" name="Wastage Cost ($)" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="percentage"
                      stroke="#f59e0b"
                      name="% of Inventory Value"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
