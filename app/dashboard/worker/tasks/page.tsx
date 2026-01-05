"use client"

import { useState } from "react"
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Play,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

// Define task types for different statuses
type BaseTask = {
  id: string;
  product: string;
  step: string;
  quantity: number;
  priority: string;
  estimatedDuration: string;
  assignedDate: string;
};

type PendingTask = BaseTask & {
  status: "Pending";
  startTime: null;
  endTime: null;
};

type InProgressTask = BaseTask & {
  status: "In Progress";
  startTime: string;
  endTime: null;
};

type CompletedTask = BaseTask & {
  status: "Completed";
  startTime: string;
  endTime: string;
};

type Task = PendingTask | InProgressTask | CompletedTask;

// Sample tasks data
const initialTasks: Task[] = [
  {
    id: "TASK-2023-001",
    product: "Office Chair - Standard",
    step: "Upholster Seat and Back",
    quantity: 5,
    status: "Pending",
    startTime: null,
    endTime: null,
    estimatedDuration: "5 hours",
    priority: "High",
    assignedDate: "2023-11-05",
  },
  {
    id: "TASK-2023-002",
    product: "Office Chair - Standard",
    step: "Assemble Chair Base",
    quantity: 5,
    status: "In Progress",
    startTime: "09:30 AM",
    endTime: null,
    estimatedDuration: "3.75 hours",
    priority: "High",
    assignedDate: "2023-11-05",
  },
  {
    id: "TASK-2023-003",
    product: "Office Desk - Adjustable",
    step: "Cut Wood Panels",
    quantity: 3,
    status: "Completed",
    startTime: "08:00 AM",
    endTime: "11:45 AM",
    estimatedDuration: "6 hours",
    priority: "Medium",
    assignedDate: "2023-11-05",
  },
  {
    id: "TASK-2023-004",
    product: "Bookshelf - 5 Shelf",
    step: "Cut Wood Panels",
    quantity: 2,
    status: "Pending",
    startTime: null,
    endTime: null,
    estimatedDuration: "3 hours",
    priority: "Low",
    assignedDate: "2023-11-06",
  },
  {
    id: "TASK-2023-005",
    product: "Filing Cabinet - 3 Drawer",
    step: "Assemble Frame",
    quantity: 1,
    status: "Pending",
    startTime: null,
    endTime: null,
    estimatedDuration: "2 hours",
    priority: "Medium",
    assignedDate: "2023-11-06",
  },
]

export default function WorkerTasksPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("Today")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isRaiseConcernDialogOpen, setIsRaiseConcernDialogOpen] = useState(false)
  const [concernText, setConcernText] = useState("")

  const itemsPerPage = 5

  // Filter tasks based on search term, status filter, and date filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.step.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || task.status === statusFilter
    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Today" && task.assignedDate === "2023-11-05") ||
      (dateFilter === "Tomorrow" && task.assignedDate === "2023-11-06")
    return matchesSearch && matchesStatus && matchesDate
  })

  // Paginate tasks
  const indexOfLastTask = currentPage * itemsPerPage
  const indexOfFirstTask = indexOfLastTask - itemsPerPage
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Handle starting a task
  const handleStartTask = (taskId: string) => {
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.status === "Pending") {
          // Create a properly typed InProgressTask
          const updatedTask: InProgressTask = {
            id: task.id,
            product: task.product,
            step: task.step,
            quantity: task.quantity,
            priority: task.priority,
            estimatedDuration: task.estimatedDuration,
            assignedDate: task.assignedDate,
            status: "In Progress",
            startTime: formattedTime,
            endTime: null
          }
          return updatedTask
        }
        return task
      })
    )

    toast({
      title: "Task started",
      description: `Task ${taskId} has been started at ${formattedTime}.`,
    })
  }

  // Handle completing a task
  const handleCompleteTask = (taskId: string) => {
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.status === "In Progress") {
          // Create a properly typed CompletedTask
          const updatedTask: CompletedTask = {
            id: task.id,
            product: task.product,
            step: task.step,
            quantity: task.quantity,
            priority: task.priority,
            estimatedDuration: task.estimatedDuration,
            assignedDate: task.assignedDate,
            status: "Completed",
            startTime: task.startTime, // Maintain the existing startTime
            endTime: formattedTime
          }
          return updatedTask
        }
        return task
      })
    )

    toast({
      title: "Task completed",
      description: `Task ${taskId} has been completed at ${formattedTime}.`,
    })
  }

  // Handle raising a concern
  const handleRaiseConcern = () => {
    if (!selectedTask || !concernText.trim()) return

    toast({
      title: "Concern raised",
      description: `Your concern for task ${selectedTask.id} has been submitted.`,
    })

    setIsRaiseConcernDialogOpen(false)
    setConcernText("")
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
      case "Medium":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  // Calculate productive hours
  const calculateProductiveHours = () => {
    let totalMinutes = 0

    tasks.forEach((task) => {
      if (task.status === "Completed" && task.startTime && task.endTime) {
        const start = new Date(`2023-11-05 ${task.startTime}`)
        const end = new Date(`2023-11-05 ${task.endTime}`)
        const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
        totalMinutes += diffMinutes
      }
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)

    return `${hours}h ${minutes}m`
  }

  // Calculate tasks completed
  const calculateTasksCompleted = () => {
    return tasks.filter((task) => task.status === "Completed").length
  }

  // Calculate tasks in progress
  const calculateTasksInProgress = () => {
    return tasks.filter((task) => task.status === "In Progress").length
  }

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const completed = calculateTasksCompleted()
    const total = tasks.length
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Tasks</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productive Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateProductiveHours()}</div>
            <p className="text-xs text-muted-foreground">Today&apos;s working time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateTasksCompleted()} / {tasks.length}
            </div>
            <Progress value={calculateCompletionPercentage()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTasksInProgress()}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>View and manage your assigned manufacturing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
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
                    <SelectTrigger id="status-filter" className="w-[150px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="date-filter" className="whitespace-nowrap">
                    Date:
                  </Label>
                  <Select onValueChange={(value) => setDateFilter(value)} defaultValue="Today">
                    <SelectTrigger id="date-filter" className="w-[150px]">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Dates</SelectItem>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="Tomorrow">Tomorrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTasks.length > 0 ? (
                    currentTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.id}</TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={task.product}>
                            {task.product}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={task.step}>
                            {task.step}
                          </div>
                        </TableCell>
                        <TableCell>{task.quantity}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {task.startTime && (
                            <div className="text-xs">
                              <span className="font-medium">Start:</span> {task.startTime}
                            </div>
                          )}
                          {task.endTime && (
                            <div className="text-xs">
                              <span className="font-medium">End:</span> {task.endTime}
                            </div>
                          )}
                          {!task.startTime && !task.endTime && (
                            <span className="text-xs text-muted-foreground">Not started</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {task.status === "Pending" && (
                              <Button variant="outline" size="sm" onClick={() => handleStartTask(task.id)}>
                                <Play className="mr-1 h-3 w-3" />
                                Start
                              </Button>
                            )}
                            {task.status === "In Progress" && (
                              <Button variant="outline" size="sm" onClick={() => handleCompleteTask(task.id)}>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task)
                                setIsRaiseConcernDialogOpen(true)
                              }}
                            >
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Concern
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredTasks.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, filteredTasks.length)} of{" "}
                  {filteredTasks.length} tasks
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
                  <span className="text-sm">
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
      {/* Raise Concern Dialog */}
      <Dialog open={isRaiseConcernDialogOpen} onOpenChange={setIsRaiseConcernDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Concern</DialogTitle>
            <DialogDescription>Describe any issues or concerns you have with this task.</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Task ID</h3>
                  <p className="text-base">{selectedTask.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Product</h3>
                  <p className="text-base">{selectedTask.product}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Step</h3>
                  <p className="text-base">{selectedTask.step}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="text-base">{getStatusBadge(selectedTask.status)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concern-text">Describe your concern</Label>
                <Textarea
                  id="concern-text"
                  placeholder="Describe any issues, problems, or concerns you have with this task..."
                  value={concernText}
                  onChange={(e) => setConcernText(e.target.value)}
                  rows={5}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRaiseConcernDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRaiseConcern} disabled={!concernText.trim()}>
                  Submit Concern
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
