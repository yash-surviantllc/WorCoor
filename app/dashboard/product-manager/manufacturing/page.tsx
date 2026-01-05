"use client"

import { useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Settings,
  X,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/simple-dropdown"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PageHeader } from "@/components/dashboard/page-header"

// Sample manufacturing steps data
const initialSteps: ManufacturingStep[] = [
  // Office Desk - Adjustable
  {
    id: 1,
    name: "Cut Wood Panels",
    product: "Office Desk - Adjustable",
    stepNumber: 1,
    requiredSkill: "Woodworking",
    duration: "2 hours",
    dependencies: [],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  {
    id: 2,
    name: "Assemble Frame",
    product: "Office Desk - Adjustable",
    stepNumber: 2,
    requiredSkill: "Assembly",
    duration: "1.5 hours",
    dependencies: ["Cut Wood Panels"],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  {
    id: 3,
    name: "Install Adjustment Mechanism",
    product: "Office Desk - Adjustable",
    stepNumber: 3,
    requiredSkill: "Mechanical",
    duration: "1 hour",
    dependencies: ["Assemble Frame"],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  {
    id: 4,
    name: "Sand Surfaces",
    product: "Office Desk - Adjustable",
    stepNumber: 4,
    requiredSkill: "Finishing",
    duration: "45 minutes",
    dependencies: ["Assemble Frame"],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  {
    id: 5,
    name: "Apply Finish",
    product: "Office Desk - Adjustable",
    stepNumber: 5,
    requiredSkill: "Finishing",
    duration: "30 minutes",
    dependencies: ["Sand Surfaces"],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  {
    id: 6,
    name: "Quality Check",
    product: "Office Desk - Adjustable",
    stepNumber: 6,
    requiredSkill: "Quality Control",
    duration: "20 minutes",
    dependencies: ["Apply Finish", "Install Adjustment Mechanism"],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  {
    id: 7,
    name: "Packaging",
    product: "Office Desk - Adjustable",
    stepNumber: 7,
    requiredSkill: "Packaging",
    duration: "15 minutes",
    dependencies: ["Quality Check"],
    numberOfSteps: 7,
    createdBy: "John Doe",
    createdOn: "2023-05-15",
  },
  
  // Office Chair - Standard
  {
    id: 8,
    name: "Cut Fabric",
    product: "Office Chair - Standard",
    stepNumber: 1,
    requiredSkill: "Upholstery",
    duration: "30 minutes",
    dependencies: [],
    numberOfSteps: 4,
    createdBy: "Jane Smith",
    createdOn: "2023-06-10",
  },
  {
    id: 9,
    name: "Assemble Chair Base",
    product: "Office Chair - Standard",
    stepNumber: 2,
    requiredSkill: "Assembly",
    duration: "45 minutes",
    dependencies: [],
    numberOfSteps: 4,
    createdBy: "Jane Smith",
    createdOn: "2023-06-10",
  },
  {
    id: 10,
    name: "Upholster Seat and Back",
    product: "Office Chair - Standard",
    stepNumber: 3,
    requiredSkill: "Upholstery",
    duration: "1 hour",
    dependencies: ["Cut Fabric"],
    numberOfSteps: 4,
    createdBy: "Jane Smith",
    createdOn: "2023-06-10",
  },
  {
    id: 11,
    name: "Final Assembly and Testing",
    product: "Office Chair - Standard",
    stepNumber: 4,
    requiredSkill: "Assembly",
    duration: "30 minutes",
    dependencies: ["Assemble Chair Base", "Upholster Seat and Back"],
    numberOfSteps: 4,
    createdBy: "Jane Smith",
    createdOn: "2023-06-10",
  },
  
  // Conference Table - 8 Person
  {
    id: 12,
    name: "Prepare Table Top Materials",
    product: "Conference Table - 8 Person",
    stepNumber: 1,
    requiredSkill: "Woodworking",
    duration: "3 hours",
    dependencies: [],
    numberOfSteps: 5,
    createdBy: "Mike Johnson",
    createdOn: "2023-07-05",
  },
  {
    id: 13,
    name: "Build Table Base",
    product: "Conference Table - 8 Person",
    stepNumber: 2,
    requiredSkill: "Carpentry",
    duration: "4 hours",
    dependencies: [],
    numberOfSteps: 5,
    createdBy: "Mike Johnson",
    createdOn: "2023-07-05",
  },
  {
    id: 14,
    name: "Assemble Table Structure",
    product: "Conference Table - 8 Person",
    stepNumber: 3,
    requiredSkill: "Assembly",
    duration: "2.5 hours",
    dependencies: ["Prepare Table Top Materials", "Build Table Base"],
    numberOfSteps: 5,
    createdBy: "Mike Johnson",
    createdOn: "2023-07-05",
  },
  {
    id: 15,
    name: "Apply Finish and Polish",
    product: "Conference Table - 8 Person",
    stepNumber: 4,
    requiredSkill: "Finishing",
    duration: "3 hours",
    dependencies: ["Assemble Table Structure"],
    numberOfSteps: 5,
    createdBy: "Mike Johnson",
    createdOn: "2023-07-05",
  },
  {
    id: 16,
    name: "Install Wire Management System",
    product: "Conference Table - 8 Person",
    stepNumber: 5,
    requiredSkill: "Electrical",
    duration: "1.5 hours",
    dependencies: ["Assemble Table Structure"],
    numberOfSteps: 5,
    createdBy: "Mike Johnson",
    createdOn: "2023-07-05",
  },
  
  // Bookshelf - 5 Shelf
  {
    id: 17,
    name: "Cut Shelf Panels",
    product: "Bookshelf - 5 Shelf",
    stepNumber: 1,
    requiredSkill: "Woodworking",
    duration: "1.5 hours",
    dependencies: [],
    numberOfSteps: 4,
    createdBy: "Sarah Williams",
    createdOn: "2023-08-12",
  },
  {
    id: 18,
    name: "Prepare Side Panels",
    product: "Bookshelf - 5 Shelf",
    stepNumber: 2,
    requiredSkill: "Woodworking",
    duration: "1 hour",
    dependencies: [],
    numberOfSteps: 4,
    createdBy: "Sarah Williams",
    createdOn: "2023-08-12",
  },
  {
    id: 19,
    name: "Assemble Bookshelf Structure",
    product: "Bookshelf - 5 Shelf",
    stepNumber: 3,
    requiredSkill: "Assembly",
    duration: "2 hours",
    dependencies: ["Cut Shelf Panels", "Prepare Side Panels"],
    numberOfSteps: 4,
    createdBy: "Sarah Williams",
    createdOn: "2023-08-12",
  },
  {
    id: 20,
    name: "Sand and Finish",
    product: "Bookshelf - 5 Shelf",
    stepNumber: 4,
    requiredSkill: "Finishing",
    duration: "1.5 hours",
    dependencies: ["Assemble Bookshelf Structure"],
    numberOfSteps: 4,
    createdBy: "Sarah Williams",
    createdOn: "2023-08-12",
  },
  
  // Desk Lamp - LED
  {
    id: 21,
    name: "Assemble Base Components",
    product: "Desk Lamp - LED",
    stepNumber: 1,
    requiredSkill: "Assembly",
    duration: "20 minutes",
    dependencies: [],
    numberOfSteps: 3,
    createdBy: "David Chen",
    createdOn: "2023-09-20",
  },
  {
    id: 22,
    name: "Install LED Lighting Module",
    product: "Desk Lamp - LED",
    stepNumber: 2,
    requiredSkill: "Electrical",
    duration: "25 minutes",
    dependencies: ["Assemble Base Components"],
    numberOfSteps: 3,
    createdBy: "David Chen",
    createdOn: "2023-09-20",
  },
  {
    id: 23,
    name: "Test Functionality and Package",
    product: "Desk Lamp - LED",
    stepNumber: 3,
    requiredSkill: "Quality Control",
    duration: "15 minutes",
    dependencies: ["Install LED Lighting Module"],
    numberOfSteps: 3,
    createdBy: "David Chen",
    createdOn: "2023-09-20",
  }
]

// Sample products
const products = [
  { label: "Office Desk - Adjustable", value: "Office Desk - Adjustable" },
  { label: "Office Chair - Standard", value: "Office Chair - Standard" },
  { label: "Filing Cabinet - 3 Drawer", value: "Filing Cabinet - 3 Drawer" },
  { label: "Bookshelf - 5 Shelf", value: "Bookshelf - 5 Shelf" },
  { label: "Conference Table - 8 Person", value: "Conference Table - 8 Person" },
]

// Sample skills
const skills = [
  { label: "Woodworking", value: "Woodworking" },
  { label: "Metalworking", value: "Metalworking" },
  { label: "Assembly", value: "Assembly" },
  { label: "Finishing", value: "Finishing" },
  { label: "Quality Control", value: "Quality Control" },
  { label: "Packaging", value: "Packaging" },
  { label: "Electrical", value: "Electrical" },
  { label: "Upholstery", value: "Upholstery" },
  { label: "Painting", value: "Painting" },
  { label: "Mechanical", value: "Mechanical" },
]

// Define the ManufacturingStep interface for type consistency
interface ManufacturingStep {
  id: number;
  name: string;
  product: string;
  stepNumber: number;  // Added stepNumber field
  requiredSkill: string;
  duration: string;
  dependencies: string[];
  numberOfSteps: number;
  createdBy: string;
  createdOn: string;
}

// Form schema for adding/editing a step
const stepFormSchema = z.object({
  name: z.string().min(2, {
    message: "Step name must be at least 2 characters.",
  }),
  product: z.string({
    required_error: "Please select a product.",
  }),
  stepNumber: z.number().min(1, {
    message: "Step number must be at least 1.",
  }),
  requiredSkill: z.string({
    required_error: "Please select a required skill.",
  }),
  duration: z.string().min(1, {
    message: "Duration is required.",
  }),
  dependencies: z.array(z.string()).optional(),
  numberOfSteps: z.number().optional(),
  createdBy: z.string().optional(),
  createdOn: z.string().optional(),
})

type StepFormValues = z.infer<typeof stepFormSchema>

// Helper function to count steps for a product
const getNumberOfStepsByProduct = (productName: string) => {
  const productSteps = initialSteps.filter(step => step.product === productName);
  return productSteps.length;
}

export default function ManufacturingStepsPage() {
  const [steps, setSteps] = useState(initialSteps)
  const [searchTerm, setSearchTerm] = useState("")
  const [productFilter, setProductFilter] = useState("All")
  const [skillFilter, setSkillFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingStep, setEditingStep] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  // State for tracking multiple steps being added
  const [addedSteps, setAddedSteps] = useState<Array<ManufacturingStep>>([])

  const itemsPerPage = 5

  // Initialize form
  const form = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      name: "",
      product: "",
      stepNumber: 1,
      requiredSkill: "",
      duration: "",
      dependencies: [],
      numberOfSteps: 0,
      createdBy: "Current User",
      createdOn: new Date().toISOString().split('T')[0],
    },
  })

  // Get unique products from steps
  const uniqueProducts = Array.from(new Set(steps.map(step => step.product)))
    .map(product => {
      const productSteps = steps.filter(step => step.product === product)
      // Get the latest created step for this product
      const latestStep = productSteps.reduce((latest, current) => {
        const latestDate = new Date(latest.createdOn)
        const currentDate = new Date(current.createdOn)
        return currentDate > latestDate ? current : latest
      }, productSteps[0])
      
      return {
        product,
        numberOfSteps: productSteps.length,
        createdBy: latestStep.createdBy,
        createdOn: latestStep.createdOn,
        // Keep a reference to a sample step for editing
        sampleStep: productSteps[0]
      }
    })
    
  // Filter products based on search term and product filter
  const filteredProducts = uniqueProducts.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProduct = productFilter === "All" || item.product === productFilter
    return matchesSearch && matchesProduct
  })

  // Paginate products
  const indexOfLastProduct = currentPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get available steps for dependencies (steps for the same product)
  const getAvailableDependencies = (productName: string, currentStepId?: number) => {
    if (!productName) return []

    return steps
      .filter((step) => step.product === productName && (currentStepId ? step.id !== currentStepId : true))
      .map((step) => ({
        label: step.name,
        value: step.name,
      }))
  }

  // Get all unique step names from the manufacturing steps table
  const getUniqueStepNames = () => {
    const uniqueNames = Array.from(new Set(steps.map(step => step.name)))
    return uniqueNames.map(name => ({
      label: name,
      value: name,
    }))
  }

  // Function to add a step to the addedSteps array without closing the dialog
  const saveStep = (data: z.infer<typeof stepFormSchema>) => {
    const newId = steps.length > 0 ? Math.max(...steps.map((step) => step.id)) + 1 : 1
    
    const newStep: ManufacturingStep = {
      id: newId + addedSteps.length, // Ensure unique ID
      name: data.name,
      product: data.product,
      stepNumber: data.stepNumber,
      requiredSkill: data.requiredSkill,
      duration: data.duration,
      dependencies: data.dependencies || [],
      numberOfSteps: data.numberOfSteps || getNumberOfStepsByProduct(data.product),
      createdBy: "Current User",
      createdOn: new Date().toISOString().split('T')[0],
    }
    
    setAddedSteps([...addedSteps, newStep])
    // Reset form fields but keep product selection
    const product = data.product
    form.reset({
      product,
      name: '',
      stepNumber: addedSteps.filter(s => s.product === product).length + 1,
      requiredSkill: '',
      duration: '',
      dependencies: [],
    })
  }
  
  // Function to submit all added steps
  const handleAddStep = () => {
    if (addedSteps.length === 0) return
    
    setSteps([...steps, ...addedSteps])
    setAddedSteps([])
    setIsAddDialogOpen(false)
  }

  // Handle editing a step
  const handleEditStep = (data: StepFormValues) => {
    if (!editingStep) return

    setSteps(
      steps.map((step) =>
        step.id === editingStep.id
          ? {
              ...step,
              name: data.name,
              product: data.product,
              stepNumber: data.stepNumber,
              requiredSkill: data.requiredSkill,
              duration: data.duration,
              dependencies: data.dependencies || [],
              numberOfSteps: data.numberOfSteps || getNumberOfStepsByProduct(data.product),
              createdBy: data.createdBy || step.createdBy || "Current User",
              createdOn: data.createdOn || step.createdOn || new Date().toISOString().split('T')[0],
            }
          : step,
      ),
    )
    setIsEditDialogOpen(false)
  }

  // Handle deleting a step
  const handleDeleteStep = () => {
    if (!editingStep) return

    // Remove the step
    setSteps(steps.filter((step) => step.id !== editingStep.id))

    // Also remove this step from dependencies
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        dependencies: step.dependencies.filter((dep) => dep !== editingStep.name),
      })),
    )

    setIsDeleteDialogOpen(false)
  }

  // Open edit dialog and set form values
  const openEditDialog = (step: any) => {
    setEditingStep(step)
    form.reset({
      name: step.name,
      product: step.product,
      requiredSkill: step.requiredSkill,
      duration: step.duration,
      dependencies: step.dependencies,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <PageHeader
          title="Manufacturing Steps"
          description="Manage manufacturing steps for all products"
          icon={Settings}
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-black/90" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manufacturing Step</DialogTitle>
              <DialogDescription>Add a new manufacturing step for a product.</DialogDescription>
            </DialogHeader>
            <div className="border-4 border-blue-500 p-4 rounded-md">
              <Form {...form}>
                <form className="space-y-4">
                   {/* Step 1: Select Product First */}
                   <div className="mb-6">
                     <FormField
                       control={form.control}
                       name="product"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Step 1: Select Product<span className="text-red-500">*</span></FormLabel>
                           <Select 
                             onValueChange={(value) => {
                               field.onChange(value);
                               // Reset step-related fields when product changes
                               form.setValue("name", "");
                               form.setValue("dependencies", []);
                               form.setValue("stepNumber", 1);
                             }} 
                             defaultValue={field.value}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Select a product" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {products.map((product) => (
                                 <SelectItem key={product.value} value={product.value}>
                                   {product.label}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                  
                   {/* Step 2: Configure Step Details - Only shown if product is selected */}
                   {form.watch("product") && (
                     <>
                       <div className="mb-4">
                         <h4 className="text-md font-medium mb-2">Step 2: Configure Step Details</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Step Name */}
                         <div className="grid gap-2">
                           <FormField
                             control={form.control}
                             name="name"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Step Name<span className="text-red-500">*</span></FormLabel>
                                 <FormControl>
                                   <Input placeholder="Enter step name" {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>

                         {/* Step Number */}
                         <div className="grid gap-2">
                           <FormField
                             control={form.control}
                             name="stepNumber"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Step Number<span className="text-red-500">*</span></FormLabel>
                                 <FormControl>
                                   <Input 
                                     type="number" 
                                     min="1"
                                     placeholder="Enter step number" 
                                     {...field}
                                     value={field.value}
                                     onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                   />
                                 </FormControl>
                                 <FormDescription>
                                   Order of this step in the manufacturing process
                                 </FormDescription>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>

                         {/* Required Skill */}
                         <div className="grid gap-2">
                           <FormField
                             control={form.control}
                             name="requiredSkill"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Required Skill<span className="text-red-500">*</span></FormLabel>
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
                         </div>

                         {/* Duration */}
                         <div className="grid gap-2">
                           <FormField
                             control={form.control}
                             name="duration"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Duration<span className="text-red-500">*</span></FormLabel>
                                 <FormControl>
                                   <Input placeholder="e.g., 2 hours" {...field} />
                                 </FormControl>
                                 <FormDescription>
                                   Specify the time required for this step (e.g., 30 minutes, 2 hours).
                                 </FormDescription>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>

                         {/* Dependencies */}
                         <div className="grid gap-2 col-span-2">
                           <FormField
                             control={form.control}
                             name="dependencies"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Dependent Steps</FormLabel>
                                 <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                                   {getAvailableDependencies(form.watch("product")).length > 0 ? (
                                     getAvailableDependencies(form.watch("product")).map((dependency) => (
                                       <div key={dependency.value} className="flex items-center">
                                         <input
                                           type="checkbox"
                                           id={`dep-${dependency.value}`}
                                           className="mr-1"
                                           checked={field.value?.includes(dependency.value)}
                                           onChange={(e) => {
                                             const current = field.value || []
                                             const updated = e.target.checked
                                               ? [...current, dependency.value]
                                               : current.filter(v => v !== dependency.value)
                                             form.setValue("dependencies", updated, { shouldValidate: true })
                                           }}
                                         />
                                         <Label htmlFor={`dep-${dependency.value}`} className="text-sm">
                                           {dependency.label}
                                         </Label>
                                       </div>
                                     ))
                                   ) : (
                                     <span className="text-muted-foreground text-sm">No dependent steps available for this product</span>
                                   )}
                                 </div>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>
                       </div>
                     </>
                   )}

                   {/* Hidden fields that are automatically calculated */}
                   <div className="hidden">
                     <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="numberOfSteps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Steps</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Number of steps" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Created By */}
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="createdBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Created By</FormLabel>
                            <FormControl>
                              <Input placeholder="Created by" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Created On */}
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="createdOn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Created On</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Display saved steps */}
                  {addedSteps.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-medium text-lg mb-2">Saved Steps</h3>
                      <div className="border rounded-md p-4">
                        <div className="space-y-2">
                          {addedSteps.map((step, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                              <div>
                                <p className="font-medium">{step.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Product: {step.product} | Step: {step.stepNumber} | Skill: {step.requiredSkill}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddedSteps(addedSteps.filter((_, i) => i !== index))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      onClick={() => {
                        const data = form.getValues();
                        // Only save if required fields are filled
                        if (data.product && data.name && data.stepNumber && data.requiredSkill && data.duration) {
                          saveStep(data);
                        } else {
                          // Trigger validation
                          form.trigger();
                        }
                      }}
                    >
                      Save Step
                    </Button>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddDialogOpen(false);
                      setAddedSteps([]);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      className="bg-black text-white hover:bg-black/90"
                      onClick={handleAddStep}
                      disabled={addedSteps.length === 0}
                    >
                      Add All Steps
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Steps</CardTitle>
          <CardDescription>Manage manufacturing steps for all products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search steps..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="product-filter" className="whitespace-nowrap">
                    Product:
                  </Label>
                  <Select onValueChange={(value) => setProductFilter(value)} defaultValue="All">
                    <SelectTrigger id="product-filter" className="w-[180px]">
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Products</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.value} value={product.value}>
                          {product.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="skill-filter" className="whitespace-nowrap">
                    Skill:
                  </Label>
                  <Select onValueChange={(value) => setSkillFilter(value)} defaultValue="All">
                    <SelectTrigger id="skill-filter" className="w-[180px]">
                      <SelectValue placeholder="All Skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Skills</SelectItem>
                      {skills.map((skill) => (
                        <SelectItem key={skill.value} value={skill.value}>
                          {skill.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Number of Steps</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((item) => (
                      <TableRow 
                        key={item.product}
                        onDoubleClick={() => openEditDialog(item.sampleStep)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.numberOfSteps}</TableCell>
                        <TableCell>{item.createdBy}</TableCell>
                        <TableCell>{item.createdOn}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
                  {filteredProducts.length} products
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Manufacturing Step</DialogTitle>
            <DialogDescription>Make changes to the manufacturing step.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditStep)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter step name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.value} value={product.value}>
                            {product.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requiredSkill"
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

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the time required for this step (e.g., 30 minutes, 2 hours).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dependencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependencies</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const current = field.value || []
                        const updated = current.includes(value)
                          ? current.filter((v) => v !== value)
                          : [...current, value]
                        form.setValue("dependencies", updated, { shouldValidate: true })
                      }}
                      disabled={!form.watch("product")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              field.value?.length
                                ? `${field.value.length} step${field.value.length > 1 ? "s" : ""} selected`
                                : "Select dependencies"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {editingStep &&
                        form.watch("product") &&
                        getAvailableDependencies(form.watch("product"), editingStep?.id).length > 0 ? (
                          getAvailableDependencies(form.watch("product"), editingStep?.id).map((dependency) => (
                            <SelectItem key={dependency.value} value={dependency.value}>
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.includes(dependency.value) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {dependency.label}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-product" disabled>
                            Select a product first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select steps that must be completed before this one.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
