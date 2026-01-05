"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, Search, AlertTriangle, User, Activity } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TaskTrackingPage() {

  const {isAuthenticated, isAuthLoading} = useAuth();
  const [tasks, setTasks] = useState<any[]>([])
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tabFilter, setTabFilter] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [departmentDetails, setDepartmentDetails] = useState<any[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<any[]>([]);
  const [users, setUsers] = useState<[string, string][]>([]);
  const [filteredUsers, setFilteredUsers] = useState<[string, string][]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [units, setUnit] = useState<{ value: string; label: string }[]>([]);
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [projectsFilter, setProjectsFilter] = useState<string>("");
  const [filtersReady, setFiltersReady] = useState(false);
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 3).length
  const inProgressTasks = tasks.filter((task) => task.status === 2).length
  const notStartedTasks = tasks.filter((task) => task.status === 1).length
  const delayedTasks = tasks.filter((task) => task.status === "Delayed" || task.status === "Overdue").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const averageProgress = 0 // totalTasks > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks) : 0

  const router = useRouter();
  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });

  const ALL_OPTION_ID = "000000000000000000000000";

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

  // Get Departments
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565ce0f70897486c46852f",
      setState: setDepartments,
      defaultLabel: "Departments",
    });
  }, []);

  useEffect(() => {
    if (departments.length > 0 && !departmentFilter) {
      setDepartmentFilter(departments[0].value);
    }
  }, [departments, departmentFilter]);

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
      if (defaultLabel == 'Departments') {
        setDepartmentDetails(response.data?.data || []);
        setFilterDepartment(response.data?.data || []);
      }
      const formattedData = rawData.map((item: any) => ({
        value: item.id,
        label: item.detail?.name || "",
      }));
      setState([...formattedData]);
    } catch (error) {
      notification.error(`Failed to load ${defaultLabel}.`);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjectsName();
  }, []);

  // Get Assign To
  const fetchUsers = async () => {
    try {
      const response = await apiService.get({
        path: api_url.authServices.users.technicianList,
        isAuth: true,
      });
      const repoObj = response.data?.data || {};
      const entries: [string, string][] = Object.entries(repoObj).map(([name, id]) => [name, String(id)]);
      setUsers(entries);
      setFilteredUsers(entries);
    } catch (err) {
      setUsers([]);
      setFilteredUsers([]);
    }
  };
  
  const searchUsers = (searchValue: string) => {
    setSearchValue(searchValue);
    const filtered = users.filter(([name]) =>
      name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Get Project Names
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

  // Task Listing 
  // Filter Set All
  useEffect(() => {
    const allFetched = [units, departments, users, projects].every(arr => Array.isArray(arr));
    const allSelected = unitFilter && departmentFilter && projectsFilter;
    if (allFetched && allSelected) {
      setFiltersReady(true);
    }
  }, [units, departments, users, projects, unitFilter, departmentFilter, projectsFilter]);

  const buildFilterQuery = () => {
    const query: any = {};
    if (unitFilter && unitFilter !== ALL_OPTION_ID) {
      query.unitId = unitFilter;
    }
    if (departmentFilter && departmentFilter !== ALL_OPTION_ID) {
      query.departmentId = departmentFilter;
    }
    if (selectedAssignee && selectedAssignee !== ALL_OPTION_ID) {
      query.assignTo = selectedAssignee;
    }
    
    if (projects.length > 0) {
      const projectIds = projects.filter(p => p.value !== ALL_OPTION_ID).map(p => p.value);
      query.projectId = projectIds;
    }
    if (projectsFilter && projectsFilter !== ALL_OPTION_ID) {
      query.projectId = projectsFilter;
    }
    return query;
  };

  const buildStatusWiseFilter = () => {
    const query: any = {};
    if (tabFilter && tabFilter !== "all") {
      switch (tabFilter) {
        case "in-progress":
          query.status = 2;
          break;
        case "completed":
          query.status = 3;
          break;
        case "not-started":
          query.status = 1;
          break;
        case "delayed":
          query.status = ["Delayed", "Overdue"];
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
    if (filtersReady) {
      fetchTaskList();
    }
  }, [page, searchTerm, projectsFilter, unitFilter, departmentFilter, selectedAssignee, filtersReady, tabFilter]);

  useEffect(() => {
    setPage(0);
    setTasks([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, projectsFilter, unitFilter, departmentFilter, selectedAssignee, tabFilter]);

  const fetchTaskList = async () => {
    setIsLoading(true);
    try {
      const filters = buildFilterQuery();
      const statusFilter = buildStatusWiseFilter();
      const requestData: any = {
        ...getPaginatedRequestParams(page, pageSize),
        searchText: searchTerm || undefined,
      };
      if (Object.keys(filters).length > 0) {
        requestData.refFilter = filters;
      }
      if (Object.keys(statusFilter).length > 0) {
        requestData.query = statusFilter;
      }
      const response = await apiService.post({
        path: api_url.worCoorService.task.taskTracking.list,
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
      notification.error("Failed to load task tracking list.");
    } finally {
      setIsLoading(false);
    }
  }

  // ########## General Functions ##########

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault()
    // Add context menu functionality here
    console.log(`Right-clicked on ${taskId}`)
  }

  // Helper function to get status badge color
  const getStatusBadge = (task: { status: number, delayed?: boolean, overDue?: boolean }) => {
    const { status, delayed, overDue } = task;
    if (status === 3 && delayed) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Delayed</Badge>
      );
    }
    if (status === 3 && overDue) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>
      );
    }
    switch (status) {
      case 3:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
        );
      case 2:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>
        );
      case 1:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Not Started</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Helper function to get time progress color
  const getTimeProgressColor = (elapsed: number, expected: number) => {
    const percentage = (elapsed / expected) * 100
    return percentage > 100 ? "bg-red-500" : "bg-blue-500"
  }

  if (isAuthLoading || !isAuthenticated) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Task Tracking" icon={Activity}
        description="Monitor and update task progress and completion status"
      />

      {/* Task Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Tasks</CardTitle>
            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalTasks}</div>
            <p className="text-xs text-blue-600">All assigned manufacturing tasks</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completion Rate</CardTitle>
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{completionRate}%</div>
            <Progress value={completionRate} className="h-2 bg-green-100" />
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Average Progress</CardTitle>
            <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{averageProgress}%</div>
            <Progress value={averageProgress} className="h-2 bg-purple-100" />
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Delayed Tasks</CardTitle>
            <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{delayedTasks}</div>
            <p className="text-xs text-amber-600">Tasks behind schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-center md:justify-between w-full">
        <div className="w-full block  md:flex flex-1 items-center gap-2">
          <div className="relative mb-2 md:mb-auto w-auto">
            <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
            <Input type="search" placeholder="Search tasks..."
              value={rawSearchTerm} onChange={(e) => setRawSearchTerm(e.target.value)}
              className="w-[160px] h-11 bg-background border border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
            />
          </div>
          <div className="relative mb-2 md:mb-auto w-auto">
            <Select value={selectedAssignee} 
              onValueChange={(value) =>
                setSelectedAssignee(value === "none" ? "" : value)
              }
            >
              <SelectTrigger className="w-[160px] h-11 bg-background text-muted-foreground border border-input rounded-xl text-left pl-8">
                  <User className="absolute text-muted-foreground left-1 pl-1 z-1" size="22" />
                <SelectValue placeholder="Assigned to..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="p-2">
                  <Input type="search" placeholder="Search by name..."
                    value={searchValue} onChange={(e) => searchUsers(e.target.value)}
                    className="h-9 text-sm bg-muted rounded-md "
                  />
                </div>
                {/* Clear option */}
                <SelectItem value="none" className="py-2.5">None</SelectItem>
                <div className="max-h-[200px] overflow-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(([name, id]) => (
                      <SelectItem key={id} value={id} className="py-2.5">
                        {name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-muted-foreground text-sm">No users found</div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-row flex-wrap  gap-2 md:flex-row sm:items-center ml-auto justify-end">
          <div className="relative w-[160px]">
            <Select value={projectsFilter} onValueChange={setProjectsFilter}>
              <SelectTrigger  className={`peer w-full bg-background border text-left border-input 
                      focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}
                  >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                {projects.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No project found</div>
                ) : (
                  projects.map((p) => (
                    <SelectItem className="w-full" key={p.value} value={p.value}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
              <label
               className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                    transition-all duration-200 bg-background px-1
                    peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                    ${departmentFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                  `}>
                Projects
              </label>
          </div>
          <div className="relative w-[160px]">
            <Select value={unitFilter} onValueChange={(value) => {
              setUnitFilter(value);
              if (value === "000000000000000000000000") {
                setFilterDepartment(departmentDetails);
              } else {
                const matched = departmentDetails.filter(
                  (dept) => dept.detail.unitId === value
                );
                setFilterDepartment(matched);
              }
            }}>
              <SelectTrigger  className={`peer w-full bg-background border text-left border-input 
                      focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}
                  >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                {units.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No org unit found</div>
                ) : (
                  units.map((u) => (
                    <SelectItem className="w-full" key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <label
               className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                    transition-all duration-200 bg-background px-1
                    peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                    ${unitFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                  `}>
              Org Unit
            </label>
          </div>
          <div className="relative w-[160px]">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className={`peer w-full bg-background border text-left border-input 
                      focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}
                  >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                {filterDepartment.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No departments found</div>
                ) : (
                  filterDepartment.map((d) => (
                    <SelectItem className="w-full" key={d.id} value={d.id}>
                      {d.detail.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
              <label
                 className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                    transition-all duration-200 bg-background px-1
                    peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                    ${departmentFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                  `}>
                Department
              </label>
          </div>
        </div>
      </div>

      {/* Task Tracking Listing */}
      <Tabs value={tabFilter} onValueChange={(value) => { setTabFilter(value); }} className="w-full">
        <TabsList className="w-full flex justify-start h-14 bg-gray-200 p-0 dark:bg-gray-900 overflow-y-auto rounded-xl dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  scrollbar-thumb-hover dark-scrollbar-thumb-hover dark:[&::-webkit-scrollbar]y:w-[4px] [&::-webkit-scrollbar]:h-[2px] mb-4">
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="all">All</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="completed">Completed</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="not-started">Not Started</TabsTrigger>
          <TabsTrigger className="w-full h-fill-available transition-transform m-[5px] duration-800 px-8 data-[state=active]:bg-darkblue-foreground rounded-lg  data-[state=active]:text-gray-50 dark:data-[state=active]:bg-gray-600 hover:bg-gray/300" value="delayed">Delayed</TabsTrigger>
        </TabsList>
      

        <TabsContent value={tabFilter} className="mt-4">
          <div ref={scrollContainerRef} className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto">
            <Table className="responsive-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black font-semibold whitespace-nowrap  min-w-[200px]">Project</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap">Task Name</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap">Assigned To</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap">Deadline</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap">Progress</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap">Time Elapsed</TableHead>
                  <TableHead className="text-black font-semibold whitespace-nowrap min-w-[50px]">Expected Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const timeProgressPercentage = (task.timeElapsed / task.expectedTime) * 100
                    return (
                      <TableRow key={task.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        onContextMenu={(e) => handleContextMenu(e, task.id)}
                      >
                        <TableCell className="p-4 md:p-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{getprojectsNameById(task.projectId)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-4 md:p-6 font-medium">{task.taskName ? task.taskName : "-"}</TableCell>
                        <TableCell className="p-4 md:p-6">{task.assignToName}</TableCell>
                        <TableCell className="p-4 md:p-6 whitespace-nowrap">
                          {task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '-'}
                        </TableCell>

                        <TableCell className="p-4 md:p-6 whitespace-nowrap">{getStatusBadge(task)}</TableCell>

                        <TableCell className="p-4 md:p-6">
                          <div className="flex items-center gap-2 w-[100px]">
                            <div className="relative w-full h-2 bg-gray-200 rounded">
                              <div
                                className={`absolute top-0 left-0 h-2 rounded ${getTimeProgressColor(task.elapsedDuration, task.estimatedDuration)}`}
                                style={{ width: `${(task.elapsedDuration / task.estimatedDuration) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs whitespace-nowrap">
                              {Math.round((task.elapsedDuration / task.estimatedDuration) * 100)}%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="p-4 md:p-6">
                          <span className={`text-xs ${task.elapsedDuration > task.estimatedDuration ? "text-red-500 font-bold" : ""}`}>
                            {task.elapsedDuration} mins
                          </span>
                        </TableCell>

                        <TableCell className="p-4 md:p-6">
                          <span className="text-xs">
                            {task.estimatedDuration} mins
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}