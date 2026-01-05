"use client"

import type React from "react"
import { SelectItem, SelectContent, SelectTrigger, SelectValue, Select } from "@/components/ui/select"
import { ensureNonEmptyValue } from "@/lib/utils"

interface SafeSelectItemProps {
  value: string | null | undefined
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function SafeSelectItem({ value, children, ...props }: SafeSelectItemProps) {
  // Ensure value is never empty
  const safeValue = ensureNonEmptyValue(value) as string

  return (
    <SelectItem value={safeValue} {...props}>
      {children}
    </SelectItem>
  )
}

interface SafeSelectProps {
  value: string | null | undefined
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  defaultValue?: string
  triggerClassName?: string
  disabled?: boolean
  id?: string
}

export function SafeSelect({
  value,
  onValueChange,
  children,
  placeholder = "Select...",
  defaultValue,
  triggerClassName,
  ...props
}: SafeSelectProps) {
  // Convert empty/null values to "unassigned" for internal select state
  const safeValue = ensureNonEmptyValue(value) as string

  // Handle value change and convert "unassigned" back to empty string
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue === "unassigned" ? "" : newValue)
  }

  return (
    <Select
      value={safeValue}
      onValueChange={handleValueChange}
      defaultValue={defaultValue ? (ensureNonEmptyValue(defaultValue) as string) : undefined}
      {...props}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
