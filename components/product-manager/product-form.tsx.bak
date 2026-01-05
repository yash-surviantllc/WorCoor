"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Sample data for categories
const categories = [
  { label: "Furniture", value: "furniture" },
  { label: "Office Supplies", value: "office-supplies" },
  { label: "Electronics", value: "electronics" },
  { label: "Storage", value: "storage" },
  { label: "Lighting", value: "lighting" },
  { label: "Decor", value: "decor" },
]

// Sample data for units
const units = [
  { label: "Single Item", value: "single" },
  { label: "Bulk Pack", value: "bulk" },
  { label: "Set", value: "set" },
  { label: "Kit", value: "kit" },
  { label: "Pair", value: "pair" },
]

// Sample data for skills
const skills = [
  { label: "Woodworking", value: "woodworking" },
  { label: "Metalworking", value: "metalworking" },
  { label: "Assembly", value: "assembly" },
  { label: "Finishing", value: "finishing" },
  { label: "Quality Control", value: "quality-control" },
  { label: "Packaging", value: "packaging" },
  { label: "Electrical", value: "electrical" },
  { label: "Upholstery", value: "upholstery" },
  { label: "Painting", value: "painting" },
  { label: "CNC Operation", value: "cnc-operation" },
]

// Sample data for SKUs
const availableSkus = [
  { label: "WD-FRAME-01", value: "wd-frame-01", description: "Wooden Frame - Oak" },
  { label: "WD-FRAME-02", value: "wd-frame-02", description: "Wooden Frame - Maple" },
  { label: "WD-FRAME-03", value: "wd-frame-03", description: "Wooden Frame - Walnut" },
  { label: "MT-LEG-01", value: "mt-leg-01", description: "Metal Legs - Chrome" },
  { label: "MT-LEG-02", value: "mt-leg-02", description: "Metal Legs - Black" },
  { label: "UPH-SEAT-01", value: "uph-seat-01", description: "Upholstered Seat - Fabric" },
  { label: "UPH-SEAT-02", value: "uph-seat-02", description: "Upholstered Seat - Leather" },
  { label: "HW-SCREWS-01", value: "hw-screws-01", description: "Hardware - Screws Pack" },
  { label: "HW-BOLTS-01", value: "hw-bolts-01", description: "Hardware - Bolts Pack" },
  { label: "PKG-BOX-01", value: "pkg-box-01", description: "Packaging - Standard Box" },
]

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  productId: z.string().min(2, {
    message: "Product ID must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  productUnit: z.string({
    required_error: "Please select a product unit.",
  }),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  weight: z.number().optional(),
  capacity: z.string().optional(),
  description: z.string().optional(),
  customFields: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  skus: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        isPrimary: z.boolean(),
      }),
    )
    .min(1, {
      message: "At least one SKU is required.",
    }),
  steps: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(2),
        requiredSkill: z.string(),
        duration: z.number().min(1),
        timeUnit: z.string(),
        dependencies: z.array(z.string()).optional(),
      }),
    )
    .min(1, {
      message: "At least one manufacturing step is required.",
    }),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  initialData?: ProductFormValues
  onSubmit: (data: ProductFormValues) => void
  onCancel: () => void
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  // At the top of the component, ensure all hooks are called unconditionally
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>(initialData?.customFields || [])

  // Default form values
  const defaultValues: ProductFormValues = initialData || {
    name: "",
    productId: "",
    category: "",
    productUnit: "single",
    dimensions: {
      length: undefined,
      width: undefined,
      height: undefined,
    },
    weight: undefined,
    capacity: "",
    description: "",
    customFields: [],
    skus: [],
    steps: [],
  }

  // Initialize form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
    mode: "onChange",
  })

  // Get form values
  const { control, handleSubmit, formState, watch, setValue } = form
  const { errors } = formState

  // Watch values for dependencies
  const steps = watch("steps")

  // Handle form submission
  const onFormSubmit = (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      // Add custom fields to the form data
      data.customFields = customFields
      onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a new custom field
  const addCustomField = () => {
    setCustomFields([...customFields, { name: "", value: "" }])
  }

  // Update a custom field
  const updateCustomField = (index: number, field: "name" | "value", value: string) => {
    const updatedFields = [...customFields]
    updatedFields[index][field] = value
    setCustomFields(updatedFields)
  }

  // Remove a custom field
  const removeCustomField = (index: number) => {
    const updatedFields = [...customFields]
    updatedFields.splice(index, 1)
    setCustomFields(updatedFields)
  }

  // Add a new SKU
  const addSku = (sku: { value: string; label: string; description?: string }) => {
    const currentSkus = form.getValues("skus")
    const exists = currentSkus.some((s) => s.id === sku.value)

    if (!exists) {
      setValue("skus", [
        ...currentSkus,
        {
          id: sku.value,
          name: sku.label,
          quantity: 1,
          isPrimary: currentSkus.length === 0, // First SKU is primary by default
        },
      ])
    }
  }

  // Remove a SKU
  const removeSku = (id: string) => {
    const currentSkus = form.getValues("skus")
    setValue(
      "skus",
      currentSkus.filter((sku) => sku.id !== id),
    )
  }

  // Update SKU quantity
  const updateSkuQuantity = (id: string, quantity: number) => {
    const currentSkus = form.getValues("skus")
    setValue(
      "skus",
      currentSkus.map((sku) => (sku.id === id ? { ...sku, quantity } : sku)),
    )
  }

  // Toggle SKU primary status
  const toggleSkuPrimary = (id: string) => {
    const currentSkus = form.getValues("skus")
    setValue(
      "skus",
      currentSkus.map((sku) => ({
        ...sku,
        isPrimary: sku.id === id
      })),
    )
  }

  // Add a new manufacturing step
  const addStep = () => {
    const currentSteps = form.getValues("steps")
    setValue("steps", [
      ...currentSteps,
      {
        id: `step-${currentSteps.length + 1}`,
        name: `Step ${currentSteps.length + 1}`,
        requiredSkill: "",
        duration: 1,
        timeUnit: "hours",
        dependencies: [],
      },
    ])
  }

  // Remove a manufacturing step
  const removeStep = (id: string) => {
    const currentSteps = form.getValues("steps")
    setValue(
      "steps",
      currentSteps.filter((step) => step.id !== id),
    )

    // Also remove this step from dependencies
    currentSteps.forEach((step) => {
      if (step.dependencies && step.dependencies.includes(id)) {
        const newDependencies = step.dependencies.filter((dep) => dep !== id)
        setValue(`steps.${currentSteps.indexOf(step)}.dependencies`, newDependencies)
      }
    })
  }

  // Update step dependencies
  const updateStepDependencies = (stepIndex: number, dependencies: string[]) => {
    // Create a copy to avoid direct state mutation
    const newDependencies = [...dependencies]
    setValue(`steps.${stepIndex}.dependencies`, newDependencies, { shouldValidate: true })
  }

  // Get available steps for dependencies (all steps before the current one)
  const getAvailableDependencies = (currentStepId: string) => {
    return steps
      .filter((step) => step.id !== currentStepId)
      .map((step) => ({
        label: step.name,
        value: step.id,
      }))
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="definition">Product Definition</TabsTrigger>
            <TabsTrigger value="skus">Required SKUs</TabsTrigger>

  <FormField
    control={control as any}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Enter product description" className="min-h-[100px]" {...field} />
        </FormControl>
        <FormDescription>A detailed description of the product.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />

  // ... (rest of the code remains the same)

  <TabsContent value="steps" className="space-y-4 pt-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Manufacturing Steps</h3>
      <Button variant="outline" size="sm" className="h-8 gap-1" onClick={addStep}>
        <Plus className="h-3.5 w-3.5" />
        Add Step
      </Button>
    </div>

    // ... (rest of the code remains the same)

    {watch("steps").length > 0 ? (
      watch("steps").map((step, index) => (
        <Card key={`step-${step.id}-${index}`} className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                <FormField
                  control={control as any}
                  name={`steps.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Step Name" {...field} className="h-8 text-base font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control as any}
                name={`steps.${index}.requiredSkill`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skill</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skills.map((skill) => (
                          <SelectItem key={skill.value} value={skill.value}>
                            {skill.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end gap-2">
                <FormField
                  control={control as any}
                  name={`steps.${index}.duration`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control as any}
                  name={`steps.${index}.timeUnit`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel className="sr-only">Time Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={control as any}
              name={`steps.${index}.dependencies`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dependencies</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground",
                          )}
                        >
                          {field.value?.length
                            ? `${field.value.length} step${field.value.length > 1 ? "s" : ""} selected`
                            : "Select dependencies"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search steps..." />
                        <CommandList>
                          <CommandEmpty>No steps found.</CommandEmpty>
                          <CommandGroup>
                            {getAvailableDependencies(step.id).map((dependency) => (
                              <CommandItem
                                key={dependency.value}
                                value={dependency.value}
                                onSelect={() => {
                                  const current = field.value || []
                                  const updated = current.includes(dependency.value)
                                    ? current.filter((value: string) => value !== dependency.value)
                                    : [...current, dependency.value]
                                  updateStepDependencies(index, updated)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.includes(dependency.value) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {dependency.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select steps that must be completed before this one.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))
    ) : (
      <div className="flex items-center justify-center p-4 border rounded-md border-dashed">
        <p className="text-sm text-muted-foreground">
          No manufacturing steps added yet. Click "Add Step" to add one.
        </p>
      </div>
    )}
  </div>

  // ... (rest of the code remains the same)
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={control as any}
                        name={`steps.${index}.dependencies`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dependencies</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value?.length && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value?.length
                                      ? `${field.value.length} step${field.value.length > 1 ? "s" : ""} selected`
                                      : "Select dependencies"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search steps..." />
                                  <CommandList>
                                    <CommandEmpty>No steps found.</CommandEmpty>
                                    <CommandGroup>
                                      {getAvailableDependencies(step.id).map((dependency) => (
                                        <CommandItem
                                          key={dependency.value}
                                          value={dependency.value}
                                          onSelect={() => {
                                            const current = field.value || []
                                            const updated = current.includes(dependency.value)
                                              ? current.filter((value: string) => value !== dependency.value)
                                              : [...current, dependency.value]
                                            updateStepDependencies(index, updated)
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value?.includes(dependency.value) ? "opacity-100" : "opacity-0",
                                            )}
                                          />
                                          {dependency.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>Select steps that must be completed before this one.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex items-center justify-center p-4 border rounded-md border-dashed">
                  <p className="text-sm text-muted-foreground">
                    No manufacturing steps added yet. Click "Add Step" to add one.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setActiveTab("skus")}>
                Back: SKUs
              </Button>
              <Button type="submit">Save Product</Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
