"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { z } from "zod"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, Trash, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useForm as useDraftForm } from "react-hook-form";
import { notification } from '@/src/services/notificationService'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import Link from "next/link"

const skuItemSchema = z.object({
  skuId: z.string().min(1, "SKU Name is required"),
  description: z.string().optional(),
  qty: z.coerce.number().min(1, "Quantity is required"),
  unitPrice: z.coerce.number().min(1, "Unit price is required"),
  totalPrice: z.coerce.number().optional(),
})

const POFormSchema = z.object({
  soNumber: z.string().min(1, "SO Number is required"),
  customerId: z.string().min(1, "Coustomer is required"),
  date: z.string().min(1, "SO Date is required"),
  skuItems: z.array(skuItemSchema).min(1, "At least one SKU item is required"),
});

// Type inference
type POFormValues = z.infer<typeof POFormSchema>;
type skuItemValues = z.infer<typeof skuItemSchema>;

interface ApiSkuItem {
  skuId: string;
  description: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

interface ApiPayload {
  soNumber: string;
  customerId: string;
  date: string;
  items: ApiSkuItem[];
}

interface PoFormProps {
  initialData?: Partial<POFormValues>
  onSubmit: (data: ApiPayload) => void
  onCancel: () => void
  vendors: { label: string; value: string }[]
  skuUnits: { label: string; value: string }[]
  skus: any[]
  formMode: string
}

export function SoForm({ initialData = {}, onSubmit, onCancel, vendors, formMode, skus, skuUnits }: PoFormProps) {

  const form = useForm<POFormValues>({
    resolver: zodResolver(POFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: useMemo(() => ({
      soNumber: initialData?.soNumber || "",
      customerId: initialData?.customerId || "",
      date: initialData?.date || "",
      skuItems: initialData?.skuItems || [],
    }), [initialData])
  });


  const skuDraftForm = useDraftForm<skuItemValues>({
    resolver: zodResolver(skuItemSchema),
    mode: "onChange",
    defaultValues: {
      skuId: "",
      description: "",
      qty: 0,
      unitPrice: 0,
      totalPrice: 0,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "skuItems",
  });

  const [skuEditIndex, setSkuEditIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchSkuItems = useWatch({ control: form.control, name: "skuItems" });
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const watchedSkuItems = useWatch({ control: form.control, name: "skuItems" }) || [];

  const selectedSkuIds = watchedSkuItems.map((item, idx) => idx !== skuEditIndex ? item.skuId : null).filter(Boolean);

  const normalizeSkuItems = (items: skuItemValues[] = []) =>
    items.map((item) => ({
      skuId: item.skuId,
      description: item.description || "",
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice ?? (item.qty * item.unitPrice)
    })
  );

  const normalizedInitial = normalizeSkuItems(initialData?.skuItems || []);
  const normalizedCurrent = normalizeSkuItems(watchedSkuItems);
  const hasSkuChanges = JSON.stringify(normalizedInitial) !== JSON.stringify(normalizedCurrent);
  const isFormDirty = form.formState.isDirty;
  const isSkuDirty = skuEditIndex !== null || hasSkuChanges;
  const isDirty = isFormDirty || isSkuDirty;

  const selectedSkuId = skuDraftForm.watch("skuId");
  const selectedSku = skus.find(s => s.id === selectedSkuId);
  const qty = Number(skuDraftForm.watch("qty")) || 0;
  const unitPrice = Number(skuDraftForm.watch("unitPrice")) || 0;
  const totalPrice = qty * unitPrice;
  const skuFormRef = useRef<HTMLDivElement>(null);

  // Reload Browser Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        Object.defineProperty(e, "returnValue", {
          configurable: true,
          enumerable: true,
          get: () => "",
          set: () => { },
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const getSkuNameById = (id: string): string => {
    const sku = skus.find(s => s.id === id);
    return sku ? sku.name : "-";
  };

  const getSkuUnitById = (id: string): string => {
    const skuUnit = skuUnits.find(s => s.value === id);
    return skuUnit ? skuUnit.label : "-";
  };
  const skuUnitName = getSkuUnitById(selectedSku?.unitId);

  // handle sku
  const handleAddSKU = () => {
    setSkuEditIndex(-1);
    setTimeout(() => {
      skuFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  };

  const handleEditSKU = (index: number) => {
    setSkuEditIndex(index);
  };

  const handleRemoveSKU = (index: number) => {
    remove(index);
    if (skuEditIndex === index) {
      setSkuEditIndex(null);
    }
  };

  const handleSKUSubmit = skuDraftForm.handleSubmit((draft) => {
    if (selectedSkuIds.includes(draft.skuId)) {
      notification.error("This SKU is already added.");
      return;
    }
    const qty = Number(draft.qty) || 0;
    const unitPrice = Number(draft.unitPrice) || 0;
    const total = qty * unitPrice;

    if (skuEditIndex !== null && skuEditIndex >= 0) {
      update(skuEditIndex, { ...draft, totalPrice: total });
    } else {
      append({ ...draft, totalPrice: total });
    }
    skuDraftForm.reset();
    setSkuEditIndex(null);
  });

  const handleSKUUpdate = () => {
    if (skuEditIndex === null || skuEditIndex < 0) return;
    const item = form.getValues(`skuItems.${skuEditIndex}`);
    const duplicate = watchSkuItems.some((it, idx) => it.skuId === item.skuId && idx !== skuEditIndex);
    if (duplicate) {
      notification.error("This SKU is already added.");
      return;
    }
    const qty = Number(item.qty) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const total = qty * unitPrice;
    update(skuEditIndex, { ...item, totalPrice: total });
    setSkuEditIndex(null);
  };

  return (
    <div className="h-100vh flex flex-col">
      <div className="flex items-start justify-start flex-col relative">
        <nav className="flex-1 mb-2">
          <Breadcrumb className="text-md">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink asChild>
                  <div 
                    onClick={() => {
                      if (isDirty) {
                        setShowCancelConfirm(true);
                      } else {
                        onCancel();
                      }
                    }}>
                      Sales Order Management
                  </div>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create SO</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="mb-2">
          <PageHeader title={`Create Sales Order`} />
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit((formData) => {
            const payload = {
              soNumber: formData.soNumber,
              customerId: formData.customerId,
              date: new Date(formData.date).toISOString(),
              items: formData.skuItems.map((item) => {
                const sku = skus.find((s) => s.id === item.skuId);
                return {
                  skuId: item.skuId,
                  description: item.description || "",
                  qty: item.qty,
                  skuUnit: sku?.unitId,
                  skuCode: sku?.code,
                  unitPrice: item.unitPrice || 0,
                  totalPrice: item.totalPrice || 0,
                };
              }),
            };
            onSubmit(payload); // ✅ Send the API-ready data
          })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
          className="flex flex-col flex-grow overflow-auto space-y-4">
          {/* form fields */}
          <div className={`${
              fields.length === 0
                ? "h-auto"
                : formMode === "edit" && isDirty
                ? "h-[calc(100vh-182px)]"
                : formMode !== "edit"
                ? "h-[calc(100vh-96px)]"
                : "h-auto"
            } space-y-4 flex-grow overflow-y-auto px-2 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0`}
          >
            <div className="border border-dashed bg-gray-100 rounded-xl p-6 pb-8 mb-6 gap-4 space-y-2">
              {/* SO Number and SO Date */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <FormField control={form.control} name="soNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium leading-none">
                          SO Number <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter SO Number"
                            readOnly={formMode === "edit"} className={`h-12 rounded-md border border-input 
                            ${formMode === "edit" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <FormField control={form.control} name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium leading-none">Customer <span className="text-destructive">*</span></FormLabel>
                        <Select disabled={formMode === "edit"} onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={`h-12 rounded-md border border-input ${formMode === "edit" ? "bg-gray-100 cursor-not-allowed" : "bg-white/100"} dark:bg-slate-800/80 dark:border-slate-700`}>
                              <SelectValue placeholder="Select From" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                            {vendors.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">No Customer found</div>
                            ) : (
                              vendors.map((v) => (
                                <SelectItem key={v.value} value={v.value} className="w-full py-2.5">
                                  {v.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                    <FormField control={form.control} name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium leading-none ">SO Date <span className="text-destructive">*</span></FormLabel>
                          <FormControl className="w-full flex">
                            <Input className="!w-full h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                              id="so-date-time" type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
              </div>
            </div>

            <div className={`mt-6 space-y-2 ${fields.length > 0 || skuEditIndex !== null ? "border-t border-slate-200" : ""}`}>
              {(fields.length > 0 || skuEditIndex !== null) && (
                <p className="text-lg font-semibold pt-4">SKU Details</p>
              )}
              {/* SKU View and Inline Edit Mode */}
              {fields.length > 0 && (
                <div className="outer-div mt-0">
                  <Table className="table-auto  border-none shadow-none border-separate border-spacing-y-4 bg-none">
                    <TableHeader className="text-black dark:bg-slate-950">
                      <TableRow>
                        <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[150px] rounded-l-sm">SKU Name</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Quantity</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Unit Price</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px]">Total Price</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap px-4 min-w-[100px] rounded-r-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const sku = watchSkuItems?.[index];
                        const isEditing = skuEditIndex === index;
                        return isEditing ? null : (
                          <TableRow key={field.id} className="my-3 bg-gray-50 shadow-soft hover:bg-slate-100/40 rounded-xl">
                            <TableCell className="p-4 rounded-l-xl">{sku?.skuId ? getSkuNameById(sku?.skuId) : "-"}</TableCell>
                            <TableCell>{sku?.qty}</TableCell>
                            <TableCell className="p-4">{sku?.unitPrice}</TableCell>
                            <TableCell className="p-4">{sku?.totalPrice ?? (Number(sku?.qty || 0) * Number(sku?.unitPrice || 0))}</TableCell>
                            <TableCell className="p-4 rounded-r-xl">
                              <Button type="button" onClick={() => handleEditSKU(index)} size="icon" className="rounded-full bg-transparent hover:bg-slate-100 mr-2">
                                <Pencil className="w-4 h-4  text-slate-600 dark:text-slate-300 " />
                              </Button>
                              <Button type="button" onClick={() => setConfirmDeleteIndex(index)} size="icon" className="bg-transparent hover:bg-slate-100 rounded-full">
                                <Trash className="w-4 h-4 text-slate-600 dark:text-slate-300 " />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {fields.map((field, index) => {
                const isEditing = skuEditIndex === index;
                if (!isEditing) return null;

                return (
                  <Card key={field.id} className="mb-4">
                    <div className="p-4">
                      <CardContent className="w-full pt-4">
                        <>
                          {/* SKU name and QTY */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <FormField control={form.control} name={`skuItems.${index}.skuId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>SKU Name <span className="text-destructive">*</span></FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Select SKU Name" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {skus.filter((sku) => !selectedSkuIds.includes(sku.id)).length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No SKUs found</div>
                                      ) : (
                                        skus
                                          .filter((sku) => !selectedSkuIds.includes(sku.id))
                                          .map((sku) => (
                                            <SelectItem key={sku.id} value={sku.id}>
                                              {sku.name} ({sku.code})
                                            </SelectItem>
                                          ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                               <FormField control={form.control} name={`skuItems.${index}.qty`}
                              render={({ field }) => {
                                const skuId = form.watch(`skuItems.${index}.skuId`);
                                const unit = getSkuUnitById(skus.find(s => s.id === skuId)?.unitId);
                                return (
                                  <FormItem>
                                    <FormLabel>Quantity <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type="text" placeholder="Quantity" {...field}
                                          onKeyDown={(e) => {
                                            const allowedKeys = [
                                              "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", ".", // dot for decimal
                                            ];
                                            if (
                                              !/[0-9]/.test(e.key) &&
                                              !allowedKeys.includes(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                          }}
                                          inputMode="decimal" className="h-12 rounded-md border border-input"
                                        />
                                        <div className="h-11 min-w-[100px] w-[100px] absolute justify-center align-middle text-xs bg-neutral-200/40 text-muted-foreground flex items-center right-[2px] top-[2px] rounded-sm px-2">
                                          {unit || "--"}
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                              <FormField control={form.control} name={`skuItems.${index}.unitPrice`}
                              render={({ field }) => {
                                const qty = Number(form.watch(`skuItems.${index}.qty`) || 0);
                                const unitPrice = Number(field.value || 0);
                                return (
                                  <FormItem>
                                    <FormLabel>Unit Price <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type="text" placeholder="Unit Price" {...field}
                                          onKeyDown={(e) => {
                                            const allowedKeys = [
                                              "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", ".", // dot for decimal
                                            ];
                                            if (
                                              !/[0-9]/.test(e.key) &&
                                              !allowedKeys.includes(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                          }}
                                          inputMode="decimal" className="h-12 rounded-md border border-input"
                                        />
                                        <div className="h-11 min-w-[100px] w-[100px] absolute justify-center align-middle text-xs bg-neutral-200/40 text-muted-foreground flex items-center right-[2px] top-[2px] rounded-sm px-2">
                                          × {qty} = {(qty * unitPrice).toFixed(2)}
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                            </div>
                          </div>
                         
                          {/* Description */}
                          <FormField control={form.control} name={`skuItems.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Enter Description" className="h-12 rounded-md border border-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSkuEditIndex(null)}>Cancel</Button>
                            <Button type="button" onClick={handleSKUUpdate}>Update</Button>
                          </div>
                        </>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}

              {/* SKU Add Form */}
              {skuEditIndex === -1 && (
                <Card ref={skuFormRef} className="mb-4 !shadow-none hover:!shadow-none border border-dashed">
                  <CardContent className="p-6">
                    <Form {...skuDraftForm}>
                      {/* SKU Name and Qty */}
                      <div className="w-full flex items-center mb-4">
                        <div className="h-full w-full pr-4">
                          {/* Sku name and Qty. */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <FormField control={skuDraftForm.control} name="skuId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>SKU Name <span className="text-destructive">*</span></FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                        <SelectValue placeholder="Select SKU Name" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {skus.filter((sku) => !selectedSkuIds.includes(sku.id)).length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No SKUs found</div>
                                      ) : (
                                        skus
                                          .filter((sku) => !selectedSkuIds.includes(sku.id))
                                          .map((sku) => (
                                            <SelectItem key={sku.id} value={sku.id}>
                                              {sku.name} ({sku.code})
                                            </SelectItem>
                                          ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                              <FormField control={skuDraftForm.control} name="qty"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type="text" placeholder="Quantity" {...field}
                                          onKeyDown={(e) => {
                                            const allowedKeys = [
                                              "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", ".", // dot for decimal
                                            ];
                                            if (
                                              !/[0-9]/.test(e.key) &&
                                              !allowedKeys.includes(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                          }}
                                          inputMode="decimal"
                                          className="h-12 rounded-md border border-input"
                                        />
                                        <div className="h-11 min-w-[100px] w-[100px] absolute justify-center align-middle text-xs bg-neutral-200/40 text-muted-foreground flex items-center right-[2px] top-[2px] rounded-sm px-2">
                                          {skuUnitName || "--"}
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                                <FormField control={skuDraftForm.control} name="unitPrice"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Unit Price <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type="text" placeholder="Unit Price" {...field}
                                          onKeyDown={(e) => {
                                            const allowedKeys = [
                                              "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", ".", // dot for decimal
                                            ];
                                            if (
                                              !/[0-9]/.test(e.key) &&
                                              !allowedKeys.includes(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                          }}
                                          inputMode="decimal" className="h-12 rounded-md border border-input"
                                        />
                                        <div className="h-11 min-w-[100px] w-[100px] absolute justify-center align-middle text-xs bg-neutral-200/40 text-muted-foreground flex items-center right-[2px] top-[2px] rounded-sm px-2">
                                          × {qty || 0} Qty = {totalPrice.toFixed(2) || 0}
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          {/* Unit price and Menufechar Date */}
                         
                          {/* Description */}
                          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
                            <FormField control={skuDraftForm.control} name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">Description</FormLabel>
                                  <FormControl >
                                    <Textarea className="h-12 rounded-md border border-input !bg-white-100 !dark:bg-slate-800/80 dark:border-slate-700" placeholder="Enter Description" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="pl-2 border-dashed border-s self-stretch flex items-center">
                          <Button variant="secondary" size="icon" className="size-8" onClick={() => {
                            skuDraftForm.reset();
                            setSkuEditIndex(null);
                          }}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" className="bg-slate-200 hover:bg-slate-200/50 text-slate-900 mr-8" onClick={handleSKUSubmit}>Add SKU</Button>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {fields.length === 0 && skuEditIndex === null ? (
                <div
                  className="flex items-center flex-col justify-center rounded-2xl border border-dashed border-slate-300 p-8"
                  onClick={handleAddSKU}
                >
                  <p className="text-lg font-semibold mb-2">Add SKU Information</p>
                  <Button className="flex items-center bg-slate-50 hover:bg-slate-50/40 shadow-none text-sm border border-slate-200 rounded-lg text-slate-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SKU Items
                  </Button>
                </div>
              ) : (
                skuEditIndex === null && (
                  <Button type="button" onClick={handleAddSKU}
                    className="h-12 w-full flex items-center shadow-none hover:shadow-none border font-semibold border-slate-200 text-slate-800 bg-slate-200 hover:bg-slate-200 text-[14px] rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add SKU Items
                  </Button>
                )
              )}
            </div>
          </div>
          {fields.length > 0 && skuEditIndex === null && (
            <div className="flex justify-end gap-2 pt-3">
              {formMode === "edit" && isDirty && (
                <>
                  <Button type="button" variant="outline"
                    onClick={() => {
                      if (isDirty) {
                        setShowCancelConfirm(true);
                      } else {
                        onCancel();
                      }
                    }}
                  > Cancel
                  </Button>
                  <Button type="submit"> Update SO </Button>
                </>
              )}
              
              {formMode !== "edit" && (
                <>
                  <Button type="button" variant="outline"
                    onClick={() => {
                      if (isDirty) {
                        setShowCancelConfirm(true);
                      } else {
                        onCancel();
                      }
                    }}
                  > Cancel
                  </Button>
                  <Button type="submit"> Create SO </Button>
                </>
              )}
            </div>
          )}
        </form>
      </Form>

      {/* Confrim modal (Delete SKU Items) */}
      <Dialog open={confirmDeleteIndex !== null} onOpenChange={(open) => !open && setConfirmDeleteIndex(null)}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setConfirmDeleteIndex(null)}>
          <DialogHeader>
            <DialogTitle>Delete SKU Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this SKU item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteIndex(null)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => {
                if (confirmDeleteIndex !== null) {
                  handleRemoveSKU(confirmDeleteIndex);
                  setConfirmDeleteIndex(null);
                }
              }}
            > Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit page confirmation modal */}
      <Dialog open={showCancelConfirm} onOpenChange={(open) => !open && setShowCancelConfirm(false)}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setShowCancelConfirm(false)}>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to exit without saving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>Stay</Button>
            <Button variant="destructive" onClick={onCancel}>Yes, Exit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}