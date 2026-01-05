"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Database, Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const taskRepoFormSchema = z.object({
  name: z.string().min(1, { message: "Task name is required" }),
  description: z.string().optional(),
  skillId: z.string({
    required_error: "Please select a task skill.",
  }).min(1, { message: "Please select a task skill." }),
  unitId: z.string({
    required_error: "Please select a org unit.",
  }).min(1, { message: "Please select a org unit." }),
  typeId: z.string({
    required_error: "Please select a task type.",
  }).min(1, { message: "Please select a task type." })
})

type taskRepoFormValues = z.infer<typeof taskRepoFormSchema>

export default function TaskRepositoryPage() {
  
  const {isAuthenticated, isAuthLoading} = useAuth();
  const [tasks, setTasks] = useState<any[]>([])
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [units, setUnit] = useState<{ value: string; label: string }[]>([]);
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [taskTypes, setTaskTypes] = useState<{ value: string; label: string }[]>([]);
  const [taskTypesFilter, setTaskTypesFilter] = useState<string>("");
  const [taskSkills, setTaskSkills] = useState<{ value: string; label: string }[]>([]);
  const [taskSkillsFilter, setTaskSkillsFilter] = useState<string>("");
  const [filtersReady, setFiltersReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add")

  const router = useRouter();
  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });

  // Initialize form
  const form = useForm<taskRepoFormValues>({
    resolver: zodResolver(taskRepoFormSchema),
    defaultValues: {
      name: "",
      typeId: "",
      unitId: "",
      skillId: "",
      description: ""
    },
  })

  // Auth Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  // Get Units
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565c5df70897486c46852e",
      setState: setUnit,
      defaultLabel: "Units",
    });
  }, []);

  useEffect(() => {
    if (units.length > 0 && !unitFilter) {
      setUnitFilter(units[0].value);
    }
  }, [units, unitFilter]);

  const getUnitNameById = (id: string): string => {
    const unit = units.find(u => u.value === id);
    return unit ? unit.label : "-";
  };

  // Get Task Types
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565d7df70897486c468534",
      setState: setTaskTypes,
      defaultLabel: "TaskTypes",
    });
  }, []);

  useEffect(() => {
    if (taskTypes.length > 0 && !taskTypesFilter) {
      setTaskTypesFilter(taskTypes[0].value);
    }
  }, [taskTypes, taskTypesFilter]);

  const getTaskTypeNameById = (id: string): string => {
    const taskType = taskTypes.find(tt => tt.value === id);
    return taskType ? taskType.label : "-";
  };

  // Get Skill Set
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565d23f70897486c468531",
      setState: setTaskSkills,
      defaultLabel: "TaskSkills",
    });
  }, []);

  useEffect(() => {
    if (taskSkills.length > 0 && !taskSkillsFilter) {
      setTaskSkillsFilter(taskSkills[0].value);
    }
  }, [taskSkills, taskSkillsFilter]);

  const getTaskSkillsNameById = (id: string): string => {
    const taskSkill = taskSkills.find(ts => ts.value === id);
    return taskSkill ? taskSkill.label : "-";
  };

  // Comman Dropdown Filter Api
  const fetchDropdownOptions = async ({
    apiId,
    setState,
    defaultLabel,
  }: {
    apiId: string;
    setState: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
    defaultLabel: string;
  }) => {
    try {
      const response = await apiService.get({
        path: `${api_url.worCoorService.referenceDataTable.listTableEntry}/${apiId}`,
        isAuth: true,
      });

      const rawData = response.data?.data || [];

      const formattedData = rawData.map((item: any) => ({
        value: item.id,
        label: item.detail?.name || "",
      }));

      if (defaultLabel === "TaskTypes" || defaultLabel === "TaskSkills") {
        setState([{"value": "000000000000000000000000", "label": "All"}, ...formattedData]);
      } else {
        setState([ ...formattedData]);
      }
    } catch (error) {
      notification.error(`Failed to load ${defaultLabel}.`);
    }
  };

  // Filter Set All
  useEffect(() => {
    const allFetched = [units, taskTypes, taskSkills].every(arr => Array.isArray(arr));
    const allSelected = unitFilter && taskTypesFilter && taskSkillsFilter;

    if (allFetched && allSelected) {
      setFiltersReady(true);
    }
  }, [units, taskTypes, taskSkills, unitFilter, taskTypesFilter, taskSkillsFilter]);

  const buildFilterQuery = () => {
    const query: any = {};
    if (taskTypesFilter && taskTypesFilter !== "000000000000000000000000") {
      query.typeId = taskTypesFilter;
    }
    if (taskSkillsFilter && taskSkillsFilter !== "000000000000000000000000") {
      query.skillId = taskSkillsFilter;
    }
    return query;
  };

  // Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);

  // Task Repository Listing
  useEffect(() => {
    if (filtersReady) {
      fetchTaskList();
    }
  }, [page, searchTerm, unitFilter, taskTypes, taskTypesFilter, taskSkills, taskSkillsFilter, filtersReady]);

  useEffect(() => {
    setPage(0);
    setTasks([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, unitFilter, taskTypes, taskTypesFilter, taskSkills, taskSkillsFilter]);

  const fetchTaskList = async () => {
    setIsLoading(true);
    try {
      const filters = buildFilterQuery();
      const requestData: any = {
        ...getPaginatedRequestParams(page, pageSize),
        searchText: searchTerm || undefined,
      };
      if (Object.keys(filters).length > 0) {
        requestData.refFilter = filters;
      }
      
      const response = await apiService.post({
        path: api_url.worCoorService.task.repository.list,
        data: requestData,
        isAuth: true,
      });

      const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
      const totalCount = response.data?.data?.total || 0;
      setTasks((prev) => {
        const merged = [...prev, ...list];
        const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setHasMore(uniqueById.length < totalCount);
        return uniqueById;
      });
    } catch (error) {
      setHasMore(false);
      notification.error("Failed to load project repository list.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: taskRepoFormValues) => {
    if (formMode === "add") {
      setIsSubmitting(true);
      try {
        const reqBody = {
          name: data.name,
          typeId: data.typeId,
          skillId: data.skillId,
          unitId: data.unitId,
          description: data.description ? data.description : undefined,
        };

        const response = await apiService.post({
          path: api_url.worCoorService.task.repository.add,
          isAuth: true,
          data: reqBody,
        });

        if (response.data.status === "OK") {
          notification.success(response.data.message);
          setIsAddDialogOpen(false)
          setPage(0);
          setTasks([]);
          setHasMore(true);
          setIsLoading(false);
          await fetchTaskList();
        } else {
          notification.error(response.data.message);
        }
      } catch (error) {
        notification.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else if (formMode === "edit") {
      setIsSubmitting(true);
      try {
        const reqBody = {
          id: selectedTask.id,
          name: data.name,
          typeId: data.typeId,
          skillId: data.skillId,
          unitId: data.unitId,
          description: data.description ? data.description : undefined,
        };

        const response = await apiService.put({
          path: api_url.worCoorService.task.repository.update,
          isAuth: true,
          data: reqBody,
        });

        if (response.data.status === "OK") {
          notification.success(response.data.message);
          setIsEditDialogOpen(false)
          setPage(0);
          setTasks([]);
          setHasMore(true);
          setIsLoading(false);
          await fetchTaskList();
        } else {
          notification.error(response.data.message);
        }
      } catch (error) {
        notification.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle row double click
  const handleRowDoubleClick = (task: any) => {
    setSelectedTask(task)
    setIsViewOpen(true)
  }

  // Open edit dialog
  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setFormMode("edit")
    form.reset({
      name: task.name,
      typeId: task.typeId,
      unitId: task.unitId,
      skillId: task.skillId,
      description: task.description
    })
    setIsEditDialogOpen(true)
  }

  // Open Delete Dialog
  const deleteTask = (task: any) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  // Add Task Repository
  const handleAddTask = () => {
    setFormMode("add")
    form.reset({
      name: "",
      typeId: "",
      unitId: "",
      skillId: "",
      description: ""
    })
    setIsAddDialogOpen(true)
  }

  // Handle deleting a Project Repository
  const handleDeleteProjectRepo = async () => {
    if (!selectedTask) return
    setIsDeleting(true);
    try {
      const response = await apiService.delete({
        path: `${api_url.worCoorService.task.repository.delete}/${selectedTask.id}`,
        isAuth: true,
      });
      if (response.data?.status === "OK") {
        notification.success(response.data.message);
        setTasks(tasks.filter((task) => task.id !== selectedTask.id))
        setIsDeleteDialogOpen(false);
        setIsViewOpen(false);
        setSelectedTask(null);
      } else {
        notification.error(response.data?.message);
      }
    } catch (error) {
      notification.error("Something went wrong while deleting the project repository.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isAuthLoading || !isAuthenticated) return null;

  return (
     <div className="h-[calc(100vh-3rem)] overflow-hidden">
      <div className="repository h-full flex flex-col gap-2">
        <div className="flex items-center pb-2 sm:pb-4">
          <PageHeader title="Task Repository" icon={Database}
            description="These are all basic tasks in an organisation, created upfront just to avoid overload of creating task in BAU"
          />
          <Button 
            className="border border-primary bg-darkblue text-white hover:bg-darkblue/90 ml-auto"
            onClick={() => handleAddTask()}>
            <span className="hidden md:block"> Create Task</span> <Plus className="h-4 w-4 block text-white md:hidden" />
          </Button>
        </div>

        <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 bg-transparent sm:bg-white/80 backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
          {/* Search and filter Design */}
          <div className="border-gray-200 pb-7 pt-1">
            <div className="w-full flex flex-wrap gap-4 items-center">
              <div className="w-full md:w-auto flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                  <Input type="search" placeholder="Search task name..."
                    value={rawSearchTerm}
                    onChange={(e) => setRawSearchTerm(e.target.value)}
                    className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                  />
                </div>
              </div>

              <div className="w-fit flex flex-wrap align-middle gap-3 md:gap-2 ml-auto md:flex-none">
                {/* Task Type  Wise Filter  */}
                <div className="relative w-[160px]">
                  <Select value={taskTypesFilter} onValueChange={setTaskTypesFilter}>
                    <SelectTrigger className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                      {taskTypes.map((tt) => (
                        <SelectItem key={tt.value} value={tt.value}>{tt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                      transition-all duration-200 bg-background px-1
                      peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                      ${taskTypesFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                    `}
                  > Task Types
                  </label>
                </div>

                {/* Task Skills Wise Filter  */}
                <div className="relative w-[160px]">
                  <Select value={taskSkillsFilter} onValueChange={setTaskSkillsFilter}>
                  <SelectTrigger className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                      {taskSkills.map((ts) => (
                        <SelectItem className="w-full" key={ts.value} value={ts.value}>{ts.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    <span
                      className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                      transition-all duration-200 bg-background px-1
                      peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                      ${taskSkillsFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                    `}> Task Skills
                    </span>
                  </div>
              </div>
            </div>
          </div>
          {/* Project Repository Listing */}
          <div ref={scrollContainerRef} className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto">
            <Table className="responsive-table">
              {tasks.length === 0 ? (
                <TableBody>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={10} className="text-center">
                      No Tasks found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <>
                  <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                    <TableRow>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Task Name</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Type of Task</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Task Skill</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Org Unit</TableHead>
                      <TableHead className="text-black font-semibold whitespace-nowrap">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                      tasks.map((task) => (
                        <TableRow key={task.id} className="bg-muted/30" onDoubleClick={() => handleRowDoubleClick(task)} style={{ cursor: "pointer" }} >
                          <TableCell data-label="Task Name" className="p-4 md:p-6">{task.name}</TableCell>
                          <TableCell data-label="Type of Task" className="p-4 md:p-6">{getTaskTypeNameById(task.typeId)}</TableCell>
                          <TableCell data-label="Task Skill" className="p-4 md:p-6">{getTaskSkillsNameById(task.skillId)}</TableCell>
                          <TableCell data-label="Org Unit" className="p-4 md:p-6">{getUnitNameById(task.unitId)}</TableCell>
                          <TableCell data-label="Task Description" className="p-4 md:p-6">{task.description}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </>
              )}
            </Table>
          </div>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open) }}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsAddDialogOpen(false)}
              className="sm:max-w-[600px] max-w-md md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task to the repository.</DialogDescription>
            </DialogHeader>
            <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
                  <div className="h-[calc(100%-72px)] flex-grow-1 overflow-y-auto">
                    <div className="grid gap-2 mb-2">
                      <FormField control={form.control} name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">Task Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input className="h-12 rounded-md border border-input" placeholder="Enter Task Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2 mb-2">
                      <FormField control={form.control} name="typeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">Task Type <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full h-12 rounded-md border border-input">
                                  <SelectValue className="w-full" placeholder="Select Task Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                {taskTypes.map((tt) => (
                                  <SelectItem className="w-full" key={tt.value} value={tt.value}>
                                    {tt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2 mb-2">
                      <FormField control={form.control} name="skillId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">Task Skill <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-md border border-input">
                                  <SelectValue placeholder="Select Task Skill" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                {taskSkills.map((ts) => (
                                  <SelectItem className="w-full" key={ts.value} value={ts.value}>
                                    {ts.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2 mb-2">
                      <FormField control={form.control} name="unitId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">Org Unit <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-md border border-input">
                                  <SelectValue placeholder="Select Org Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                {units.map((u) => (
                                  <SelectItem className="w-full" key={u.value} value={u.value}>
                                    {u.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2 mb-2">
                      <FormField control={form.control} name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">Task Description</FormLabel>
                            <FormControl>
                              <Textarea className="h-12 rounded-md border border-input" placeholder="Enter Task Description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter className="py-4">
                    <Button variant="outline" onClick={() => { setIsAddDialogOpen(false) }} >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
              </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open) }}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsEditDialogOpen(false)}
              className="max-w-md md:max-h-[85dvh] min-h-[85dvh] md:h-[85dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task details</DialogDescription>
            </DialogHeader>
            <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-2">
                    <FormField control={form.control} name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-0 mt-0">
                          <FormLabel className="text-sm font-medium leading-none">Task Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input className="h-12 rounded-md border border-input" placeholder="Enter Task Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormField control={form.control} name="typeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium leading-none">Task Type <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-md border border-input">
                                <SelectValue placeholder="Select Task Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {taskTypes.map((tt) => (
                                <SelectItem key={tt.value} value={tt.value}>
                                  {tt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormField control={form.control} name="skillId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium leading-none">Task Skill <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-md border border-input">
                                <SelectValue placeholder="Select Task Skill" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {taskSkills.map((ts) => (
                                <SelectItem key={ts.value} value={ts.value}>
                                  {ts.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormField control={form.control} name="unitId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium leading-none">Org Unit <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-md border border-input">
                                <SelectValue placeholder="Select Org Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormField control={form.control} name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium leading-none">Task Description</FormLabel>
                          <FormControl>
                            <Textarea className="h-12 rounded-md border border-input" placeholder="Enter Task Description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                <DialogFooter className="py-4">
                  <Button variant="outline" onClick={() => { setIsEditDialogOpen(false) }} >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Task Repository Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteDialogOpen(false)}
              className="dark:bg-modal max-w-full sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Task Repository</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this Task Repository? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="pb-4 pt-2">
                <p className="text-sm/10 leading-[1.4] mb-3">
                  You are about to delete: <strong>{selectedTask.name}</strong>
                </p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProjectRepo} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Task Repository Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewOpen(false)}
              className="sm:max-w-[600px] max-w-md md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
            <DialogHeader className="px-2 md:px-6 py-6 border-b">
              <DialogTitle>Task Repository Details</DialogTitle>
              <DialogDescription>View details of the selected task repository.</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="h-full space-y-4 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Task Name</Label>
                    <p className="text-sm">{selectedTask.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Task Type</Label>
                    <p className="text-sm">{getTaskTypeNameById(selectedTask.typeId)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Task Skill</Label>
                    <p className="text-sm">{getTaskSkillsNameById(selectedTask.skillId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Org Unit</Label>
                    <p className="text-sm">{getUnitNameById(selectedTask.unitId)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedTask.description || "No description provided."}</p>
                </div>
              </div>
            )}
            <DialogFooter  className="px-2 md:px-6 py-4 gap-2">
                <Button variant="default"
                  onClick={() => {
                    setIsViewOpen(false)
                    handleEditTask(selectedTask)
                  }}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive"
                  onClick={() => {
                    deleteTask(selectedTask)
                  }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
