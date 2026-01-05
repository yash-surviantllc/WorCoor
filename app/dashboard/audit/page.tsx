"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ClipboardCheck, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"

export default function AuditManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Audit Management"
          description="Manage audit forms, assign audits, and view audit reports."
          icon={ClipboardCheck}
        />

        <Tabs defaultValue="overview" className="space-y-4 pl-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Audits</TabsTrigger>
            <TabsTrigger value="pending">Pending Audits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pl-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Audit Forms</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Audits</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">+12 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Audits</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">-3 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Auditors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-muted-foreground">+1 from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Form Management</CardTitle>
                  <CardDescription>Create, edit, and assign audit forms to groups and users.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <p>Manage your audit forms and assign them to specific groups or users.</p>
                    <Link
                      href="/dashboard/audit/forms"
                      className="inline-flex mt-2 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Go to Form Management
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit Reports</CardTitle>
                  <CardDescription>View and analyze audit results and generate reports.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <p>Generate comprehensive reports and analyze audit data for insights.</p>
                    <Link
                      href="/dashboard/audit/reports"
                      className="inline-flex mt-2 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      View Reports
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4 pl-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
                <CardDescription>View recently completed and in-progress audits.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 rounded-md border p-4">
                    <div>
                      <p className="text-sm font-medium">Inventory Audit</p>
                      <p className="text-xs text-muted-foreground">Completed on May 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm">Opening & Closing Inventory checks</p>
                      <p className="text-xs text-muted-foreground">Conducted by: John Smith</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 rounded-md border p-4">
                    <div>
                      <p className="text-sm font-medium">Factory Compliance</p>
                      <p className="text-xs text-muted-foreground">Started on May 18, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm">Overall Factory Compliance check</p>
                      <p className="text-xs text-muted-foreground">Conducted by: Sarah Johnson</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 rounded-md border p-4">
                    <div>
                      <p className="text-sm font-medium">Quality Audit</p>
                      <p className="text-xs text-muted-foreground">Completed on May 12, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm">Packaging Material In warding QC</p>
                      <p className="text-xs text-muted-foreground">Conducted by: Michael Brown</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 pl-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Audits</CardTitle>
                <CardDescription>View scheduled and pending audits.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 rounded-md border p-4">
                    <div>
                      <p className="text-sm font-medium">Maintenance Audit</p>
                      <p className="text-xs text-muted-foreground">Scheduled for May 25, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm">Machine Maintenance Clearance</p>
                      <p className="text-xs text-muted-foreground">Assigned to: Robert Davis</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 rounded-md border p-4">
                    <div>
                      <p className="text-sm font-medium">Safety Audit</p>
                      <p className="text-xs text-muted-foreground">Scheduled for May 28, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm">Workplace Safety Compliance</p>
                      <p className="text-xs text-muted-foreground">Assigned to: Jennifer Wilson</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 rounded-md border p-4">
                    <div>
                      <p className="text-sm font-medium">Inventory Audit</p>
                      <p className="text-xs text-muted-foreground">Scheduled for June 1, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm">Monthly Inventory Reconciliation</p>
                      <p className="text-xs text-muted-foreground">Assigned to: David Miller</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
