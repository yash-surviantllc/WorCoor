"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/dashboard/page-header"
import { FileText } from "lucide-react"

type AuditForm = {
  id: string
  groupName: string
  formName: string
  description: string
  assignedRole: string
}

// Sample data for the form dropdowns
const sampleAuditGroups = [
  "Inventory Audit",
  "Compliance Audit",
  "Quality Audit",
  "Maintenance Audit",
  "Safety Audit",
  "Environmental Audit",
]

const sampleFormNames = [
  "Inventory Audit Form",
  "Factory Compliance Check Form",
  "Packaging Quality Check",
  "Machine Maintenance Clearance",
  "Safety Inspection Form",
  "Environmental Compliance Form",
  "Quality Control Checklist",
  "Operational Audit Form",
]

const userRoles = [
  "Auditor",
  "Technician",
  "Worker",
  "Manager",
  "Supervisor",
  "Quality Control",
  "Safety Officer",
  "Team Lead",
]

export default function AuditFormManagementPage() {
  const [auditForms, set_AuditForms] = useState<AuditForm[]>([
    {
      id: "Aud-001",
      groupName: "Inventory Audit",
      formName: "Inventory Audit Form",
      description: "Opening & Closing Inventory checks",
      assignedRole: "Technician",
    },
    {
      id: "Aud-002",
      groupName: "Compliance Audit",
      formName: "Factory Compliance Check Form",
      description: "Overall Factory Compliance check",
      assignedRole: "Auditor",
    },
    {
      id: "Aud-003",
      groupName: "Quality Audit",
      formName: "Packaging Quality Check",
      description: "Packaging Material In warding QC",
      assignedRole: "Auditor",
    },
    {
      id: "Aud-004",
      groupName: "Maintenance Audit",
      formName: "Machine Maintenance Clearance",
      description: "Machine Maintenance update",
      assignedRole: "Worker",
    },
  ])

  const [useExistingGroup, setUseExistingGroup] = useState(true)
  const [newFormDialogOpen, setNewFormDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  // State for the new form dialog
  const [selectedFormName, setSelectedFormName] = useState("")

  // State to track selected values for the assign dialog
  const [selectedGroupForAssign, setSelectedGroupForAssign] = useState("")
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState("")
  const [descriptionForAssign, setDescriptionForAssign] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      existingGroupName: "",
      newGroupName: "",
      formName: "",
      description: "",
      assignedRole: "",
    },
  })

  const {
    register: registerAssign,
    handleSubmit: handleSubmitAssign,
    reset: resetAssign,
    formState: { errors: assignErrors },
  } = useForm({
    defaultValues: {
      groupName: "",
      roleName: "",
      description: "",
    },
  })

  const onSubmitNewForm = (data: any) => {
    // Check if we have a group name
    const groupName = useExistingGroup ? data.existingGroupName : data.newGroupName

    if (!groupName) {
      toast({
        title: "Missing Information",
        description: "Please select or enter an Audit Group Name",
        variant: "destructive",
      })
      return
    }

    // Use the selected form name
    const formName = selectedFormName

    // Check if we have a form name
    if (!formName) {
      toast({
        title: "Missing Information",
        description: "Please select an Audit Form Name",
        variant: "destructive",
      })
      return
    }

    const newId = `Aud-${String(auditForms.length + 1).padStart(3, "0")}`

    // Create the new form with all required fields
    const newForm = {
      id: newId,
      groupName: groupName,
      formName: formName,
      description: data.description || "",
      assignedRole: "Unassigned", // Default value until explicitly assigned
    }

    // Add the new form to the state
    set_AuditForms((prevForms) => [...prevForms, newForm])

    toast({
      title: "Form Created",
      description: `New audit form "${formName}" has been created successfully.`,
    })

    // Reset all form state
    reset()
    setSelectedFormName("")
    setNewFormDialogOpen(false)
  }

  // Direct handler for the assign form submission
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!selectedGroupForAssign) {
      toast({
        title: "Missing Information",
        description: "Please select an Audit Group Name",
        variant: "destructive",
      })
      return
    }

    if (!selectedRoleForAssign) {
      toast({
        title: "Missing Information",
        description: "Please select a User Role Name",
        variant: "destructive",
      })
      return
    }

    // Update the assigned role for all forms in the selected group
    const updatedForms = auditForms.map((form) => {
      if (form.groupName === selectedGroupForAssign) {
        return {
          ...form,
          assignedRole: selectedRoleForAssign,
          description: descriptionForAssign ? descriptionForAssign : form.description,
        }
      }
      return form
    })

    // Check if any forms were updated
    const formsUpdated = updatedForms.some(
      (updatedForm, index) => updatedForm.assignedRole !== auditForms[index].assignedRole,
    )

    if (!formsUpdated) {
      toast({
        title: "No Changes",
        description: "No forms were updated. Please check your selection.",
        variant: "default",
      })
      return
    }

    // Update the state with the new forms data
    set_AuditForms(updatedForms)

    // Show success message
    toast({
      title: "Role Assigned",
      description: `${selectedGroupForAssign} has been assigned to ${selectedRoleForAssign} role.`,
    })

    // Reset form and close dialog
    setSelectedGroupForAssign("")
    setSelectedRoleForAssign("")
    setDescriptionForAssign("")
    setAssignDialogOpen(false)
  }

  const auditGroups = [...new Set(auditForms.map((form) => form.groupName))]
  const formNames = [...new Set(auditForms.map((form) => form.formName))]
  const roles = ["Auditor", "Technician", "Worker", "Manager", "Supervisor"]

  return (
    <div className="container mx-auto py-6 pl-4">
      <div className="flex flex-col gap-6">
        <PageHeader title="Audit Form Management" description="" icon={FileText} />

        {/* Add a debug section that can be toggled for development */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 p-4 rounded-md mb-4 hidden">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(auditForms, null, 2)}</pre>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pl-2">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="w-full md:w-64">
              <Label htmlFor="auditGroupName" className="font-medium">
                Audit Group Name
              </Label>
              <Input id="auditGroupName" placeholder="Search by group name" className="mt-2 h-10" />
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="auditForm" className="font-medium">
                Audit Form
              </Label>
              <Select>
                <SelectTrigger id="auditForm" className="mt-2 h-10">
                  <SelectValue placeholder="List of forms" />
                </SelectTrigger>
                <SelectContent>
                  {auditForms.map((form) => (
                    <SelectItem key={form.id} value={form.formName || "unnamed-form"}>
                      {form.formName || "Unnamed Form"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
            <Button onClick={() => setNewFormDialogOpen(true)}>Add New Form and Group</Button>
            <Button onClick={() => setAssignDialogOpen(true)}>Assign Group to User Role</Button>
          </div>
        </div>

        <div className="rounded-md border mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Internal ID</TableHead>
                <TableHead>Audit Group Name</TableHead>
                <TableHead>Audit Form</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assigned to Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.id}</TableCell>
                  <TableCell>{form.groupName}</TableCell>
                  <TableCell>{form.formName}</TableCell>
                  <TableCell>{form.description}</TableCell>
                  <TableCell>{form.assignedRole}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add New Form Dialog */}
      <Dialog open={newFormDialogOpen} onOpenChange={setNewFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Form and Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitNewForm)}>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-y-6 gap-x-4 py-4">
              <Label htmlFor="existingGroupName" className="self-center md:text-right font-medium">
                Audit Group Name*
              </Label>
              <Select
                onValueChange={(value) => {
                  register("existingGroupName").onChange({ target: { value } })
                  setUseExistingGroup(true)
                }}
              >
                <SelectTrigger id="existingGroupName">
                  <SelectValue placeholder="Select existing Group Name" />
                </SelectTrigger>
                <SelectContent>
                  {sampleAuditGroups.map((group) => (
                    <SelectItem key={group} value={group || "unnamed-group"}>
                      {group || "Unnamed Group"}
                    </SelectItem>
                  ))}
                  <SelectItem value="none">Select a group</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-center md:text-right self-center font-medium">Or</div>
              <div className="h-0 hidden md:block"></div>

              <Label htmlFor="newGroupName" className="self-center md:text-right font-medium">
                New Audit Group Name*
              </Label>
              <Input
                id="newGroupName"
                placeholder="Enter new group name"
                {...register("newGroupName")}
                onChange={(e) => {
                  register("newGroupName").onChange(e)
                  if (e.target.value) {
                    setUseExistingGroup(false)
                  }
                }}
              />

              <Label htmlFor="formName" className="self-center md:text-right font-medium">
                Audit Form Name*
              </Label>
              <Select value={selectedFormName} onValueChange={setSelectedFormName}>
                <SelectTrigger id="formNameSelect">
                  <SelectValue placeholder="Select a form name" />
                </SelectTrigger>
                <SelectContent>
                  {sampleFormNames.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="description" className="self-start md:text-right font-medium mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>
            <DialogFooter className="flex justify-center gap-4 mt-4">
              <Button type="submit" className="w-32">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-32"
                onClick={() => {
                  reset()
                  setSelectedFormName("")
                  setNewFormDialogOpen(false)
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Group Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Group to User Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-y-6 gap-x-4 py-4">
              <Label htmlFor="groupNameAssign" className="self-center md:text-right font-medium">
                Audit Group Name*
              </Label>
              <Select value={selectedGroupForAssign} onValueChange={setSelectedGroupForAssign}>
                <SelectTrigger id="groupNameAssign">
                  <SelectValue placeholder="Select existing Group Name" />
                </SelectTrigger>
                <SelectContent>
                  {auditGroups.length > 0 ? (
                    auditGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-groups">No groups available</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Label htmlFor="roleNameAssign" className="self-center md:text-right font-medium">
                User Role Name*
              </Label>
              <Select value={selectedRoleForAssign} onValueChange={setSelectedRoleForAssign}>
                <SelectTrigger id="roleNameAssign">
                  <SelectValue placeholder="Select a user role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="descriptionAssign" className="self-start md:text-right font-medium mt-2">
                Description
              </Label>
              <Textarea
                id="descriptionAssign"
                placeholder="Enter description"
                className="min-h-[100px]"
                value={descriptionForAssign}
                onChange={(e) => setDescriptionForAssign(e.target.value)}
              />
            </div>
            <DialogFooter className="flex justify-center gap-4 mt-4">
              <Button type="submit" className="w-32">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-32"
                onClick={() => {
                  setSelectedGroupForAssign("")
                  setSelectedRoleForAssign("")
                  setDescriptionForAssign("")
                  setAssignDialogOpen(false)
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
