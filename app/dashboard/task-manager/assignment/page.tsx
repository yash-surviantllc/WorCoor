"use client"

import { useState } from "react"
import { Search, Plus, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Sample projects data
const initialProjects = [
  {
    id: "P-001",
    name: "Audits",
    createdBy: "John",
    createdOn: "10/05/2025",
    type: "Repetitive",
    projectType: "Internal",
    taskCount: 10,
    unit: "All",
    status: "Planned",
    department: "Production",
  },
  {
    id: "P-002",
    name: "Order Name",
    createdBy: "John",
    createdOn: "10/05/2025",
    type: "One-time",
    projectType: "External Order",
    taskCount: 20,
    unit: "M1",
    status: "Active",
    department: "Production",
  },
  {
    id: "P-003",
    name: "Name",
    createdBy: "Mathew",
    createdOn: "10/05/2025",
    type: "One-time",
    projectType: "Internal Production",
    taskCount: 12,
    unit: "M2",
    status: "Active",
    department: "Production",
  },
  {
    id: "P-004",
    name: "Maintenance",
    createdBy: "Roy",
    createdOn: "10/05/2025",
    type: "Repetitive",
    projectType: "Internal",
    taskCount: 1,
    unit: "All",
    status: "Planned",
    department: "All",
  },
  {
    id: "P-005",
    name: "Adhoc Task",
    createdBy: "John",
    createdOn: "12/05/2025",
    type: "One-time",
    projectType: "Internal",
    taskCount: 5,
    unit: "M3",
    status: "Completed",
    department: "Quality",
  },
]

// Sample tasks data
const initialTasks = [
  {
    id: 1,
    name: "Audit",
    stepNumber: 1,
    dependentStep: "NA",
    role: "Auditor",
    assignTo: "John",
    scheduleType: "One-Time",
    duration: 60,
  },
  {
    id: 2,
    name: "Production Task",
    stepNumber: 2,
    dependentStep: "1",
    role: "Worker",
    assignTo: "Smith,John",
    scheduleType: "One-Time",
    duration: 180,
  },
  {
    id: 3,
    name: "Compliance Test",
    stepNumber: 2,
    dependentStep: "1",
    role: "Technician",
    assignTo: "Roger",
    scheduleType: "One-Time",
    duration: 60,
  },
]

// Sample tasks repository
const taskRepository = [
  { id: "T-001", name: "Audit of Inventory", type: "Audit", skill: "Auditor" },
  { id: "T-002", name: "Metal Cutting", type: "Cutting", skill: "Sheet Cutting" },
  { id: "T-003", name: "Product Packaging", type: "Packing", skill: "Packaging" },
  { id: "T-004", name: "Compliance Check", type: "Generic", skill: "Auditor" },
  { id: "T-005", name: "Product Quality Check", type: "Quality Check", skill: "Auditor" },
]

// Sample users by role
const usersByRole = {
  Auditor: ["John", "Emily", "Michael"],
  Worker: ["Smith", "John", "Sarah"],
  Technician: ["Roger", "David", "Anna"],
}

export default function TaskAssignmentPage() {
  const [projects, setProjects] = useState(initialProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState({
    name: "",
    stepNumber: "",
    dependentStep: "",
    role: "",
    assignTo: "",
    scheduleType: "One-Time",
    duration: "",
  })
  const [newProject, setNewProject] = useState({
    name: "",
    unit: "",
    department: "",
    scheduleType: "One-Time",
    startDate: new Date(),
  })

  // Filter projects based on search term and status filter
  const filteredProjects = projects
    .filter((project) => {
      const searchMatch = searchTerm.trim() === ""
        ? true
        : project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.id.toLowerCase().includes(searchTerm.toLowerCase())

      const statusMatch = statusFilter === "All" ? true : project.status === statusFilter

      return searchMatch && statusMatch
    })

  // Handle adding a new task to the task list
  const handleAddTask = () => {
    if (!newTask.name || !newTask.stepNumber || !newTask.role) return

    const newTaskObj = {
      id: tasks.length + 1,
      name: newTask.name,
      stepNumber: Number.parseInt(newTask.stepNumber),
      dependentStep: newTask.dependentStep || "NA",
      role: newTask.role,
      assignTo: newTask.assignTo,
      scheduleType: newTask.scheduleType,
      duration: Number.parseInt(newTask.duration) || 60,
    }

    setTasks([...tasks, newTaskObj])
    setNewTask({
      name: "",
      stepNumber: "",
      dependentStep: "",
      role: "",
      assignTo: "",
      scheduleType: "One-Time",
      duration: "",
    })
  }

  // Handle saving the project
  const handleSaveProject = () => {
    if (!newProject.name || !newProject.unit || !newProject.department) return

    const newProjectObj = {
      id: `P-${String(projects.length + 1).padStart(3, "0")}`,
      name: newProject.name,
      createdBy: "Current User",
      createdOn: format(new Date(), "MM/dd/yyyy"),
      type: "One-time",
      projectType: "Internal",
      taskCount: tasks.length,
      unit: newProject.unit,
      status: "Planned",
      department: newProject.department,
    }

    setProjects([...projects, newProjectObj])
    setIsCreateDialogOpen(false)
    setTasks(initialTasks) // Reset tasks for next creation
    setNewProject({
      name: "",
      unit: "",
      department: "",
      scheduleType: "One-Time",
      startDate: new Date(),
    })
  }

  return (
    
    <div className="assignment flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Task Assignment</h1>
        <p className="text-muted-foreground">Project Creation & Assignment</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={(value) => setStatusFilter(value)} defaultValue="All">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Manage projects and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>No# of Task</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Project Status</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id} className="cursor-pointer">
                      <TableCell className="font-medium">{project.id}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.createdBy}</TableCell>
                      <TableCell>{project.createdOn}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.projectType}</TableCell>
                      <TableCell>{project.taskCount}</TableCell>
                      <TableCell>{project.unit}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            project.status === "Active" && "bg-green-100 text-green-800",
                            project.status === "Planned" && "bg-blue-100 text-blue-800",
                            project.status === "Completed" && "bg-gray-100 text-gray-800",
                          )}
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.department}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[825px]">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>Create a new project and assign tasks to it.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="project" className="space-y-4">
            <TabsList>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="project">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="Project Name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="Unit"
                    value={newProject.unit}
                    onChange={(e) => setNewProject({ ...newProject, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Department"
                    value={newProject.department}
                    onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    onValueChange={(value) => setNewProject({ ...newProject, scheduleType: value })}
                    defaultValue="One-Time"
                  >
                    <SelectTrigger className="w-[100%]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-Time">One-Time</SelectItem>
                      <SelectItem value="Repetitive">Repetitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[100%] justify-start text-left font-normal",
                          !newProject.startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newProject.startDate ? format(newProject.startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newProject.startDate || undefined}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            setNewProject({ ...newProject, startDate: date });
                          }
                        }}
                        disabled={(date) => {
                          if (!date) return false;
                          return date < new Date();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tasks">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="name"
                    placeholder="Task Name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stepNumber">Step Number</Label>
                  <Input
                    id="stepNumber"
                    placeholder="Step Number"
                    value={newTask.stepNumber}
                    onChange={(e) => setNewTask({ ...newTask, stepNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dependentStep">Dependent Step</Label>
                  <Input
                    id="dependentStep"
                    placeholder="Dependent Step"
                    value={newTask.dependentStep}
                    onChange={(e) => setNewTask({ ...newTask, dependentStep: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) => setNewTask({ ...newTask, role: value })}
                    defaultValue={newTask.role}
                  >
                    <SelectTrigger className="w-[100%]">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(usersByRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignTo">Assign To</Label>
                  <Select
                    onValueChange={(value) => setNewTask({ ...newTask, assignTo: value })}
                    defaultValue={newTask.assignTo}
                  >
                    <SelectTrigger className="w-[100%]">
                      <SelectValue placeholder="Assign To" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTask.role && (usersByRole as Record<string, string[]>)[newTask.role] ? (
                        (usersByRole as Record<string, string[]>)[newTask.role].map((user: string) => (
                          <SelectItem key={user} value={user}>
                            {user}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Select a role first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    onValueChange={(value) => setNewTask({ ...newTask, scheduleType: value })}
                    defaultValue="One-Time"
                  >
                    <SelectTrigger className="w-[100%]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-Time">One-Time</SelectItem>
                      <SelectItem value="Repetitive">Repetitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Duration"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Button onClick={handleAddTask}>Add Task</Button>
                </div>
              </div>

              {tasks.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task ID</TableHead>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Step #</TableHead>
                        <TableHead>Dependent Step</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Assign To</TableHead>
                        <TableHead>Schedule Type</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.id}</TableCell>
                          <TableCell>{task.name}</TableCell>
                          <TableCell>{task.stepNumber}</TableCell>
                          <TableCell>{task.dependentStep}</TableCell>
                          <TableCell>{task.role}</TableCell>
                          <TableCell>{task.assignTo}</TableCell>
                          <TableCell>{task.scheduleType}</TableCell>
                          <TableCell>{task.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit" onClick={handleSaveProject}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
