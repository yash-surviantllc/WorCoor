"use client"

import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  ArrowRight,
  BarChart,
  Calendar,
  ClipboardList,
  LineChart,
  ListChecks,
  Clock,
  AlertTriangle,
  Bell,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function TaskManagerPage() {
  // Sample data for quick stats
  const stats = {
    activeOrders: 12,
    pendingApprovals: 5,
    tasksInProgress: 28,
    completionRate: 87,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Task Manager Panel"
        description="Manage production orders, task assignments, and track progress"
        icon={ClipboardList}
      />

      {/* KPI Summary Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full ">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-100">Active Orders</p>
                <p className="text-3xl font-bold text-white">{stats.activeOrders}</p>
                <p className="text-xs text-blue-200 font-medium">+2 from last week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-100">Pending Approvals</p>
                <p className="text-3xl font-bold text-white">{stats.pendingApprovals}</p>
                <p className="text-xs text-emerald-200 font-medium">-1 from last week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-100">Tasks In Progress</p>
                <p className="text-3xl font-bold text-white">{stats.tasksInProgress}</p>
                <p className="text-xs text-purple-200 font-medium">+5 from last week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">Completion Rate</p>
                <p className="text-3xl font-bold text-white">{stats.completionRate}%</p>
                <p className="text-xs text-amber-200 font-medium">+3% from last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Task Repository</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create and manage organization-wide tasks
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Available tasks:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  24 Tasks
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-6 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/task-manager/repository" className="flex items-center justify-center gap-2">
                  Manage Tasks
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
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Task Assignment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Assign tasks to workers</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Unassigned tasks:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  8 Tasks
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-6 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/task-manager/assignments" className="flex items-center justify-center gap-2">
                  Assign Tasks
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
                  <BarChart className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Dashboards</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    View production metrics and analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">On-time completion:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  87% rate
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-6 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/task-manager/dashboards" className="flex items-center justify-center gap-2">
                  View Dashboards
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
                  <Bell className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Task Alerts Management</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage task alerts and notifications
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Active alerts:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  5 Alerts
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-6 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/task-manager/alerts" className="flex items-center justify-center gap-2">
                  Manage Alerts
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-white shadow-sm">
                  <ListChecks className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Task Tracking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track task progress and completion
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">In progress:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  28 Tasks
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-6 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-800 dark:hover:to-slate-900 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/task-manager/tracking" className="flex items-center justify-center gap-2">
                  Track Tasks
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
                  <LineChart className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Analyze worker and production performance
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Worker productivity:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  94% average
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-6 mx-2 px-6 py-3 border border-slate-200/50 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/analytics" className="flex items-center justify-center gap-2">
                  View Analytics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-muted-foreground">Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">Quality Inspection</p>
                  <p className="text-sm text-muted-foreground">T-2023-001</p>
                </div>
                <Badge variant="secondary">Due in 2 days</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">Assembly Line Setup</p>
                  <p className="text-sm text-muted-foreground">T-2023-002</p>
                </div>
                <Badge variant="secondary">Due in 5 days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">Inventory Audit</p>
                  <p className="text-sm text-muted-foreground">T-2023-003</p>
                </div>
                <Badge variant="secondary">Due in 10 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Resource Allocation</CardTitle>
            <CardDescription className="text-muted-foreground">
              Current worker assignments and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-8">
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Assembly Department</p>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Finishing Department</p>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Material Resources</p>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Quality Control</p>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
