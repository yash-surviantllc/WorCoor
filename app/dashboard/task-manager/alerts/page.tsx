"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { format } from "date-fns"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const durationRegex = /^((\d+)h\s*)?((\d+)m)?$/;

const FormSchema = z.object({
  taskId: z.string().min(1, "Task name is required"),
  assignTo: z.string().min(1, "Assigned To is required"),
  assignToName: z.string().optional(),
  startDate: z.string().min(1, "Start Date is required"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .regex(durationRegex, "Invalid format. Use: 1h 15m"),
})

type FormValues = z.infer<typeof FormSchema>

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  alertId: string;
}

export default function TaskAlertsPage() {

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      taskId: "",
      assignTo: "",
      assignToName: "",
      startDate: "",
      duration: "",
    },
  });

  const {isAuthenticated, isAuthLoading} = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tabFilter, setTabFilter] = useState("all");
  const [taskRepos, setTaskRepos] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [projectsFilter, setProjectsFilter] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ visible: false, x: 0, y: 0, alertId: "" })

  const router = useRouter();
  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });
  const tabTriggerClass = "w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300";
  const ALL_OPTION_ID = "000000000000000000000000";
  
  // Auth Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

   // Get Project Names
  useEffect(() => {
    fetchProjectsName();
  }, []);

  const fetchProjectsName = async () => {
    try {
      const response = await apiService.get({
        path: `${api_url.worCoorService.task.taskTracking.getProjectNames}?ongoing=true`,
        isAuth: true,
      });
      const repoObj = response.data?.data || {};
      const projectsArray = Object.entries(repoObj).map(([key, value]) => ({
        value: key,
        name: value as string,
      }));
      const allProject = { value: ALL_OPTION_ID, name: "All" };
      setProjectsFilter(ALL_OPTION_ID);
      setProjects([allProject, ...projectsArray]);
    } catch (err) {
      setProjects([]);
    }
  };

  const getprojectsNameById = (id: string): string => {
    const project = projects.find((d) => d.value === id);
    return project ? project.name : "-";
  };

  // Get Task Repository
  useEffect(() => {
    const fetchTaskRepo = async () => {
      try {
        const response = await apiService.get({
          path: api_url.worCoorService.task.assignTask.taskNameList,
          isAuth: true
        });
        const repoObj = response.data?.data || {};
        setTaskRepos(repoObj);
      } catch (error) {
        setTaskRepos([]);
      }
    };
    fetchTaskRepo();
  }, []);

  // Get Technicians
  const fetchTechnicians = async (taskId: string) => {
    setTechnicians([]);
    try {
      const response = await apiService.get({
        path: `${api_url.worCoorService.task.assignTask.technicians}/${taskId}`,
        isAuth: true,
      });
      const repoObj = response.data?.data || {};
      setTechnicians(repoObj);
    } catch (err) {
      setTechnicians([]);
    }
  }

  // ########## Task Alerts Listing ########## //
  const buildStatusWiseFilter = () => {
    const query: any = {};
    if (tabFilter && tabFilter !== "all") {
      switch (tabFilter) {
        case "unassigned":
          query.alertStatus = 1;
          break;
        case "assigned":
          query.alertStatus = 2;
          break;
        case "closed":
          query.alertStatus = 3;
          break;
      }
    }
    return query;
  }

  // Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);

  // Task Repository Listing
  useEffect(() => {
    fetchTaskAlertList();
  }, [page, searchTerm, tabFilter]);

  useEffect(() => {
    setPage(0);
    setAlerts([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, tabFilter]);

  const fetchTaskAlertList = async () => {
    setIsLoading(true);
    try {
      const statusFilter = buildStatusWiseFilter();
      const requestData: any = {
        ...getPaginatedRequestParams(page, pageSize),
        searchText: searchTerm || undefined,
      };
      if (Object.keys(statusFilter).length > 0) {
        requestData.query = statusFilter;
      }
      requestData.query = {
        ...requestData.query,
        "type": 2
      };
    
      const response = await apiService.post({
        path: api_url.worCoorService.task.taskAlert.list,
        data: requestData,
        isAuth: true,
      });

      const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
      const totalCount = response.data?.data?.total || 0;
      setAlerts((prev) => {
        const merged = [...prev, ...list];
        const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setHasMore(uniqueById.length < totalCount);
        return uniqueById;
      });
    } catch (error) {
      setHasMore(false);
      notification.error("Failed to load task tracking list.");
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const startDateISO = new Date(data.startDate).toISOString();
    try {
      const reqBody = {
        id: selectedAlert.id,
        taskId: data.taskId,
        assignTo: data.assignTo,
        assignToName: data.assignToName,
        startDate: startDateISO,
        duration: parseDurationToMinutes(data.duration)
      };

      const response = await apiService.post({
        path: api_url.worCoorService.task.taskAlert.assignTask,
        isAuth: true,
        data: reqBody,
      });

      if (response.data.status === "OK") {
        notification.success(response.data.message);
        setAssignDialogOpen(false);
        form.reset();
        setPage(0);
        setAlerts([]);
        setHasMore(true);
        setIsLoading(false);
        await fetchTaskAlertList();
      } else {
        notification.error(response.data.message);
      }
    } catch (error) {
      notification.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ########## General Functions ########## //
  // Helper function for status badges
  const getAlertStatusBadge = (status:number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Not Assigned
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Assigned
          </Badge>
        )
      case 3:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Closed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const formattedDate = `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
    const formattedTime = `${pad(hours)}:${minutes} ${ampm}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, alertId: "" })
  }

  const handleAssignTicket = () => {
    const alert = alerts.find((a) => a.id === contextMenu.alertId)
    if (alert) {
      setSelectedAlert(alert)
      // setFormData({
      //   ...formData,
      //   sourceProjectName: alert.sourceProject,
      //   sourceTaskName: alert.sourceTaskName,
      // })
    }
    setContextMenu({ visible: false, x: 0, y: 0, alertId: "" })
    setAssignDialogOpen(true)
  }

  // Close context menu when clicking outside
  const handleDocumentClick = (e: React.MouseEvent) => {
    if (contextMenu.visible) {
      handleCloseContextMenu()
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"> Planned </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"> Active </Badge>
        )
      case 3:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"> Completed </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // AlertsTable component to display alert data
  function AlertsTable({
    alerts,
    onContextMenu,
  }: {
    alerts: any[];
    onContextMenu: (e: React.MouseEvent, alertId: string) => void;
  }) {
    return (
      <div ref={scrollContainerRef} className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto">
        <Table className="responsive-table">
          <TableHeader>
            <TableRow>
              <TableHead className="text-black font-semibold whitespace-nowrap">Raised By</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Raised On (Date & Time)</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Description</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Source Project</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Source Task Name</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Alert Status</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Assigned To</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Assigned Task Name</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Assigned Task Status</TableHead>
              <TableHead className="text-black font-semibold whitespace-nowrap">Resolution Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  onContextMenu={(e) => onContextMenu(e, alert.id)}
                >
                  <TableCell>{alert.createdByName || '-'}</TableCell>
                  <TableCell>{alert.createdAt ? formatDateTime(alert.createdAt) : '-'}</TableCell>
                  <TableCell>{alert.description}</TableCell>
                  <TableCell>{getprojectsNameById(alert.projectId)}</TableCell>
                  <TableCell>{alert.sourceTaskName}</TableCell>
                  <TableCell className="whitespace-nowrap text-center">
                    {getAlertStatusBadge(alert.alertStatus)}
                  </TableCell>
                  <TableCell>{alert.assignToName || '-'}</TableCell>
                  <TableCell>{alert.taskName || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap text-center">{ alert.assignToName ? getStatusBadge(alert.status): '-'} </TableCell>
                  <TableCell>{alert.completeNote || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  No tasks alerts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  }

  const handleContextMenu = (e: React.MouseEvent, alertId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      alertId,
    });
  }

  const getNowFormatted = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  };

  // Convert Duration
  const parseDurationToMinutes = (durationStr: string): number => {
    const regex = /(\d+)\s*(w|d|h|m)/g;
    let totalMinutes = 0;
    let match;
    while ((match = regex.exec(durationStr)) !== null) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      switch (unit) {
        case 'w':
          totalMinutes += value * 7 * 24 * 60;
          break;
        case 'd':
          totalMinutes += value * 24 * 60;
          break;
        case 'h':
          totalMinutes += value * 60;
          break;
        case 'm':
          totalMinutes += value;
          break;
        default:
          break;
      }
    }
    return totalMinutes;
  };

  if (isAuthLoading || !isAuthenticated) return null;

  return (
    <div className="alert h-[calc(100vh-3rem)] flex flex-col gap-2" onClick={handleDocumentClick}>
      <div className="flex items-center pb-2 sm:pb-4">
        <PageHeader 
        title="Task Alert" 
        description="Receive alerts from team members facing task issues and assign support accordingly." 
        icon={AlertTriangle} />
      </div>
      {/* Tab Filters */}
      <div className="flex-1 overflow-auto">
        <Tabs value={tabFilter} onValueChange={(value) => { setTabFilter(value); }} className="w-full">
          <TabsList className="w-full flex justify-start h-14 bg-gray-200 p-0 dark:bg-gray-900 overflow-y-auto dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  scrollbar-thumb-hover dark-scrollbar-thumb-hover dark:[&::-webkit-scrollbar]y:w-[4px] [&::-webkit-scrollbar]:h-[2px]">
            <TabsTrigger className={tabTriggerClass} value="all">All</TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="unassigned">Not Assigned</TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="assigned">Assigned</TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="closed">Closed</TabsTrigger>
          </TabsList>
          <TabsContent value={tabFilter} className="mt-4">
            <AlertsTable alerts={alerts} onContextMenu={handleContextMenu} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div className="fixed z-50 min-w-[180px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <div className="px-2">
            <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-md transition-all duration-200 flex items-center gap-3 group"
              onClick={handleAssignTicket}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Assign Ticket</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Create task to resolve alert</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Assign Ticket Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setAssignDialogOpen(false)}
          className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
          <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>Add or assign task alert ticket</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="h-full space-y-4" onSubmit={form.handleSubmit(onSubmit)} onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}>
              <div className="h-full space-y-4 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
                <div className="grid grid-cols-2 gap-4 py-1">
                  <div>
                    <Label className="text-sm font-medium">Source Project Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedAlert?.projectId ? getprojectsNameById(selectedAlert?.projectId) : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium ">Source Task Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedAlert?.taskName || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 py-1">
                  <div>
                    <Label className="text-sm font-medium ">Alert Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedAlert?.description || 'No description provided.'}</p>
                  </div>
                </div>
                {/* Assign Forms */}
                <div className="border border-blue-500 rounded-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Task */}
                    <div className="relative grid gap-2">
                      <FormField control={form.control} name="taskId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">Task Name <span className="text-destructive">*</span></FormLabel>
                            <Select value={field.value} onValueChange={(value) => {
                              field.onChange(value); fetchTechnicians(value)
                            }}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                  <SelectValue placeholder="Select Task Name" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {Object.entries(taskRepos).map(([name, id]) => (
                                  <SelectItem key={id} value={id} className="py-2.5">
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Assign To */}
                    <div className="grid gap-2">
                      <FormField control={form.control} name="assignTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none">
                              Assign To <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selectedName = Object.entries(technicians).find(([name, id]) => id === value)?.[0] || "";
                                form.setValue("assignToName", selectedName, {
                                  shouldValidate: false,
                                  shouldDirty: true,
                                });
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                  <SelectValue placeholder="Select Assign To" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {Object.keys(technicians).length === 0 ? (
                                  <SelectItem value="__no_users__" disabled className="py-2.5 text-muted-foreground">
                                    No users found
                                  </SelectItem>
                                ) : (
                                  Object.entries(technicians).map(([name, id]) => (
                                    <SelectItem key={id} value={id} className="py-2.5">
                                      {name}
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
                      <FormField control={form.control} name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium leading-none ">Start Date & Time <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="w-full flex">
                              <Input className="!w-full h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                                id="start-date-time" type="datetime-local"
                                min={getNowFormatted()}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <TooltipProvider>
                        <FormField control={form.control} name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className=" text-sm font-medium leading-none relative">
                                  Duration [Format: 1h 15m]<span className="text-destructive">*</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-[12px] w-[12px] min-h-[12px] min-w-[12px] max-h-[12px] max-w-[12px] ml-1 absolute top-[4px] right-[-1rem]"></Info>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Use the format: 1h 15m</p>
                                      <ul>
                                        {/* <li>w = weeks</li>
                                        <li>d = days</li> */}
                                        <li>h = hours</li>
                                        <li>m = minutes</li>
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                              {/* </div> */}
                              </FormLabel>
                              <FormControl>
                                <Input type="text" className="h-12 rounded-md border border-input" placeholder="Enter Task Duration" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TooltipProvider>
                  </div>
                  </div>
                </div>

                <DialogFooter className="py-4 gap-2">
                  <Button type="button" variant="outline"
                    onClick={() => {
                      setAssignDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Assigning..." : "Assign Ticket"}
                  </Button>
                </DialogFooter>

              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}