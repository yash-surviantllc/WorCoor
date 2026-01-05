"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const assetTypes = [
  "Pallets",
  "Crates",
  "Forklift Machine",
  "Crane",
  "Packaging Material",
  "RAW Material",
  "Laptop",
  "Tables",
  "Miscellaneous",
]

interface AssetTypeDropdownProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function AssetTypeDropdown({ value, onChange, placeholder = "Select asset type" }: AssetTypeDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {assetTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
