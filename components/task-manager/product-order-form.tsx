"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Sample products data
const products = [
  { label: "Office Chair - Standard", value: "Office Chair - Standard" },
  { label: "Office Desk - Adjustable", value: "Office Desk - Adjustable" },
  { label: "Filing Cabinet - 3 Drawer", value: "Filing Cabinet - 3 Drawer" },
  { label: "Bookshelf - 5 Shelf", value: "Bookshelf - 5 Shelf" },
  { label: "Conference Table - 8 Person", value: "Conference Table - 8 Person" },
  { label: "Executive Chair - Leather", value: "Executive Chair - Leather" },
  { label: "Standing Desk Converter", value: "Standing Desk Converter" },
  { label: "Monitor Stand - Dual", value: "Monitor Stand - Dual" },
  { label: "Keyboard Tray - Adjustable", value: "Keyboard Tray - Adjustable" },
  { label: "Desk Lamp - LED", value: "Desk Lamp - LED" },
]

// Form schema
const formSchema = z.object({
  products: z.array(z.string()).min(1, {
    message: "At least one product is required.",
  }),
  requestedBy: z.string().min(2, {
    message: "Requested by must be at least 2 characters.",
  }),
  priority: z.string({
    required_error: "Please select a priority.",
  }),
})

type ProductOrderFormValues = z.infer<typeof formSchema>

interface ProductOrderFormProps {
  initialData?: ProductOrderFormValues
  onSubmit: (data: ProductOrderFormValues) => void
  onCancel: () => void
}

export function ProductOrderForm({ initialData, onSubmit, onCancel }: ProductOrderFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialData?.products || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default form values
  const defaultValues: ProductOrderFormValues = initialData || {
    products: [],
    requestedBy: "",
    priority: "Medium",
  }

  // Initialize form
  const form = useForm<ProductOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  })

  // Handle form submission
  const onFormSubmit = (data: ProductOrderFormValues) => {
    setIsSubmitting(true)
    try {
      onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product selection
  const handleProductSelect = (product: string) => {
    const isSelected = selectedProducts.includes(product)
    // Create a new array instead of modifying the existing one
    const updated = isSelected ? selectedProducts.filter((p) => p !== product) : [...selectedProducts, product]

    setSelectedProducts(updated)
    // Use the updated value directly rather than referencing state that might not be updated yet
    form.setValue("products", updated, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="products"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}
                    >
                      {field.value?.length
                        ? `${field.value.length} product${field.value.length > 1 ? "s" : ""} selected`
                        : "Select products"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.value}
                            value={product.value}
                            onSelect={() => handleProductSelect(product.value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProducts.includes(product.value) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {product.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>Select one or more products for this production order.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requestedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested By</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormDescription>The name of the person requesting this production order.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Set the priority level for this production order.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
