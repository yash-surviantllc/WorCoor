"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, CheckCircle, XCircle, Clock, FileText, MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/simple-dropdown"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample approval requests data
const initialRequests = [
  {
    id: "REQ-2023-001",
    type: "Production Order",
    title: "Office Furniture Set - PO-2023-001",
    requestedBy: "John Smith",
    requestedOn: "2023-11-01",
    status: "Pending",
    priority: "High",
    description: "Approval needed for production order of office furniture set for ABC Corporation.",
    relatedId: "PO-2023-001",
    unit: "Assembly Unit A",
  },
  {
    id: "REQ-2023-002",
    type: "Material Requisition",
    title: "Wood Panels for Bookshelves",
    requestedBy: "Emily Johnson",
    requestedOn: "2023-11-05",
    status: "Approved",
    priority: "Medium",
    description: "Request for additional wood panels for bookshelf production.",
    relatedId: "MR-2023-015",
    unit: "Woodworking Unit",
  },
  {
    id: "REQ-2023-003",
    type: "Schedule Change",
    title: "Delay Filing Cabinet Production",
    requestedBy: "Michael Brown",
    requestedOn: "2023-11-10",
    status: "Rejected",
    priority: "Low",
    description: "Request to delay filing cabinet production due to material shortage.",
    relatedId: "PO-2023-003",
    unit: "Assembly Unit B",
  },
  {
    id: "REQ-2023-004",
    type: "Resource Allocation",
    title: "Additional Workers for Conference Tables",
    requestedBy: "Sarah Davis",
    requestedOn: "2023-11-15",
    status: "Pending",
    priority: "High",
    description: "Request for additional workers to complete conference table production on time.",
    relatedId: "RA-2023-008",
    unit: "Assembly Unit A",
  },
  {
    id: "REQ-2023-005",
    type: "Quality Exception",
    title: "Standing Desk Material Substitution",
    requestedBy: "Robert Wilson",
    requestedOn: "2023-11-20",
    status: "Pending",
    priority: "Medium",
    description:
      "Request to substitute material for standing desk production due to quality issues with current stock.",
    relatedId: "QE-2023-012",
    unit: "Quality Control Unit",
  },
  {
    id: "REQ-2023-006",
    type: "Production Order",
    title: "Reception Area Furniture - PO-2023-006",
    requestedBy: "Jennifer Taylor",
    requestedOn: "2023-11-25",
    status: "Pending",
    priority: "Medium",
    description: "Approval needed for production order of reception area furniture for Luxury Hotels Group.",
    relatedId: "PO-2023-006",
    unit: "Assembly Unit B",
  },
]

export default function ApprovalsPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [unitFilter, setUnitFilter] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [approvalComment, setApprovalComment] = useState("")
  const [rejectionComment, setRejectionComment] = useState("")

  // Filter requests based on search term, status filter, and type filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || request.status === statusFilter
    const matchesType = typeFilter === "All" || request.type === typeFilter
    const matchesUnit = unitFilter === "All" || request.unit === unitFilter
    return matchesSearch && matchesStatus && matchesType && matchesUnit
  })

  // Handle approving a request
  const handleApproveRequest = () => {
    if (!selectedRequest) return

    const updatedRequests = requests.map((request) =>
      request.id === selectedRequest.id ? { ...request, status: "Approved" } : request,
    )
    setRequests(updatedRequests)
    setIsApproveDialogOpen(false)
    setApprovalComment("")
  }

  // Handle rejecting a request
  const handleRejectRequest = () => {
    if (!selectedRequest) return

    const updatedRequests = requests.map((request) =>
      request.id === selectedRequest.id ? { ...request, status: "Rejected" } : request,
    )
    setRequests(updatedRequests)
    setIsRejectDialogOpen(false)
    setRejectionComment("")
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
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
      <PageHeader title="Request Approvals" description="Review and approve production requests" />

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.filter((req) => req.status === "Pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.filter((req) => req.status === "Approved").length}</div>
            <p className="text-xs text-muted-foreground">Processed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.filter((req) => req.status === "Rejected").length}</div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>Review and manage approval requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
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
                    <SelectTrigger id="status-filter" className="w-[140px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="type-filter" className="whitespace-nowrap">
                    Type:
                  </Label>
                  <Select onValueChange={(value) => setTypeFilter(value)} defaultValue="All">
                    <SelectTrigger id="type-filter" className="w-[180px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Production Order">Production Order</SelectItem>
                      <SelectItem value="Material Requisition">Material Requisition</SelectItem>
                      <SelectItem value="Schedule Change">Schedule Change</SelectItem>
                      <SelectItem value="Resource Allocation">Resource Allocation</SelectItem>
                      <SelectItem value="Quality Exception">Quality Exception</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="unit-filter" className="whitespace-nowrap">
                    Unit:
                  </Label>
                  <Select onValueChange={(value) => setUnitFilter(value)} defaultValue="All">
                    <SelectTrigger id="unit-filter" className="w-[180px]">
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Units</SelectItem>
                      <SelectItem value="Assembly Unit A">Assembly Unit A</SelectItem>
                      <SelectItem value="Assembly Unit B">Assembly Unit B</SelectItem>
                      <SelectItem value="Woodworking Unit">Woodworking Unit</SelectItem>
                      <SelectItem value="Quality Control Unit">Quality Control Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Requested On</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            onDoubleClick={() => {
                              setSelectedRequest(request)
                              setIsDetailsDialogOpen(true)
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              // Add context menu functionality here
                              alert(`Right-clicked on ${request.id}`)
                            }}
                          >
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{request.type}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={request.title}>
                                {request.title}
                              </div>
                            </TableCell>
                            <TableCell>{request.requestedBy}</TableCell>
                            <TableCell>{request.unit}</TableCell>
                            <TableCell>{request.requestedOn}</TableCell>
                            <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
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
                                      setSelectedRequest(request)
                                      setIsDetailsDialogOpen(true)
                                    }}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {request.status === "Pending" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedRequest(request)
                                          setIsApproveDialogOpen(true)
                                        }}
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedRequest(request)
                                          setIsRejectDialogOpen(true)
                                        }}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                {/* Similar table but filtered for pending requests */}
              </TabsContent>

              <TabsContent value="approved" className="mt-4">
                {/* Similar table but filtered for approved requests */}
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                {/* Similar table but filtered for rejected requests */}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View details for request {selectedRequest?.id}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Request ID</Label>
                  <p className="font-medium">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedRequest.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedRequest.type}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Related ID</Label>
                  <p className="font-medium">{selectedRequest.relatedId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Requested By</Label>
                  <p className="font-medium">{selectedRequest.requestedBy}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Requested On</Label>
                  <p className="font-medium">{selectedRequest.requestedOn}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Unit</Label>
                  <p className="font-medium">{selectedRequest.unit}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm">{selectedRequest.description}</p>
              </div>

              {selectedRequest.status === "Pending" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      setIsRejectDialogOpen(true)
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      setIsApproveDialogOpen(true)
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Request Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              You are about to approve request {selectedRequest?.id}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment">Comment (Optional)</Label>
              <Textarea
                id="approval-comment"
                placeholder="Add any comments or notes about this approval"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveRequest}>Approve Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              You are about to reject request {selectedRequest?.id}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for Rejection*</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a reason for rejecting this request"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectRequest} disabled={!rejectionComment.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
