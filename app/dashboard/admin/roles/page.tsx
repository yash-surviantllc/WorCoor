"use client"

import type React from "react"
import { cn } from '@/lib/utils';
// import { FloatingInput, FloatingLabel } from '@/components/ui/floating-label-input';
import { useState, useRef, useEffect } from "react"
import { Plus, Search, Edit, Trash, Copy, Eye, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { rolesData } from "@/lib/roles-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Permission types
const permissionTypes = [
  { id: "create", name: "Create" },
  { id: "read", name: "Read" },
  { id: "update", name: "Update" },
  { id: "delete", name: "Delete" },
]

// Context menu position type
type ContextMenuPosition = {
  x: number
  y: number
  visible: boolean
  roleId: number | null
}

// Define the structure of permissions for each module
type PermissionType = "create" | "read" | "update" | "delete";

// Define the exact structure of permissions as used in the rolesData
type RolePermissions = {
  [moduleId: string]: {
    [screenId: string]: {
      [permissionType in PermissionType]?: boolean
    }
  }
}

// Define the role structure
type Role = {
  id: number
  name: string
  description: string
  createdDate: string
  createdBy: string
  updatedDate: string
  updatedBy: string
  permissions: RolePermissions
}

// System modules and screens for permissions - updated to match sidebar exactly
const systemModules = [
  {
    id: "admin",
    name: "Admin Panel",
    screens: [
      { id: "roles", name: "Role Management" },
      { id: "users", name: "User Management" },
      { id: "reference-data", name: "Reference Data Management" },
      { id: "settings", name: "System Settings" },
    ],
  },
    {
    id: "task-management",
    name: "Task Management",
    screens: [
      { id: "alerts", name: "Task Alerts Management" },
      { id: "repository", name: "Task Repository" },
      { id: "assignments", name: "Task Assignment" },
      { id: "dashboards", name: "Task Dashboard" },
      { id: "performance-analytics", name: "Performance Analytics" },
    ],
  },
  {
    id: "inventory-management",
    name: "Inventory Management",
    screens: [
      { id: "skus", name: "SKU Management" },
      { id: "wastage", name: "Wastage Tracking" },
      { id: "procurement", name: "Procurement" },
      { id: "analytics", name: "Inventory Analytics" },
    ],
  },
  {
    id: "asset-management",
    name: "Asset Management",
    screens: [
      { id: "assets", name: "Asset Management" },
      { id: "dashboard", name: "Asset Dashboard" },
    ],
  },
  {
    id: "audit-management",
    name: "Audit Management",
    screens: [
      { id: "forms", name: "Audit Form Management" },
      { id: "reports", name: "Audit Report" },
    ],
  },
]

export default function RoleManagementPage() {
  // Type assertion to ensure rolesData matches our Role type definition
  const [roles, setRoles] = useState<Role[]>(rolesData as Role[])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({
    x: 0,
    y: 0,
    visible: false,
    roleId: null,
  })
  const [permissions, setPermissions] = useState<RolePermissions>({})
  const [editMode, setEditMode] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [roleDescription, setRoleDescription] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null)

  // Refs
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Filter roles based on search term
  const filteredRoles = roles.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle row click for view details
  const handleViewDetails = (role: Role) => {
    setSelectedRole(role)
    setIsDetailsDialogOpen(true)
  }

  // Handle right click on row
  const handleContextMenu = (e: React.MouseEvent, roleId: number) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      roleId,
    })
  }

  // Open edit dialog and populate form
  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setEditMode(true)
    setRoleName(role.name)
    setRoleDescription(role.description)
    setPermissions(role.permissions)
    setIsEditDialogOpen(true)

    // Close context menu if open
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false })
    }
  }

  // Handle adding a new role
  const handleAddRole = () => {
    if (!roleName) return

    const newRole: Role = {
      id: roles.length + 1,
      name: roleName,
      description: roleDescription,
      createdDate: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      createdBy: "Current User", // In a real app, this would be the logged-in user
      updatedDate: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      updatedBy: "Current User",
      permissions,
    }

    setRoles([...roles, newRole])
    setIsAddDialogOpen(false)
    resetForm()
  }

  // Handle updating a role
  const handleUpdateRole = () => {
    if (!selectedRole) return

    const updatedRoles = roles.map((role) => {
      if (role.id === selectedRole.id) {
        return {
          ...role,
          name: roleName,
          description: roleDescription,
          updatedDate: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          updatedBy: "Current User",
          permissions,
        } as Role
      }
      return role
    })

    setRoles(updatedRoles)
    setIsEditDialogOpen(false)
    resetForm()
  }

  // Reset form fields
  const resetForm = () => {
    setRoleName("")
    setRoleDescription("")
    setPermissions({})
    setEditMode(false)
    setSelectedRole(null)
  }

  // Handle permission change
  const handlePermissionChange = (moduleId: string, screenId: string, permissionId: string, checked: boolean) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev }
      if (!newPermissions[moduleId]) {
        newPermissions[moduleId] = {}
      }
      if (!newPermissions[moduleId][screenId]) {
        newPermissions[moduleId][screenId] = {}
      }
      // Type assertion to ensure TypeScript knows this is a valid permission type
      newPermissions[moduleId][screenId][permissionId as PermissionType] = checked
      return newPermissions
    })
  }

  // Handle edit role from context menu
  const handleEditRole = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      openEditDialog(role)
    }
  }

  // Handle delete role - show confirmation dialog
  const handleDeleteRole = (roleId: number) => {
    setRoleToDelete(roleId)
    setIsDeleteDialogOpen(true)
    setContextMenu({ ...contextMenu, visible: false })
  }

  // Confirm delete role
  const confirmDeleteRole = () => {
    if (roleToDelete) {
      setRoles(roles.filter((role) => role.id !== roleToDelete))
      if (isDetailsDialogOpen) {
        setIsDetailsDialogOpen(false)
      }
    }
    setIsDeleteDialogOpen(false)
    setRoleToDelete(null)
  }

  // Handle clone role
  const handleCloneRole = (roleId: number) => {
    const roleToClone = roles.find((r) => r.id === roleId)
    if (roleToClone) {
      const newRole = {
        ...roleToClone,
        id: roles.length + 1,
        name: `${roleToClone.name} (Copy)`,
        createdDate: new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        createdBy: "Current User",
        updatedDate: new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          year: "numeric",
        }),
        updatedBy: "Current User",
      }
      setRoles([...roles, newRole])
    }
    setContextMenu({ ...contextMenu, visible: false })
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ ...contextMenu, visible: false })
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [contextMenu])

  // Reset form when add dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      resetForm()
    }
  }, [isAddDialogOpen])

  return (
     <div className="h-[calc(100vh-3rem)] overflow-hidden">
      <div className="roles h-full flex flex-col gap-2">
        <div className="flex items-center pb-2 sm:pb-4">
          <PageHeader
            title="Role Management"
            description="Create and manage system roles"
            icon={Shield}
          />
          <Button 
            className="border border-primary bg-darkblue text-white hover:bg-darkblue/90 ml-auto"
            onClick={() => setIsAddDialogOpen(true)}>
            <span className="hidden md:block"> New Role</span>
            <Plus className="h-4 w-4 block text-white md:hidden" />
          </Button>
        </div>
        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 bg-transparent sm:bg-white/80 backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="w-full md:w-auto flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search Roles..."
                    className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md">
                <Table>
                  <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                    <TableRow>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Role Name</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Created Date</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <TableRow
                          key={role.id}
                          onContextMenu={(e) => handleContextMenu(e, role.id)}
                          onDoubleClick={() => handleViewDetails(role)}
                          className="cursor-pointer hover:bg-muted transition-colors"
                        >
                          <TableCell className="text-[14px] font-medium">{role.name}</TableCell>
                          <TableCell className="text-[14px] p-4 md:p-6">{role.createdDate}</TableCell>
                          <TableCell className="text-[14px] p-4 md:p-6">{role.createdBy}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No roles found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextMenuRef}
            className="absolute z-50 min-w-[160px] bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl shadow-md"
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          >
            <div>
              <button
                className="w-full text-left px-4 py-3 rounded-xl text-sm  hover:bg-blue-50 flex items-center gap-2"
                onClick={() => {
                  const role = roles.find((r) => r.id === contextMenu.roleId)
                  if (role) handleViewDetails(role)
                }}
              >
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />View Details
              </span>
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl text-sm  hover:bg-blue-50 flex items-center gap-2"
                onClick={() => handleEditRole(contextMenu.roleId!)}
              >
                <span className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />Edit Role
                </span>
              
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl text-sm  hover:bg-blue-50 flex items-center gap-2"
                onClick={() => handleCloneRole(contextMenu.roleId!)}
              >
                <span className="flex items-center">
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Role
                </span>
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-blue-50 flex items-center gap-2"
                onClick={() => handleDeleteRole(contextMenu.roleId!)}
              >
                <span className="flex items-center">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Role
                </span>
              </button>
            </div>
          </div>
        )}


        {/* Role Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl md:max-h-[85dvh] min-h-[85dvh] md:h-[85dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>{selectedRole?.name} - Role Details</DialogTitle>
              <DialogDescription>View role details and permissions</DialogDescription>
            </DialogHeader>

            <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
              {selectedRole && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Role Name</h4>
                      <p className="text-base font-medium">{selectedRole.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Created Date</h4>
                      <p className="text-sm">{selectedRole.createdDate}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                      <p className="text-sm">{selectedRole.createdBy}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Updated Date</h4>
                      <p className="text-sm">{selectedRole.updatedDate}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Updated By</h4>
                      <p className="text-sm">{selectedRole.updatedBy}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg text-center font-medium">Role Access Matrix</h3>

                    {Object.entries(selectedRole.permissions || {}).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(selectedRole.permissions || {}).map(([moduleId, screens]) => {
                          const module = systemModules.find((m) => m.id === moduleId)
                          if (!module) return null

                          return (
                            <div key={moduleId} className="space-y-4 mb-8">
                              {/* <h4 className="font-medium">{module.name}</h4> */}

                              <div className="relative">
                                <h4 className="flex items-center justify-center font-semibold text-gray-800 dark:text-slate-50 text-center gap-4 whitespace-nowrap mb-4">
                                  <span className="block w-20 sm:w-40 h-[2px] bg-gradient-to-r from-slate-100 to-slate-500 dark:from-slate-600 dark:to-slate-200 rounded-sm" />
                                {module.name}
                                  <span className="block w-20 sm:w-40 h-[2px] bg-gradient-to-r from-slate-500 to-slate-100 dark:from-slate-200 dark:to-slate-600 rounded-sm" />
                                </h4>
                              </div>

                              <div className="rounded-md">
                                <Table className="dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]x:w-[4px] overflow-auto">
                                  <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                    <TableRow>
                                      <TableHead className="text-black font-semibold whitespace-nowrap p-4 max-w-[200px] min-w-[200px] w-[200px]">Screen Name</TableHead>
                                      <TableHead className="text-black text-center font-semibold whitespace-nowrap p-4 w-[50px]">Create</TableHead>
                                      <TableHead className="text-black text-center font-semibold whitespace-nowrap p-4 w-[50px]">Read</TableHead>
                                      <TableHead className="text-black text-center font-semibold whitespace-nowrap p-4 w-[50px]">Update</TableHead>
                                      <TableHead className="text-black text-center font-semibold whitespace-nowrap p-4 w-[50px]">Delete</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Object.entries(screens).map(([screenId, perms]) => {
                                      const screen = module.screens.find((s) => s.id === screenId)
                                      if (!screen) return null

                                      // Type assertion to fix 'perms is of type unknown' error
                                      const permObj = perms as { 
                                        create?: boolean, 
                                        read?: boolean, 
                                        update?: boolean, 
                                        delete?: boolean 
                                      }

                                      return (
                                        <TableRow key={screenId}>
                                          <TableCell className="p-4 text-sm [&:has([role=checkbox])]:pr-4 max-w-[200px] min-w-[200px] w-[200px]">{screen.name}</TableCell>
                                          <TableCell className="p-4 text-sm text-center [&:has([role=checkbox])]:pr-4" >{permObj.create ? "✓" : "✗"}</TableCell>
                                          <TableCell className="p-4 text-sm text-center [&:has([role=checkbox])]:pr-4">{permObj.read ? "✓" : "✗"}</TableCell>
                                          <TableCell className="p-4 text-sm text-center [&:has([role=checkbox])]:pr-4">{permObj.update ? "✓" : "✗"}</TableCell>
                                          <TableCell className="p-4 text-sm text-center [&:has([role=checkbox])]:pr-4">{permObj.delete ? "✓" : "✗"}</TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No permissions assigned to this role.</p>
                    )}
                  </div>

                  <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                    <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDetailsDialogOpen(false)
                        openEditDialog(selectedRole)
                      }}
                    >
                      Edit Role
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Role Dialog */}
        <Dialog
          open={isAddDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (isAddDialogOpen) setIsAddDialogOpen(open)
            if (isEditDialogOpen) setIsEditDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogContent className="max-w-3xl md:max-h-[85dvh] min-h-[85dvh] md:h-[85dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>{editMode ? "Edit Role" : "Add New Role"}</DialogTitle>
              <DialogDescription>
                {editMode ? "Update role details and permissions" : "Create a new role in the system"}
              </DialogDescription>
            </DialogHeader>

            {/* <div className="space-y-6 py-2"> */}
              <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium leading-none">Role Name*</Label>
                  <Input
                  className="h-12 rounded-md border border-input"
                    id="name"
                    placeholder="Enter role name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    disabled={editMode} // Disable name field in edit mode as it's the primary key
                  />
                </div>
              
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-medium leading-none">Description</Label>
                  <Textarea
                  className="h-12 rounded-md border border-input"
                    id="description"
                    placeholder="Enter role description"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-0 align-middle text-center">
                  <h3 className="text-lg font-medium">Assign Screen Access</h3>
                  <p className="text-sm text-muted-foreground">Select the permissions for each module and screen</p>
                </div>

                <div className="space-y-6">
                  {systemModules.map((module) => (
                    <div key={module.id} className="space-y-4">
                      <div className="relative">
                        <h4 className="flex items-center justify-center font-semibold text-gray-800 dark:text-slate-50 text-center gap-4 whitespace-nowrap mb-4">
                          <span className="block w-20 sm:w-40 h-[2px] bg-gradient-to-r from-slate-100 to-slate-500 dark:from-slate-600 dark:to-slate-200 rounded-sm" />
                        {module.name}
                          <span className="block w-20 sm:w-40 h-[2px] bg-gradient-to-r from-slate-500 to-slate-100 dark:from-slate-200 dark:to-slate-600 rounded-sm" />
                        </h4>
                      </div>
                      <div className="rounded-md">
                        <div className="shadow-none mb-8">
                        <Table className="shadow-0">
                          <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                            <TableRow>
                              <TableHead className="text-black font-semibold whitespace-nowrap p-4">Screen Name</TableHead>
                              {permissionTypes.map((permission) => (
                                <TableHead className="text-black text-center font-semibold whitespace-nowrap p-4" key={permission.id}>{permission.name}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {module.screens.map((screen) => (
                              <TableRow key={screen.id}>
                                <TableCell className="p-4 text-sm">{screen.name}</TableCell>
                                {permissionTypes.map((permission) => (
                                  <TableCell className="p-4 text-sm text-center [&:has([role=checkbox])]:pr-4" key={permission.id}>
                                    <Checkbox
                                      checked={permissions[module.id]?.[screen.id]?.[permission.id as PermissionType] || false}
                                      onCheckedChange={(checked) =>
                                        handlePermissionChange(module.id, screen.id, permission.id, checked === true)
                                      }
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
              <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isAddDialogOpen) setIsAddDialogOpen(false)
                    if (isEditDialogOpen) setIsEditDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={editMode ? handleUpdateRole : handleAddRole} disabled={!roleName}>
                  {editMode ? "Save" : "Add Role"}
                </Button>
              </DialogFooter>
            {/* </div> */}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="dark:bg-modal max-w-full sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              {/* <DialogDescription>
                Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to
                this role.
              </DialogDescription> */}
            </DialogHeader>
            <div className="text-sm">
              <p>Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to
                this role.</p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline" className="border border-red-300 text-red-500 hover:text-red-500"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setRoleToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRole}>
                Delete Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
