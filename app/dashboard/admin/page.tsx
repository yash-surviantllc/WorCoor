"use client"

import Link from "next/link"
import { ArrowRight, Settings, Shield, Users, Bell, Database, Lock, Activity, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { usersData } from "@/lib/users-data"
import { rolesData } from "@/lib/roles-data"

// Count reference data tables from the context
const referenceDataTables = [
  "Units",
  "Departments",
  "User Types",
  "Skill Sets",
  "IP Addresses",
  "Geo Locations",
  "Task Types",
  "TG Schedules",
  "TG Types",
  "Resource Types",
  "Resources",
  "SKU Categories",
  "SKU Types",
  "Location Tags",
  "SKU Units",
  "SKU Weights",
  "Currencies",
  "Quality Ratings",
  "Asset Categories",
  "Asset States",
]

export default function AdminPage() {
  const totalUsers = usersData.length
  const totalRoles = rolesData.length
  const totalReferenceTables = referenceDataTables.length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Admin Panel" description="Manage your workforce and system settings" icon={UserCog} />

      {/* KPI Summary Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-100">Total Users</p>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
                <p className="text-xs text-blue-200 font-medium">+3 from last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-100">Active Roles</p>
                <p className="text-3xl font-bold text-white">{totalRoles}</p>
                <p className="text-xs text-emerald-200 font-medium">All properly assigned</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-100">Security Score</p>
                <p className="text-3xl font-bold text-white">92%</p>
                <p className="text-xs text-purple-200 font-medium">+5% from last audit</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">System Uptime</p>
                <p className="text-3xl font-bold text-white">99.8%</p>
                <p className="text-xs text-amber-200 font-medium">Last 30 days</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
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
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Role Management</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create and manage system roles. Define permissions and access levels for different user types.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Configured roles:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  {totalRoles} roles
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-12 mx-2 px-6 py-3 border-2 border-white/30 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/admin/roles" className="flex items-center justify-center gap-2">
                  Manage Roles
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
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">User Management</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Add, edit, or remove users from the system. Manage user profiles and assign roles.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Active users:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  {totalUsers} users
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-12 mx-2 px-6 py-3 border-2 border-white/30 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/admin/users" className="flex items-center justify-center gap-2">
                  Manage Users
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
                  <Database className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Reference Data Management</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage system reference data including units, departments, skill sets, and other lookup tables.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Reference tables:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  {totalReferenceTables} tables
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-12 mx-2 px-6 py-3 border-2 border-white/30 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/admin/reference-data" className="flex items-center justify-center gap-2">
                  Manage Reference Data
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
                  <Settings className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">System Settings</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Configure general system settings, security, notifications, database, and more.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Configuration status:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  92% complete
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-12 mx-2 px-6 py-3 border-2 border-white/30 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link href="/dashboard/admin/settings" className="flex items-center justify-center gap-2">
                  Manage Settings
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-sm">
                  <Bell className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-lg">Notifications</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Configure system notifications, email templates, and alert settings for all users.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 pt-3 mt-auto">
                <span className="text-xs text-slate-500 dark:text-slate-300">Notification channels:</span>
                <Badge variant="secondary" className="text-xs font-medium">
                  3 configured
                </Badge>
              </div>
              <Button
                asChild
                className="w-full mt-12 mx-2 px-6 py-3 border-2 border-white/30 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
              >
                <Link
                  href="/dashboard/admin/settings?tab=notifications"
                  className="flex items-center justify-center gap-2"
                >
                  Configure Notifications
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
            <CardTitle className="text-foreground text-lg">Recent System Activities</CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest activities in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-medium text-foreground">User Role Updated</p>
                  <p className="text-sm text-muted-foreground">John Doe assigned to Manager role</p>
                </div>
                <Badge variant="secondary">2 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-medium text-foreground">System Backup</p>
                  <p className="text-sm text-muted-foreground">Automatic backup completed</p>
                </div>
                <Badge variant="secondary">6 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">New User Registration</p>
                  <p className="text-sm text-muted-foreground">Jane Smith registered as Worker</p>
                </div>
                <Badge variant="secondary">Yesterday</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-soft hover:shadow-medium transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">System Health</CardTitle>
            <CardDescription className="text-muted-foreground">
              Current system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-8">
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">CPU Usage</p>
                  <span className="text-sm text-muted-foreground">32%</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Memory Usage</p>
                  <span className="text-sm text-muted-foreground">58%</span>
                </div>
                <Progress value={58} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Disk Space</p>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Network Traffic</p>
                  <span className="text-sm text-muted-foreground">27%</span>
                </div>
                <Progress value={27} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
