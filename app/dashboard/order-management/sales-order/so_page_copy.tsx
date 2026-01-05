"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Eye, Minus, MoreHorizontal, Pencil, Plus, Search, ShoppingCart, Trash, X } from "lucide-react"
import * as React from "react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"

export default function InventorySoPage() {
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
    const [isBlockQuanlityDialogOpen, setIsBlockQuanlityDialogOpen] = useState(false)
    const [isUnBlockQuanlityDialogOpen, setUnIsBlockQuanlityDialogOpen] = useState(false)
    const [isPickListDialogOpen, setIsPickListDialogOpen] = useState(false)
    const [isViewPickListDialogOpen, setIsViewPickListDialogOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [position, setPosition] = React.useState("bottom")
    const form = useForm()

    function showGeneratePickListDiv() {
    document.getElementById('SoList')?.classList.add('hidden');
    document.getElementById('GeneratePickList')?.classList.remove('hidden');
  }

  function backSoListtDiv() {
    document.getElementById('GeneratePickList')?.classList.add('hidden');
     document.getElementById('GenerateBlockList')?.classList.add('hidden');
    document.getElementById('SoList')?.classList.remove('hidden');
  }
 function showGenerateBlockListDiv() {
    document.getElementById('SoList')?.classList.add('hidden');
    document.getElementById('GenerateBlockList')?.classList.remove('hidden');
  }

    return (
        <div className="h-[calc(100vh-3rem)] overflow-hidden">
            <div id="SoList">
                <div className="flex items-center pb-2 sm:pb-4">
                    <PageHeader
                        title="Sales Order"
                        description="Manage procurement requests for inventory items"
                        icon={ShoppingCart}
                    />
                    <div className="flex items-center ml-auto gap-2">
                        <Button
                            className="border border-primary bg-darkblue text-white hover:bg-darkblue/90"
                        >
                            <span className="hidden md:block"> Add SKU</span>
                            <Plus className="h-4 w-4 block text-white md:hidden" />
                        </Button>
                    </div>
                </div>
                <Table className="table-auto">
                    <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                        <TableRow>
                            <TableHead className="text-black font-semibold whitespace-nowrap">SO Number</TableHead>
                            <TableHead className="text-black font-semibold whitespace-nowrap min-w-[150px]">SO Date</TableHead>
                            <TableHead className="text-black font-semibold whitespace-nowrap min-w-[180px]">Customer Name</TableHead>
                            <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">SKU Count</TableHead>
                            <TableHead className="text-black font-semibold whitespace-nowrap min-w-[150px]">Fulfilment(Blocked)</TableHead>
                            <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">SO Status</TableHead>
                            <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-muted/30">
                            <TableCell className="p-4 md:p-6">AL001</TableCell>
                            <TableCell className="p-4 md:p-6">10/02/2025</TableCell>
                            <TableCell className="p-4 md:p-6">John Smith</TableCell>
                            <TableCell className="p-4 md:p-6">
                                20
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                                <div className="text-xs text-center">33%</div>
                                <Progress value={33} className="w-xl h-2" />
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                                <span className="w-full text-sm text-red-400">In Progress</span>
                                 <span className="w-full text-sm text-orange-400">Ready for Dispatched</span> 
                                <span className="w-full text-sm text-green-600">Dispatched</span>
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                                <Button variant="outline" className="border-amber-400/60 bg-amber-400/40 hover:bg-amber-400/40 text-sm"  onClick={showGenerateBlockListDiv}>Block</Button>
                               <Button variant="outline" className="border-red-300/60 bg-red-200/40 hover:bg-red-200/40  text-sm"  onClick={showGeneratePickListDiv}>Generate Pick List</Button>
                                <Button variant="secondary" className="bg-blue-300/40 hover:bg-blue-400/60 text-blue-800 text-sm font-medium dark:text-blue-50" >Dispatched</Button> 
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            {/* Generate Pick List design */}
              <div id="GeneratePickList" className="hidden h-full relative flex flex-col overflow-hidden">
                <div>
                    <div className="flex items-start justify-start flex-col mb-3 relative">
                        <nav className="flex-1">
                            <Breadcrumb className="text-md">
                                <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                    <Link href="/dashboard">Home</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                    <Link href="/dashboard/inventory/so"  onClick={backSoListtDiv}>Inventory</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Generate Picklist</BreadcrumbPage>
                                </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </nav>
                        {/* <div>
                            <p className="text-lg font-medium mb-1">SKU details</p>
                            <p className="text-sm text-neutral-500 mb-2">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rem fugiat beatae quibusdam inventore voluptate ex, placeat illo ducimus dolor a id excepturi nihil atque laborum nulla eaque incidunt sapiente dolorem!</p>
                        </div> */}
                    </div>
                    {/* Header Card */}
                    <div className="mb-6">
                        {/* <div className="transition-all duration-300 dark:border-slate-700 flex justify-between  dark:text-slate-50 items-center rounded-xl mb-6 border-bottom border-slate-200"> */}
                             <div className="flex-1 space-y-0">
                                <h2 className="text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-50 flex items-center gap-2">
                                Akshay Patel 
                                {/* <Minus className="w-4 h-4"></Minus> */}
                                <span className="text-lg text-blue-700 font-bold rounded px-2 py-1 dark:text-sky-400 tracking-1">
                                [ SO-12457 ]
                                </span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-fit block text-xs font-semibold bg-red-100/40 text-red-400 rounded-sm px-3 py-1 shadow-sm">
                                        In Progress
                                    </span>
                                    <span className="text-sm text-gray-400"> | </span>
                                    <span className="text-xs text-gray-400 font-semibold dark:text-slate-300"> 10 May 24</span>
                                    <span className="text-sm text-gray-400"> | </span>
                                    <span className="text-xs text-gray-400 font-semibold dark:text-slate-50">  Fulfillment: <span>52%</span></span>
                                   
                                      
                                </div>
                             </div>
                        {/* </div> */}
                    </div>
                </div>
                {/* SKU Table */}
                <div className="h-full flex-grow overflow-auto">
                 
                    <Table className="table-auto w-full">
                    <TableHeader className="text-black dark:bg-slate-950">
                        <TableRow>
                        <TableHead className="font-semibold px-4 min-w-[150px]">SKU Code</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[200px]">SKU Name</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">SKU Qty</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">Blocked Qty</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">Assign Picklist</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                        <TableCell className="p-4">FS0324_7498</TableCell>
                        <TableCell className="p-4">Balji wafer 250gm</TableCell>
                        <TableCell className="p-4">200</TableCell>
                        <TableCell className="p-4">0</TableCell>
                        <TableCell className="p-4">Dev Patel</TableCell>
                   
                        <TableCell className="p-4">
                            <Button className="bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-full font-medium text-sm p-2 px-4"  onClick={() => setIsViewPickListDialogOpen(true)}>
                              <Eye className="h-5 w-5 mr-2"></Eye>   View Picklist
                            </Button>
                        </TableCell>
                        </TableRow>
                        <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                        <TableCell className="p-4">FS0324_7498</TableCell>
                        <TableCell className="p-4">Balji wafer 250gm</TableCell>
                        <TableCell className="p-4">200</TableCell>
                        <TableCell className="p-4">0</TableCell>
                            <TableCell className="p-4">Dev Patel</TableCell>
                        <TableCell className="p-4">
                            <Button variant="outline" className="border-slate-100/40 bg-slate-400/40 hover:bg-slate-400/40 font-medium rounded-full text-sm"  onClick={() => setIsPickListDialogOpen(true)}>
                                 Generate Picklist
                            </Button>
                        </TableCell>
                        </TableRow>
                        <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                        <TableCell className="p-4">FS0324_7498</TableCell>
                        <TableCell className="p-4">Balji wafer 250gm</TableCell>
                        <TableCell className="p-4">200</TableCell>
                        <TableCell className="p-4">0</TableCell>
                            <TableCell className="p-4">Dev Patel</TableCell>
                        <TableCell className="p-4">
                             <Button variant="outline" className="border-slate-100/40 bg-slate-400/40 hover:bg-slate-400/40 font-medium rounded-full text-sm" onClick={() => setIsPickListDialogOpen(true)}>
                                 Generate Picklist
                            </Button>
                        </TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                <div className="footer flex items-center justify-end border-t border-slate-200/60 pt-5">
                    <Button className="bg-darkblue text-white hover:bg-darkblue/90 rounded-lg px-5 mr-2">
                        Submit
                    </Button>
                    <Button type="button" variant="outline" onClick={backSoListtDiv}>
                    Cancel
                </Button>
                </div>
              </div>
            {/* Quantity Block design */}
                <div id="GenerateBlockList" className="hidden h-full relative flex flex-col overflow-hidden">
                <div>
                      {/* Breadcrumb & Close */}
                    <div className="flex items-start justify-start flex-col mb-3 relative">
                        <nav className="flex-1">
                        <Breadcrumb className="text-md">
                            <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                <Link href="/dashboard">Home</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                <Link href="/dashboard/inventory/so"  onClick={backSoListtDiv}>Inventory</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Block Quantity List</BreadcrumbPage>
                            </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        </nav>
                        {/* <div>
                            <p className="text-lg font-medium mb-1">SKU details</p>
                            <p className="text-sm text-neutral-500 mb-2">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rem fugiat beatae quibusdam inventore voluptate ex, placeat illo ducimus dolor a id excepturi nihil atque laborum nulla eaque incidunt sapiente dolorem!</p>
                        </div> */}
                    </div>
                    {/* Header Card */}
                    <div className="mb-6">
                         <div className="flex-1 space-y-0">
                                <h2 className="text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-50 flex items-center gap-2">
                                Akshay Patel 
                                {/* <Minus className="w-4 h-4"></Minus> */}
                                <span className="text-lg text-blue-700 font-bold rounded px-2 py-1 dark:text-sky-400 tracking-1">
                                    [ SO-12457 ]
                                </span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-fit block text-xs font-semibold bg-red-100/40 text-red-400 rounded-sm px-3 py-1 shadow-sm">
                                    In Progress
                                    </span>
                                    <span className="text-sm text-gray-400"> | </span>
                                    <span className="text-xs text-gray-400 font-semibold dark:text-slate-300"> 10 May 24</span>
                                    <span className="text-sm text-gray-400"> | </span>
                                    <span className="text-xs text-gray-400 font-semibold dark:text-slate-50">  Fulfillment: <span>52%</span></span>
                                </div>
                         </div>
                    </div>
                </div>
                {/* SKU Table */}
                <div className="h-full flex-grow overflow-auto">
                 
                    <Table className="table-auto w-full">
                    <TableHeader className="text-black dark:bg-slate-950">
                        <TableRow>
                        <TableHead className="font-semibold px-4 min-w-[150px]">SKU Code</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[200px]">SKU Name</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">SKU Qty</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">Blocked Qty</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">Available Qty</TableHead>
                        <TableHead className="font-semibold px-4 min-w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-sm" onClick={() => setIsBlockQuanlityDialogOpen(true)}>Block</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        {/* <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm">Block</Button> */}
                                        <Button variant="outline" className="w-[90px] border-slate-300/40 bg-slate-400/40 hover:bg-slate-400/40  text-sm" onClick={() => setUnIsBlockQuanlityDialogOpen(true)}>Unblock</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4 sticky left-0 z-1">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-sm">Block</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                <div className="footer flex items-center justify-end border-t border-slate-200/60 pt-5">
                    <Button className="bg-darkblue text-white hover:bg-darkblue/90 rounded-lg px-5 mr-2">
                        Submit
                    </Button>
                    <Button type="button" variant="outline" onClick={backSoListtDiv}>
                    Cancel
                </Button>
                </div>
                </div>

            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Add PO</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {["Internal PO", "External PO"].map((value) => (
                        <DropdownMenuItem
                            key={value}
                            onSelect={() => setPosition(value)}
                            className="flex items-center  !hover:bg-blue-200 focus:bg-blue-100">
                            <span className="capitalize pr-4">{value}</span>
                            {value === position && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu> */}

            {/* <div className="b-1 rounded-lg">
                <Card className="mb-4">
                    <CardContent className="p-6">
                        <div className="w-full flex items-center mb-4">
                            <div className="h-full w-full pr-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Select>
                                            <Label className="text-sm font-medium leading-none">SKU Name <span className="text-destructive">*</span></Label>
                                            <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                                <SelectValue placeholder="SKU Name" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="1">Packaging Material</SelectItem>
                                                    <SelectItem value="2">Packaging Material</SelectItem>
                                                    <SelectItem value="3">Packaging Material</SelectItem>
                                                    <SelectItem value="4">Packaging Material</SelectItem>
                                                    <SelectItem value="5">Packaging Material</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-slate-400">SKU Code:0040013</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="auditGroupName" className="font-medium">SKU Qty.  </Label>
                                        <div className="relative">
                                            <Input className="h-12 rounded-md border border-input" />
                                            <div className="h-11 min-w-[100px] w-[100px] absolute justify-center align-middle text-xs bg-neutral-200/40 text-muted-foreground flex items-center right-[2px] top-[2px] rounded-sm px-2">
                                                KG
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="auditGroupName" className="font-medium">Unit Price </Label>
                                        <div className="relative">
                                            <Input className="h-12 rounded-md border border-input" />
                                            <div className="h-11 min-w-[100px] w-[100px] absolute justify-center align-middle text-xs bg-neutral-200/40 text-muted-foreground flex items-center right-[2px] top-[2px] rounded-sm px-2">
                                                × 3 Qty
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="auditGroupName" className="font-medium">Total Price </Label>
                                        <Input className="h-12 rounded-md border border-input" />
                                    </div>
                                </div>
                            </div>
                            <div className="pl-2 border-dashed border-s self-stretch flex items-center">
                                <Button variant="secondary" size="icon" className="size-8">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="w-full flex items-center bl-1">
                            <Button variant="outline" className="flex ml-auto bg-slate-400/40 hover:bg-slate-400/40 text-sm px-5 mt-2">Submit</Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="mb-4">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-[10px] text-slate-400">SKU Name</p>
                            <p className="text-[14px]">Packaging Material</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400">SKU Code</p>
                            <p className="text-[14px]">0040013</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400">SKU Quantity</p>
                            <p className="text-[14px]">3</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400">SKU Unit Price</p>
                            <p className="text-[14px]">300rs</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400">SKU Total Price</p>
                            <p className="text-[14px]">900</p>
                        </div>
                        <div>
                            <Button variant="secondary" size="icon" className="rounded-full size-8 mr-2">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" size="icon" className="rounded-full size-8">
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
                <Button variant="secondary" className="h-12 w-full flex items-center border border-slate-100/40 bg-slate-200 hover:bg-slate-200/60 dark:bg-slate-500 dark:hover:bg-slate-500/60  text-[14px] rounded-lg"><Plus className="h-5 w-5 mr-2"></Plus> Add SKU Detail</Button>
            </div> */}
            {/* Block quantity modal design */}
            <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                <DialogContent className="max-w-5xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 [&>button]:hidden">
                    <DialogHeader className="bg-slate-200/40 px-2 md:px-6 pt-6 pb-6 border-b">
                        <div className="flex items-start justify-between lh-n">
                            <div className="space-y-[0.6]">
                                <h2 className="text-2xl font-semibold leading-none">Akshay Patel</h2>
                                <p className="text-[14px] text-gray-500 font-medium">Due on 10 May 24 </p>
                                {/* <p className="w-fit min-w-fit text-[12px] bg-red-100 text-red-500 rounded-sm p-1 px-2">In Progress</p> */}
                                <p className="text-xs text-gray-400">Fullfilment: 52%</p>
                            </div>
                            <div className="justify-end items-end flex flex-col space-y-[0.6]">
                                <p className="text-lg font-medium">SO-12457</p>
                                <p className="w-fit min-w-fit text-[12px] bg-red-100 text-red-500 rounded-sm p-1 px-2">In Progress</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-6 z-0">
                        <p className="text-lg font-medium mb-1">SKU details</p>
                        <p className="text-sm text-neutral-500 mb-6">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rem fugiat beatae quibusdam inventore voluptate ex, placeat illo ducimus dolor a id excepturi nihil atque laborum nulla eaque incidunt sapiente dolorem!</p>
                        <Table className="table-auto">
                            <TableHeader className="text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                <TableRow className="">
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[150px">SKU Code</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[200px]">SKU Name</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">SKU Qty</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Blocked Qty</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Available Qty</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center">200</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm" onClick={() => setIsBlockQuanlityDialogOpen(true)}>Block</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center">200</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        {/* <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm">Block</Button> */}
                                        <Button variant="outline" className="w-[90px] border-slate-300/40 bg-slate-400/40 hover:bg-slate-400/40 text-slate-900 text-sm" onClick={() => setUnIsBlockQuanlityDialogOpen(true)}>Unblock</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4 sticky left-0 z-1">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center">200</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm">Block</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-1">
                       <DialogClose asChild>
                             <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button >Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>   
             {/* Block quantity conformation modal design */}
             <Dialog open={isBlockQuanlityDialogOpen} onOpenChange={setIsBlockQuanlityDialogOpen}>
                <DialogContent className="max-w-xl flex flex-col overflow-hidden rounded-xl scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] space-y-3 pt-6 z-0 mb-4">
                      <p className="text-xl font-semibold">Confirm Block Quantity </p>
                      <p className="text-sm text-neutral-500">Are you sure you want to block this product quantity? <br></br>
                        You can review or change the quantity below before confirming.</p>
                        <div>
                            <Input className="h-12 rounded-md border border-input" placeholder="Block Quantity"  type="number"/>
                        </div>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                        <Button >Yes, Block Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
               {/* UnBlock quantity conformation modal design */}
             <Dialog open={isUnBlockQuanlityDialogOpen} onOpenChange={setUnIsBlockQuanlityDialogOpen}>
                <DialogContent className="max-w-xl flex flex-col overflow-hidden rounded-xl scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] space-y-3 pt-6 z-0 mb-4">
                      <p className="text-xl font-semibold">Confirm Unblock Quantity</p>
                      <p className="text-sm text-neutral-500">Are you sure you want to release the blocked quantity?<br></br>
                       You can update the quantity below if you'd like to release a different amount.</p>
                        <div>
                            <Input className="h-12 rounded-md border border-input" placeholder="Unblock Quantity"  type="number"/>
                        </div>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                        <Button >Yes, Unblock Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Generate Pick list modal design */}
            <Dialog open={isPickListDialogOpen} onOpenChange={setIsPickListDialogOpen}>
                <DialogContent className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 [&>button]:hidden">
                    <DialogHeader className="bg-slate-200/40 dark:bg-slate-700 px-2 md:px-6 pt-6 pb-6 border-b">
                        <div className="flex items-start justify-between lh-n">
                            <div className="space-y-[0.8">
                                <h2 className="text-2xl font-semibold leading-none mb-1">Balaji Masala Wafer-250gm</h2>
                                <p className="text-[16px] text-gray-500 dark:text-gray-400  font-medium">FS0324_7498 </p>
                                {/* <p className="w-fit min-w-fit text-[12px] bg-red-100 text-red-500 rounded-sm p-1 px-2">In Progress</p> */}
                                <p className="text-sm text-gray-400 dark:text-gray-500">Blocked: 220 Qty</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-6 z-0">
                        <Table className="table-auto mb-3">
                            <TableHeader className="text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                <TableRow className="">
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Manufacture Date</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Location</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Avaliable Qty.</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 w-[200px]">Pick Qty.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                  <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                  <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow> <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow> <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                    <TableCell className="p-4 md:p-4"> 
                                        <Input className="h-12 rounded-md border border-input" value={200} placeholder="Pick Quantity"  type="number"/>
                                    </TableCell>
                                </TableRow>

                               
                            </TableBody>
                        </Table>
                        <div className="py-4">
                            <p className="text-sm mb-2">
                                    Based on your selected date and quantity, choose a person from the list below to handle the picking of this stock.
                            </p>
                              <Select>
                                <SelectTrigger className="w-[180px] h-12 text-sm rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                    <SelectValue placeholder="Assign Person" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectItem value="1">Person1</SelectItem>
                                    <SelectItem value="3">Person1</SelectItem>
                                    <SelectItem value="2">Person1</SelectItem>
                                    <SelectItem value="4">Person1</SelectItem>
                                    <SelectItem value="5">Person1</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                     </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-1">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button  onClick={() => setIsConfirmDialogOpen(true)}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

              {/* View Pick list modal design */}
            <Dialog open={isViewPickListDialogOpen} onOpenChange={setIsViewPickListDialogOpen}>
                <DialogContent className="max-w-3xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 [&>button]:hidden">
                    <DialogHeader className="bg-slate-200/40 dark:bg-slate-700 px-2 md:px-6 pt-6 pb-6 border-b">
                        <div className="flex items-start justify-between lh-n">
                            <div className="space-y-[0.8">
                                <h2 className="text-2xl font-semibold leading-none mb-1">Balaji Masala Wafer-250gm</h2>
                                <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium">FS0324_7498 </p>
                                {/* <p className="w-fit min-w-fit text-[12px] bg-red-100 text-red-500 rounded-sm p-1 px-2">In Progress</p> */}
                                <p className="text-sm text-gray-400 dark:text-gray-500">Blocked: 220 Qty</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-6 z-0">
                        <Table className="table-auto">
                            <TableHeader className="text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                <TableRow className="">
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Manufacture Date</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Location</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4">Select Qty.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                </TableRow>
                                  <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                </TableRow>
                                  <TableRow>
                                    <TableCell className="p-4 md:p-4">13/5/2025</TableCell>
                                    <TableCell className="p-4 md:p-4">L1B1_S11</TableCell>
                                    <TableCell className="p-4 md:p-4">200</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                     </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-1">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             {/* UnBlock quantity conformation modal design */}
             <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="max-w-xl flex flex-col overflow-hidden rounded-xl scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] space-y-3 pt-6 z-0 mb-4">
                      <p className="text-xl font-semibold">Confirm Assign Picker </p>
                      <p className="text-sm text-neutral-500">Are you sure you want to assign this person to pick the selected items?<br></br>
                        Please confirm to proceed.</p>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-2">
                        <Button>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

         {/*  Generate piclist quantity modal design  */} 
            {/* <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                <DialogContent className="max-w-5xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0 [&>button]:hidden">
                    <DialogHeader className="bg-slate-200/40 px-2 md:px-6 pt-6 pb-6 border-b">
                        <div className="flex items-start justify-between lh-n">
                            <div className="space-y-[0.6]">
                                <h2 className="text-2xl font-semibold leading-none">Akshay Patel</h2>
                                <p className="text-[14px] text-gray-500 font-medium">Due on 10 May 24 </p>
                                <p className="w-fit min-w-fit text-[12px] bg-red-100 text-red-500 rounded-sm p-1 px-2">In Progress</p>
                                <p className="text-xs text-gray-400">Fullfilment: 52%</p>
                            </div>
                            <div className="justify-end items-end flex flex-col space-y-[0.6]">
                                <p className="text-lg font-medium">SO-12457</p>
                                <p className="w-fit min-w-fit text-[12px] bg-red-100 text-red-500 rounded-sm p-1 px-2">In Progress</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="h-full flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-6 z-0">
                        <p className="text-lg font-medium mb-1">SKU details</p>
                        <p className="text-sm text-neutral-500 mb-6">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rem fugiat beatae quibusdam inventore voluptate ex, placeat illo ducimus dolor a id excepturi nihil atque laborum nulla eaque incidunt sapiente dolorem!</p>
                        <Table className="table-auto">
                            <TableHeader className="text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                                <TableRow className="">
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[150px">SKU Code</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[200px]">SKU Name</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">SKU Qty</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Blocked Qty</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Available Qty</TableHead>
                                    <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center">200</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm" onClick={() => setIsBlockQuanlityDialogOpen(true)}>Block</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center">200</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                       <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm">Block</Button> 
                                        <Button variant="outline" className="w-[90px] border-slate-300/40 bg-slate-400/40 hover:bg-slate-400/40 text-slate-900 text-sm" onClick={() => setUnIsBlockQuanlityDialogOpen(true)}>Unblock</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="[&>td:nth-child(-n+3)]:bg-neutral-100 dark:[&>td:nth-child(-n+3)]:bg-slate-600">
                                    <TableCell className="p-4 md:p-4 sticky left-0 z-1">FS0324_7498</TableCell>
                                    <TableCell className="p-4 md:p-4">Balji wafer 250gm</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center">200</TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 0  </TableCell>
                                    <TableCell className="p-4 md:p-4 text-center"> 150 </TableCell>
                                    <TableCell className="p-4 md:p-4">
                                        <Button variant="outline" className="w-[90px] border-amber-300/40 bg-amber-400/40 hover:bg-amber-400/40 text-slate-900 text-sm">Block</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4 gap-1">
                       <DialogClose asChild>
                             <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button >Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    )
}