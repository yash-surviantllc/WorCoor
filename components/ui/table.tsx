import * as React from "react"
import { cn } from "@/lib/utils"

// Define types for our data
export interface TaskType {
  id: string
  name: string
  description: string
  category?: string
}

export interface TaskSkill {
  id: string
  name: string
  description: string
  level?: string
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
  type?: string
}

// Mock data for task types
const taskTypes: TaskType[] = [
  { id: "1", name: "Assembly", description: "Assembling components into finished products" },
  { id: "2", name: "Quality Check", description: "Inspecting products for quality assurance" },
  { id: "3", name: "Packaging", description: "Packaging finished products for shipping" },
  { id: "4", name: "Maintenance", description: "Maintaining equipment and machinery" },
  { id: "5", name: "Inventory", description: "Managing inventory and stock levels" },
]

// Mock data for task skills
const taskSkills: TaskSkill[] = [
  {
    id: "1",
    name: "Precision Assembly",
    description: "Ability to assemble small components with precision",
    level: "Advanced",
  },
  {
    id: "2",
    name: "Quality Inspection",
    description: "Knowledge of quality standards and inspection techniques",
    level: "Intermediate",
  },
  {
    id: "3",
    name: "Machine Operation",
    description: "Operating specialized machinery and equipment",
    level: "Beginner",
  },
  { id: "4", name: "Inventory Management", description: "Managing and tracking inventory", level: "Intermediate" },
  {
    id: "5",
    name: "Technical Documentation",
    description: "Creating and maintaining technical documentation",
    level: "Advanced",
  },
]

// Mock data for units
const units: Unit[] = [
  { id: "1", name: "Piece", abbreviation: "pc", type: "Count" },
  { id: "2", name: "Kilogram", abbreviation: "kg", type: "Weight" },
  { id: "3", name: "Meter", abbreviation: "m", type: "Length" },
  { id: "4", name: "Liter", abbreviation: "L", type: "Volume" },
  { id: "5", name: "Hour", abbreviation: "hr", type: "Time" },
]

// Getter functions for the mock data
export function getAllTaskTypes(): TaskType[] {
  return taskTypes
}

export function getAllTaskSkills(): TaskSkill[] {
  return taskSkills
}

export function getAllUnits(): Unit[] {
  return units
}

// Table components
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft dark:border-slate-700 dark:bg-slate-800/80 scrollbar-visible [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px]  [&::-webkit-scrollbar-track]:bg-slate-100  [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:#94a3b8_#f1f5f9]  dark:[&::-webkit-scrollbar-track]:bg-slate-700  dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 dark:[scrollbar-color:#1e293b_#334155]">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-gray-100 dark:bg-gray-800", className)} {...props} />
  ),
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("bg-slate-900 font-medium text-slate-50 dark:bg-slate-50 dark:text-slate-900", className)}
      {...props}
    />
  ),
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-slate-200 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-blue-900/20",
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-14 px-6 text-left align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0 dark:text-gray-200",
        className,
      )}
      {...props}
    />
  ),
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-6 align-middle [&:has([role=checkbox])]:pr-0 text-slate-600 dark:text-slate-300", className)}
      {...props}
    />
  ),
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => null,
)
TableCaption.displayName = "TableCaption"

// Task Types Table Component
export function taskTypesTable() {
  return (
    <Table>
      <TableCaption>A list of all task types in the system.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {taskTypes.map((type) => (
          <TableRow key={type.id}>
            <TableCell>{type.id}</TableCell>
            <TableCell className="font-medium">{type.name}</TableCell>
            <TableCell>{type.description}</TableCell>
            <TableCell>{type.category || "General"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Task Skills Table Component
export function taskSkillsTable() {
  return (
    <Table>
      <TableCaption>A list of all task skills in the system.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {taskSkills.map((skill) => (
          <TableRow key={skill.id}>
            <TableCell>{skill.id}</TableCell>
            <TableCell className="font-medium">{skill.name}</TableCell>
            <TableCell>{skill.description}</TableCell>
            <TableCell>{skill.level || "Not specified"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Units Table Component
export function unitsTable() {
  return (
    <Table>
      <TableCaption>A list of all units in the system.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Abbreviation</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {units.map((unit) => (
          <TableRow key={unit.id}>
            <TableCell>{unit.id}</TableCell>
            <TableCell className="font-medium">{unit.name}</TableCell>
            <TableCell>{unit.abbreviation}</TableCell>
            <TableCell>{unit.type || "Other"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
