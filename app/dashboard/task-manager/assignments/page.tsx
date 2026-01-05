"use client"

import React from "react"
import { useState, useEffect } from "react"
import { AlertTriangle, Plus, Search, Trash, Users, Trash2, Edit, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import type { AuthData } from '@/src/utils/AuthContext'
import localStorageService from '@/src/services/localStorageService'
import Multiselect from 'multiselect-react-dropdown';
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const durationRegex = /^((\d+)h\s*)?((\d+)m)?$/;

// Task schema factory (conditionally validates stEndDate)
const createTaskSchema = (scheduleType: string) =>
  z
    .object({
      taskId: z.string().min(1, "Task name is required"),
      stStartDate: z.string().min(1, "Start Date is required"),
      stEndDate: z.string().optional(),
      estimatedDuration: z
        .string()
        .min(1, "Duration is required")
        .regex(durationRegex, "Invalid format. Use: 1h 15m"),
      dependentTask: z.array(z.string()),
      taskScheduleType: z.string().optional(),
      assignToId: z.string().min(1, "Assigned To is required"),
      assignToName: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (scheduleType === "2" && !data.stEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End Date is required.",
          path: ["stEndDate"],
        });
      }
    });

// Static schema for project-level validation (enforce full task validation)
const taskSchemaForProject = createTaskSchema("2");

//  Project schema
const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Project name is required" }),
  typeId: z.string().min(1, { message: "Please select a project type." }),
  scheduleType: z.string().min(1, { message: "Please select a schedule type." }),
  unitId: z.string().min(1, { message: "Please select a unit." }),
  departmentId: z.string().min(1, { message: "Please select a department." }),
  startDate: z.string().min(2, { message: "Start Date & Time is required." }),
  endDate: z.string().min(2, { message: "End Date & Time is required." }),
  description: z.string().optional(),
  taskLists: z.array(taskSchemaForProject).optional(),
});

export default function TaskAssignmentPage() {

  // Type inference
  type ProjectFormValues = z.infer<typeof projectFormSchema>;
  type TaskFormValues = z.infer<ReturnType<typeof createTaskSchema>>;

  // Form for full project
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      typeId: "",
      scheduleType: "1",
      unitId: "",
      departmentId: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const scheduleType = form.watch("scheduleType");

  const subTaskForm = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema(scheduleType)),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      taskId: "",
      stStartDate: "",
      stEndDate: "",
      estimatedDuration: "",
      dependentTask: [],
      assignToId: "",
      assignToName: "",
    },
  });

  const {isAuthenticated, isAuthLoading} = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectTypes, setProjectTypes] = useState<{ value: string; label: string }[]>([])
  const [units, setUnit] = useState<{ value: string; label: string }[]>([])
  const [unitFilter, setUnitFilter] = useState<string>("")
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])
  const [departmentFilter, setDepartmentFilter] = useState<string>("")
  const [departmentDetails, setDepartmentDetails] = useState<any[]>([])
  const [filterDepartment, setFilterDepartment] = useState<any[]>([])
  const [taskRepos, setTaskRepos] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add")
  const [userData, setUserData] = useState<AuthData['userData'] | null>(null);
  const [dependentTaskList, setDependentTaskList] = useState<any[]>([]);
  const [taskToDeleteIndex, settaskToDeleteIndex] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [initialTaskLists, setInitialTaskLists] = useState<any[]>([]);
  const [startTouched, setStartTouched] = useState(false);
  const [endTouched, setEndTouched] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const authData = localStorageService.getItem<AuthData>('authData');
    if (authData?.userData) {
      setUserData(authData.userData);
    }
  }, []);

  // Auth Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });

  const scheduleTypes = [{ value: "1", label: "One-time" }, { value: "2", label: "Repetitive Schedule" }];
  const taskScheduleTypes = [{ value: "1", label: "Daily" }, { value: "2", label: "Weekly" }, { value: "3", label: "Monthly" }];
  const selectedScheduleType = form.watch('scheduleType');
  const selectedProjectScheduleType = subTaskForm.watch('taskScheduleType');
  const projectStartDate = form.watch('startDate');
  const projectEndDate = form.watch('endDate');
  const { fields: subTaskFields, append: appendSubTask, remove: removeSubTask } = useFieldArray({ control: form.control, name: "taskLists" })

  // Get Project Type
  useEffect(() => {
    fetchDropdownOptions({ apiId: "68565dbcf70897486c468536", setState: setProjectTypes, defaultLabel: "ProjectTypes" });
  }, []);

  const getProjectTypeNameById = (id: string): string => {
    const projectType = projectTypes.find(pt => pt.value === id);
    return projectType ? projectType.label : "-";
  };

  // Get Org Units
  useEffect(() => {
    fetchDropdownOptions({ apiId: "68565c5df70897486c46852e", setState: setUnit, defaultLabel: "Units" });
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

  // Get Departments
  useEffect(() => {
    fetchDropdownOptions({ apiId: "68565ce0f70897486c46852f", setState: setDepartments, defaultLabel: "Departments" });
  }, []);

  useEffect(() => {
    if (departments.length > 0 && !departmentFilter) {
      setDepartmentFilter(departments[0].value);
    }
  }, [departments, departmentFilter]);

  const getDepartmentsNameById = (id: string): string => {
    const department = departments.find(d => d.value === id);
    return department ? department.label : "-";
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
      if (defaultLabel == 'Departments') {
        setDepartmentDetails(response.data?.data || []);
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

  const getTaskNameById = (id: string) => Object.entries(taskRepos).find(([name, taskId]) => taskId === id)?.[0] || id;

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

  const getScheduleTypeLabel = (value: string) => {
    const match = scheduleTypes.find((item) => item.value == value);
    return match ? match.label : "-";
  }

  const getTaskScheduleTypeLabel = (value?: string) => {
    if (!value) return "-";
    const match = taskScheduleTypes.find((item) => item.value === value);
    return match ? match.label : "-";
  };

  // ########## Add/Update Project and Task ########## //
  const handleAssignTask = (mode: "add" | "edit" | "view", project?: any) => {
    setFormMode(mode);
    setIsCreateDialogOpen(true);

    if (mode === "add") {
      setInitialFormData({
        name: "",
        typeId: "",
        scheduleType: "1",
        unitId: "",
        departmentId: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setInitialTaskLists([]);
      form.reset({
        name: "",
        typeId: "",
        scheduleType: "1",
        unitId: "",
        departmentId: "",
        startDate: "",
        endDate: "",
        description: "",
        taskLists: [],
      });
      setDependentTaskList([]);
    }

    if (mode === "edit" && project) {
      setSelectedProject(project);
      const transformedTaskLists = (project.taskLists || []).map((task: any) => ({
        taskId: task.taskId || "",
        stStartDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 16) : "",
        stEndDate: task.endDate ? new Date(task.endDate).toISOString().slice(0, 16) : "",
        estimatedDuration: task.estimatedDuration ? convertMinutesToDurationString(task.estimatedDuration) : "",
        dependentTask: task.dependentTask || [],
        assignToId: task.assignToId || "",
        assignToName: task.assignToName || "",
        taskScheduleType: task.scheduleType ? task.scheduleType.toString() : undefined,
      }));
      form.reset({
        name: project.name || "",
        typeId: project.typeId || "",
        scheduleType: project.scheduleType?.toString() || "1",
        unitId: project.unitId || "",
        departmentId: project.departmentId || "",
        startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 16) : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 16) : "",
        description: project.description || "",
        taskLists: transformedTaskLists,
      });
      setDependentTaskList(transformedTaskLists);
      setInitialFormData({
        name: project.name || "",
        typeId: project.typeId || "",
        scheduleType: project.scheduleType?.toString() || "1",
        unitId: project.unitId || "",
        departmentId: project.departmentId || "",
        startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 16) : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 16) : "",
        description: project.description || "",
      });
      setInitialTaskLists(transformedTaskLists);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {

    if (data.taskLists?.length) {
      const startDateISO = new Date(data.startDate).toISOString();
      const endDateISO = new Date(data.endDate).toISOString();

      const convertedTaskLists = (data.taskLists || [])
        .sort((a, b) => new Date(a.stStartDate).getTime() - new Date(b.stStartDate).getTime())
        .map((subTask) => {
          const startDate = new Date(subTask.stStartDate);
          const durationMins = parseDurationToMinutes(subTask.estimatedDuration);
          const endDate = subTask.stEndDate
            ? new Date(subTask.stEndDate)
            : new Date(startDate.getTime() + durationMins * 60 * 1000);

          return {
            ...subTask,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(), // always populated for API
            estimatedDuration: durationMins,
            scheduleType: subTask.taskScheduleType ? parseInt(subTask.taskScheduleType, 10) : undefined
          };
        })

      if (formMode === "add") {
        setIsSubmitting(true);
        try {
          const reqBody = {
            name: data.name,
            typeId: data.typeId,
            scheduleType: parseInt(data.scheduleType, 10),
            unitId: data.unitId,
            departmentId: data.departmentId,
            startDate: startDateISO,
            endDate: endDateISO,
            description: data.description,
            taskLists: convertedTaskLists,
            createdByName: userData?.fullName
          };

          const response = await apiService.post({
            path: api_url.worCoorService.task.assignTask.addProject,
            isAuth: true,
            data: reqBody,
          });

          if (response.data.status === "OK") {
            notification.success(response.data.message);
            setIsCreateDialogOpen(false)
            setPage(0);
            setProjects([]);
            setHasMore(true);
            setIsLoading(false);
            await fetchProjectList();
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
            id: selectedProject.id,
            name: data.name,
            typeId: data.typeId,
            scheduleType: parseInt(data.scheduleType, 10),
            unitId: data.unitId,
            departmentId: data.departmentId,
            startDate: startDateISO,
            endDate: endDateISO,
            description: data.description,
            taskLists: convertedTaskLists,
            createdByName: userData?.fullName
          };

          const response = await apiService.put({
            path: api_url.worCoorService.task.assignTask.editProject,
            isAuth: true,
            data: reqBody,
          });

          if (response.data.status === "OK") {
            notification.success(response.data.message);
            setIsCreateDialogOpen(false)
            setPage(0);
            setProjects([]);
            setHasMore(true);
            setIsLoading(false);
            await fetchProjectList();
          } else {
            notification.error(response.data.message);
          }
        } catch (error) {
          notification.error("Something went wrong. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      notification.error("Please add at least one task.");
    }
  }

  const handleAddSubTask = () => {
    const projectStart = form.getValues("startDate");
    const projectEnd = form.getValues("endDate");

    if (!projectStart || !projectEnd) {
      notification.error("Please select valid Project Start and End Dates before adding a task.");
      return;
    }

    if (new Date(projectEnd) < new Date(projectStart)) {
      notification.error("Project End Date must be after Start Date. Please correct it before adding a task.");
      return;
    }

    subTaskForm.handleSubmit((validSubTask) => {
      const projectScheduleType = form.getValues("scheduleType");
      const selectedDependentTaskIds = validSubTask.dependentTask || [];
      const newStart = new Date(validSubTask.stStartDate);

      let newEnd: Date;

      if (projectScheduleType === "1") {
        const minutes = parseDurationToMinutes(validSubTask.estimatedDuration || "");
        if (!validSubTask.stStartDate || !minutes) {
          notification.error("Start date and valid duration are required.");
          return;
        }
        const localStart = new Date(validSubTask.stStartDate);
        const utcStart = new Date(localStart.getTime() - localStart.getTimezoneOffset() * 60000);
        newEnd = new Date(utcStart.getTime() + minutes * 60 * 1000);
        validSubTask.stEndDate = newEnd.toISOString().slice(0, 16);
      } else {
        if (!validSubTask.stEndDate) {
          notification.error("End date is required for repetitive schedule.");
          return;
        }
        newEnd = new Date(validSubTask.stEndDate);
      }

      // 1️. Time Overlap Check with dependent task
      const conflicting = subTaskFields.find((task) => {
        if (!selectedDependentTaskIds.includes(task.taskId)) return false;
        const existingStart = new Date(task.stStartDate);
        const existingEnd = new Date(task.stEndDate!);
        return newStart < existingEnd && newEnd > existingStart;
      });
      if (conflicting) {
        notification.error(
          `Task time overlaps with dependent task "${getTaskNameById(conflicting.taskId)}". Please adjust the time.`
        );
        return;
      }

      // 2️. Repetitive + Daily Date Match
      if (projectScheduleType === "2" && validSubTask.taskScheduleType === "1") {
        const newDateOnly = newStart.toISOString().split("T")[0];
        const mismatch = subTaskFields.find((task) => {
          return (
            selectedDependentTaskIds.includes(task.taskId) &&
            newDateOnly !== new Date(task.stStartDate).toISOString().split("T")[0]
          );
        });
        if (mismatch) {
          notification.error(
            `Daily task must be on the same date as its dependent task "${getTaskNameById(mismatch.taskId)}".`
          );
          return;
        }
      }

      // 3️. Shared Technician Conflict (if same technician across dependent tasks)
      if (validSubTask.assignToId) {
        const hasTimeConflictWithSameTechnician = subTaskFields.some((task) => {
          if (task.assignToId !== validSubTask.assignToId) return false;
          const existingStart = new Date(task.stStartDate);
          const existingEnd = new Date(task.stEndDate!);
          return newStart < existingEnd && newEnd > existingStart;
        });

        if (hasTimeConflictWithSameTechnician) {
          notification.error(
            `Technician "${validSubTask.assignToName}" has overlapping tasks during this time. Please choose a different time or technician.`
          );
          return;
        }
      }

      appendSubTask(validSubTask);
      setDependentTaskList((prev) => [...prev, validSubTask]);
      resetSubTaskForm();
    })();
  };

  const filteredDependentTaskList = dependentTaskList.filter((task) => {
    if (selectedScheduleType === "2" && selectedProjectScheduleType) {
      return task.taskScheduleType === selectedProjectScheduleType;
    }
    return true;
  });

  const handleRemoveSubTask = (index: number) => {
    settaskToDeleteIndex(index);
    setIsDeleteConfirmOpen(true);
  };

  const confirmRemoveSubTask = () => {
    if (taskToDeleteIndex !== null) {
      const taskLists = form.getValues("taskLists") || [];
      const removedTask = taskLists[taskToDeleteIndex];
      if (!removedTask) return;
      const removedTaskId = removedTask.taskId;
      // Remove from useFieldArray
      removeSubTask(taskToDeleteIndex);
      // Remove from dependentTaskList state
      setDependentTaskList((prev) => prev.filter((task) => task.taskId !== removedTaskId));
      // Clean up dependentTask in remaining tasks
      const updatedTaskLists = (form.getValues("taskLists") || []).map((task) => ({
        ...task,
        dependentTask: (task.dependentTask || []).filter((id: string) => id !== removedTaskId),
      }));
      form.setValue("taskLists", updatedTaskLists, { shouldValidate: false });
      // Close confirmation dialog
      settaskToDeleteIndex(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleCancelCreateProject = () => {
    if (formMode === "add") {
      const taskLists = form.getValues('taskLists') || [];
      if (taskLists.length > 0) {
        setIsCloseConfirmOpen(true);
      } else {
        setIsCreateDialogOpen(false);
        resetProjectForm();
      }
    } else if (formMode === "edit") {
      if (hasUnsavedChanges()) {
        setIsCloseConfirmOpen(true);
      } else {
        setIsCreateDialogOpen(false);
        resetProjectForm();
      }
    }
  };

  const normalizeTaskList = (list: any[] = []) =>
    list.map((task) => ({
      taskId: task.taskId || "",
      stStartDate: task.stStartDate || "",
      stEndDate: task.stEndDate || "",
      estimatedDuration: task.estimatedDuration || "",
      dependentTask: task.dependentTask || [],
      assignToId: task.assignToId || "",
      assignToName: task.assignToName || "",
      taskScheduleType: task.taskScheduleType || undefined,
    }));

  const hasUnsavedChanges = () => {
    const currentFormData = form.getValues();
    const currentTaskLists = normalizeTaskList(form.getValues('taskLists') || []);
    const initialNormalizedTaskLists = normalizeTaskList(initialTaskLists);

    const formChanged = JSON.stringify({
      name: currentFormData.name,
      typeId: currentFormData.typeId,
      scheduleType: currentFormData.scheduleType,
      unitId: currentFormData.unitId,
      departmentId: currentFormData.departmentId,
      startDate: currentFormData.startDate,
      endDate: currentFormData.endDate,
      description: currentFormData.description,
    }) !== JSON.stringify(initialFormData);

    const taskListChanged = JSON.stringify(currentTaskLists) !== JSON.stringify(initialNormalizedTaskLists);

    return formChanged || taskListChanged;
  };

  const confirmCloseProjectDialog = () => {
    setIsCloseConfirmOpen(false);
    setIsCreateDialogOpen(false);
    resetProjectForm();
  };

  const resetProjectForm = () => {
    form.reset({
      name: "",
      typeId: "",
      scheduleType: "1",
      unitId: "",
      departmentId: "",
      startDate: "",
      endDate: "",
      description: "",
      taskLists: [],
    });

    subTaskForm.reset({
      taskId: "",
      stStartDate: "",
      stEndDate: "",
      estimatedDuration: "",
      dependentTask: [],
      assignToId: "",
      assignToName: "",
      taskScheduleType: form.getValues("scheduleType") === "2" ? "1" : undefined,
    });
    removeSubTask();
    setDependentTaskList([]);
  };

  const resetSubTaskForm = () => {
    const defaults: TaskFormValues = {
      taskId: "",
      stStartDate: "",
      stEndDate: "",
      estimatedDuration: "",
      dependentTask: [],
      assignToId: "",
      assignToName: "",
      taskScheduleType: selectedScheduleType === "2" ? "1" : undefined,
    };
    Object.entries(defaults).forEach(([key, value]) => {
      subTaskForm.setValue(key as keyof TaskFormValues, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    });
    subTaskForm.clearErrors();
  }

  // ########## List Project ########## //
  const projectStatus = [{ value: "All", label: "All Statuses" }, { value: "1", label: "Planned" }, { value: "2", label: "Active" }, { value: "3", label: "Completed" }];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);

  const handleStatusChange = (value: string) => setStatusFilter(value);

  useEffect(() => {
    fetchProjectList();
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    setPage(0);
    setProjects([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, statusFilter]);

  const fetchProjectList = async () => {
    setIsLoading(true);
    try {
      const requestData: any = {
        ...getPaginatedRequestParams(page, pageSize),
        searchText: searchTerm || undefined,
      };
      if (statusFilter != "All") {
        requestData['query'] = {
          status: parseInt(statusFilter, 10)
        };
      }

      const response = await apiService.post({
        path: api_url.worCoorService.task.assignTask.listProject,
        data: requestData,
        isAuth: true,
      });

      const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
      const totalCount = response.data?.data?.total || 0;
      setProjects((prev) => {
        const merged = [...prev, ...list];
        const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setHasMore(uniqueById.length < totalCount);
        return uniqueById;
      });
    } catch (error) {
      setHasMore(false);
      notification.error("Failed to load projects list.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const getTaskNameByTaskId = (taskId: string) => {
    const match = selectedProject.taskLists.find((item: any) => item.taskId === taskId);
    return match ? getTaskNameById(match.taskId) : "-";
  };

  const handleRowDoubleClick = (project: any) => {
    setSelectedProject(project)
    setIsDetailsDialogOpen(true);
  }

  // ########## General Functions ########## //
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

  const convertMinutesToDurationString = (minutes: number) => {
    const weeks = Math.floor(minutes / (7 * 24 * 60));
    minutes -= weeks * 7 * 24 * 60;
    const days = Math.floor(minutes / (24 * 60));
    minutes -= days * 24 * 60;
    const hours = Math.floor(minutes / 60);
    minutes -= hours * 60;

    const parts = [];
    if (weeks) parts.push(`${weeks}w`);
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    return parts.length > 0 ? parts.join(' ') : '0m';
  };

  const deleteProject = (project: any) => {
    setSelectedProject(project)
    setIsDeleteDialogOpen(true)
  }

  // Handle deleting a project
  const handleDeleteProject = async () => {
    if (!selectedProject) return
    setIsDeleting(true);
    try {
      const response = await apiService.delete({
        path: `${api_url.worCoorService.task.assignTask.deleteProject}/${selectedProject.id}`,
        isAuth: true,
      });
      if (response.data?.status === "OK") {
        notification.success(response.data.message);
        setProjects(projects.filter((p) => p.id !== selectedProject.id))
        setIsDeleteDialogOpen(false);
        setIsDetailsDialogOpen(false);
        setSelectedProject(null);
      } else {
        notification.error(response.data?.message);
      }
    } catch (error) {
      notification.error("Something went wrong while deleting the project.");
    } finally {
      setIsDeleting(false);
    }
  }

  const getNowFormatted = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  };

  if (isAuthLoading || !isAuthenticated) return null;

  return (
     <div className="h-[calc(100vh-2rem)] overflow-hidden">
        <div className="assignmnent flex flex-col gap-2">
          <div className="flex items-center pb-2 sm:pb-4">
            <PageHeader title="Task Assignment" icon={Users}
              description="Create projects with a target and define task steps to execute the project"
            />
            <Button className="border border-primary bg-darkblue text-white hover:bg-darkblue/90 ml-auto"
              onClick={() => setIsCreateDialogOpen(true)}>
              <span className="hidden md:block"> Create Project</span>
              <Plus className="h-4 w-4 block text-white md:hidden" />
            </Button>
          </div>

          <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 bg-transparent sm:bg-white/80 backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
            {/* Filters and Search */}
            <div className="border-gray-200 pb-7 pt-1">
              <div className="w-full flex flex-wrap gap-4 items-center">
                <div className="w-full md:w-auto flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                    <Input type="search" placeholder="Search projects..."
                      value={rawSearchTerm} onChange={(e) => setRawSearchTerm(e.target.value)}
                      className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap align-middle gap-2 ml-auto md:flex-none">
                  <div className="relative w-[160px]">
                    <Select value={statusFilter} onValueChange={handleStatusChange} >
                      <SelectTrigger  className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                        {projectStatus.map((ps) => (
                          <SelectItem key={ps.value} value={ps.value} className="py-2.5">
                            {ps.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground 
                        transition-all duration-200 bg-background px-1
                        peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                        ${statusFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                      `}
                    > Project Status
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Table */}
            <div ref={scrollContainerRef} className="rounded-md min-h-[300px] max-h-[calc(100dvh-240px)] overflow-y-auto overflow-x-auto scroll-auto">
              <Table className="responsive-table">
                {projects.length === 0 ? (
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
                        <TableHead className="text-black font-semibold whitespace-nowrap md:min-w-[180px]">Name</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap md:min-w-[150px]">Created By</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap md:min-w-[100px]">Created On</TableHead>
                        <TableHead className="text-black font-semibold md:min-w-[150px]">Schedule Type</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap md:min-w-[150px]">Project Type</TableHead>
                        <TableHead className="text-black font-semibold md:min-w-[100px]">No of Tasks</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap md:min-w-[100px]">Status</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap md:min-w-[100px]">Org Unit</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap">Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        projects.map((project, index) => (
                          <TableRow key={project.id ?? `project-${project.id}`} className="bg-muted/30"
                            onDoubleClick={() => handleRowDoubleClick(project)}
                          >
                            <TableCell className="p-4 md:p-6">{project.name}</TableCell>
                            <TableCell className="p-4 md:p-6">{project.createdByName}</TableCell>
                            <TableCell className="p-4 md:p-6">
                              {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US') : "-"}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">{getScheduleTypeLabel(project.scheduleType)}</TableCell>
                            <TableCell className="p-4 md:p-6">{getProjectTypeNameById(project.typeId)}</TableCell>
                            <TableCell className="p-4 md:p-6">{project.noOfTask}</TableCell>
                            <TableCell className="p-4 md:p-6">{getStatusBadge(project.status)}</TableCell>
                            <TableCell className="p-4 md:p-6">{getUnitNameById(project.unitId)}</TableCell>
                            <TableCell className="p-4 md:p-6">{getDepartmentsNameById(project.departmentId)}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </>
                )}
              </Table>
            </div>
          </div>

          {/* Create Project Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            if (open) {
              handleAssignTask('add');
            } else {
              if (formMode === "add") {
                const taskLists = form.getValues('taskLists') || [];
                if (taskLists.length > 0) {
                  setIsCloseConfirmOpen(true);
                } else {
                  setIsCreateDialogOpen(false);
                  resetProjectForm();
                }
              } else if (formMode === "edit") {
                if (hasUnsavedChanges()) {
                  setIsCloseConfirmOpen(true);
                } else {
                  setIsCreateDialogOpen(false);
                  resetProjectForm();
                }
              }
            }
          }}>

            <DialogContent  onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsCreateDialogOpen(false)}
              className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
              <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
                <DialogTitle>{formMode === "edit" ? "Edit Project" : "Create New Project"}</DialogTitle>
                <DialogDescription>{formMode === "edit" ? "Update the project details and tasks" : "Add a new project and map its tasks"}</DialogDescription>
              </DialogHeader>
              <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 mb-2 z-0">
                <Form {...form}>
                  <form className="h-full space-y-4" onSubmit={form.handleSubmit(onSubmit)} onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                      e.preventDefault();
                    }
                  }}>
                    <div className="bg-darkblue-foreground/10 rounded-xl p-6  dark:bg-slate-800/50 ">
                        {/* Project Name */}
                      <div className="grid gap-2 mb-4">
                          <FormField control={form.control} name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium leading-none">Project Name <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700" placeholder="Enter project name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Project Type and Schedule Type */}
                          <div className="grid gap-2">
                            <FormField control={form.control} name="typeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">Project Type <span className="text-destructive">*</span></FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                        <SelectValue placeholder="Select Project Type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                      {projectTypes.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No project types found</div>
                                      ) : (
                                        projectTypes.map((pt) => (
                                          <SelectItem key={pt.value} value={pt.value} className="w-full py-2.5">
                                            {pt.label}
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
                            <FormField control={form.control} name="scheduleType"
                              render={({ field }) => (
                                <FormItem >
                                  <FormLabel className="text-sm font-medium leading-none">
                                    Project Schedule Type <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={subTaskFields.length > 0}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                        <SelectValue placeholder="Select Schedule Type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                                      {scheduleTypes.map((type) => (
                                        <SelectItem className="w-full" key={type.value} value={type.value}>
                                          {type.label}
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
                                  <Select value={field.value}
                                    onValueChange={(value) => {
                                      field.onChange(value);

                                      let filtered = [];
                                      if (value === "000000000000000000000000") {
                                        filtered = departmentDetails;
                                        setFilterDepartment(filtered);
                                      } else {
                                        filtered = departmentDetails.filter((dept) => dept.detail.unitId === value);
                                        setFilterDepartment(filtered);
                                      }

                                      form.setValue('departmentId', '', { shouldValidate: true });

                                      // Auto-select if only 1 option available after filtering
                                      if (filtered.length === 1) {
                                        form.setValue('departmentId', filtered[0].id, { shouldValidate: true });
                                        form.clearErrors('departmentId');
                                      }
                                    }}
                                  >
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                      <SelectValue placeholder="Select Org Unit" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {units.length === 0 ? (
                                      <div className="p-2 text-sm text-muted-foreground">No org units found</div>
                                    ) : (
                                      units.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>
                                          {u.label}
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
                            <FormField control={form.control} name="departmentId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">Department <span className="text-destructive">*</span></FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                        <SelectValue placeholder="Select Department" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {filterDepartment.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No departments found</div>
                                      ) : (
                                        filterDepartment.map((d) => (
                                          <SelectItem key={d.id} value={d.id}>
                                            {d.detail.name}
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
                                      {...field} disabled={subTaskFields.length > 0}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-2">
                            <FormField control={form.control} name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">
                                    End Date & Time <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled={subTaskFields.length > 0}
                                      className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                                      id="task-end-date-time"
                                      type="datetime-local"
                                      {...field}
                                      min={projectStartDate || getNowFormatted()}
                                      max={ projectStartDate
                                        ? new Date(new Date(projectStartDate).setMonth(new Date(projectStartDate).getMonth() + 6))
                                            .toISOString()
                                            .slice(0, 16)
                                        : undefined
                                      }
                                      onBlur={(e) => {
                                        field.onBlur();
                                        const selectedEndDate = new Date(e.target.value);
                                        const selectedStartDate = new Date(projectStartDate);
                                        if (projectStartDate && selectedEndDate < selectedStartDate) {
                                          form.setError('endDate', {
                                            type: 'manual',
                                            message: 'End Date should be after Start Date.',
                                          });
                                        } else {
                                          form.clearErrors('endDate');
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <FormField control={form.control} name="description"
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
                    {/* Task Map */}
                    <div className="border-2 border-neutral-400 bg-darkblue-foreground/10 p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-4">Task Map</h3>
                      <Form {...subTaskForm}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Task */}
                          <div className="relative grid gap-2">
                            <FormField control={subTaskForm.control} name="taskId"
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
                            <FormField control={subTaskForm.control} name="assignToId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">
                                    Assign To <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      // Set assignToName alongside assignToId
                                      const selectedName = Object.entries(technicians).find(([name, id]) => id === value)?.[0] || "";
                                      subTaskForm.setValue("assignToName", selectedName, {
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
                          {/* Start Date and Time  */}
                          <div className="grid gap-2">
                            <div className="w-full">
                              <FormField control={subTaskForm.control} name="stStartDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Task Start Date & Time <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input
                                        type="datetime-local"
                                        className="!w-full h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={(e) => {
                                          field.onBlur();
                                          const stStart = new Date(e.target.value);
                                          const prStart = new Date(projectStartDate);
                                          const prEnd = new Date(projectEndDate);
                                          if (!projectStartDate || !projectEndDate) {
                                            subTaskForm.setError("stStartDate", {
                                              type: "manual",
                                              message: "Select project dates first.",
                                            });
                                          } else if (stStart < prStart || stStart > prEnd) {
                                            subTaskForm.setError("stStartDate", {
                                              type: "manual",
                                              message: "Task Start Date must be within project dates.",
                                            });
                                          } else {
                                            subTaskForm.clearErrors("stStartDate");
                                          }
                                        }}
                                        min={startTouched ? projectStartDate : getNowFormatted()} 
                                        onFocus={() => setStartTouched(true)}
                                        max={projectEndDate || undefined}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          {/* End Date and Time  */}
                          {selectedScheduleType === "2" && (
                            <div className="grid gap-2">
                              <FormField control={subTaskForm.control} name="stEndDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Task End Date & Time <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input
                                        type="datetime-local"
                                        className="!w-full h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={(e) => {
                                          field.onBlur();
                                          const stStart = new Date(subTaskForm.watch("stStartDate"));
                                          const stEnd = new Date(e.target.value);
                                          const prStart = new Date(projectStartDate);
                                          const prEnd = new Date(projectEndDate);
                                          if (!projectStartDate || !projectEndDate) {
                                            subTaskForm.setError("stEndDate", {
                                              type: "manual",
                                              message: "Select project dates first.",
                                            });
                                          } else if (subTaskForm.watch("stStartDate") && stEnd < stStart) {
                                            subTaskForm.setError("stEndDate", {
                                              type: "manual",
                                              message: "Task End Date must be after Task Start Date.",
                                            });
                                          } else if (stEnd < prStart || stEnd > prEnd) {
                                            subTaskForm.setError("stEndDate", {
                                              type: "manual",
                                              message: "Task End Date must be within project dates.",
                                            });
                                          } else {
                                            subTaskForm.clearErrors("stEndDate");
                                          }
                                        }}
                                        min={endTouched ? projectStartDate : getNowFormatted()} 
                                        onFocus={() => setEndTouched(true)}
                                        max={projectEndDate || undefined}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {/* Task schedule Type */}
                          {selectedScheduleType === "2" && (
                            <div className="grid gap-2">
                              <FormField control={subTaskForm.control} name="taskScheduleType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium leading-none">
                                      Repeat Pattern <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700">
                                          <SelectValue placeholder="Select Repeat Pattern" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-[300px]">
                                        {taskScheduleTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {/* Duration  */}
                          <div className="grid gap-2">
                              <TooltipProvider>
                                <FormField control={subTaskForm.control} name="estimatedDuration"
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
                          {/* Dependent Task  */}
                          {subTaskFields.length > 0 && (
                            <div className="grid gap-2">
                              <FormField control={subTaskForm.control} name="dependentTask"
                                render={({ field }) => (
                                  <FormItem className="space-y-2 mt-0">
                                    <FormLabel className="text-sm font-medium leading-none">Dependent Task</FormLabel>
                                    <Multiselect
                                      options={[
                                        ...new Map(
                                          filteredDependentTaskList
                                            .filter((task) => task.taskId !== subTaskForm.watch("taskId"))
                                            .map((task) => [
                                              task.taskId,
                                              { id: task.taskId, name: getTaskNameById(task.taskId) },
                                            ])
                                        ).values(),
                                      ]}
                                      selectedValues={[
                                        ...new Map(
                                          filteredDependentTaskList
                                            .filter(
                                              (task) =>
                                                field.value.includes(task.taskId) &&
                                                task.taskId !== subTaskForm.watch("taskId")
                                            )
                                            .map((task) => [
                                              task.taskId,
                                              { id: task.taskId, name: getTaskNameById(task.taskId) },
                                            ])
                                        ).values(),
                                      ]}
                                      onSelect={(selectedList) => {
                                        const selectedIds = selectedList.map((item: any) => item.id);
                                        field.onChange(selectedIds);
                                      }}
                                      onRemove={(selectedList) => {
                                        const selectedIds = selectedList.map((item: any) => item.id);
                                        field.onChange(selectedIds);
                                      }}
                                      displayValue="name"
                                      showCheckbox={true} placeholder="Select Dependent Tasks"
                                      className="rounded-md bg-background mt-0 min-h-12 border border-input px-3 py-0"
                                      style={{
                                        multiSelectContainer: {
                                          minHeight: "46px",
                                          height: "100%",
                                        },
                                        chips: {
                                          background: "#e5e7eb", // Tailwind: bg-gray-200
                                          color: "#1f2937",       // Tailwind: text-gray-800
                                        },
                                        optionContainer: {
                                          border: "1px solid #e5e7eb", // Tailwind: border-gray-200
                                        },
                                        searchWrapper: {
                                          flexWrap: "wrap",
                                          flexFlow: "column",
                                          padding: "10px !important",
                                        },
                                        searchBox: {
                                          border: "none",
                                          outline: "none",
                                          fontSize: "0.875rem",
                                          padding: "0px !important",
                                          height: "100% !important",
                                          marginTop: "0 !important",
                                          color: "#262627",
                                          boxSizing: "border-box",
                                          // alignItems: "center",
                                        },
                                        inputField: { // To change input field position or margin
                                          height: "100%",
                                          marginTop: '8px',
                                          marginBottom: '8px',
                                          color: "#262627"
                                        },
                                      }}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button type="button" onClick={handleAddSubTask} disabled={subTaskForm.formState.isSubmitting}>
                            Add Task
                          </Button>
                        </div>
                      </Form>
                      {/* Added Task List */}
                      <div className="mt-4 rounded-md border">
                        <Table>
                          <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                            <TableRow>
                              <TableHead className="min-w-[50px]">#</TableHead>
                              <TableHead className="min-w-[150px]">Task Name</TableHead>
                              <TableHead className="min-w-[150px]">Start Date & Time</TableHead>
                              {selectedScheduleType === "2" && (
                                <TableHead className="min-w-[150px]">End Date & Time</TableHead>
                              )}
                              <TableHead className="min-w-[80px]">Duration</TableHead>
                              <TableHead className="min-w-[100px]">Assigned To</TableHead>
                              {selectedScheduleType === "2" && (
                                <TableHead className="min-w-[100px]">Repeat Pattern</TableHead>
                              )}
                              <TableHead className="min-w-[100px]">Dependent Tasks</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subTaskFields.length > 0 ? (
                              [...subTaskFields]
                                .sort((a, b) => new Date(a.stStartDate).getTime() - new Date(b.stStartDate).getTime())
                                .map((task, index) => (
                                  <TableRow key={task.id ?? `task-${task.id}`}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{getTaskNameById(task.taskId)}</TableCell>
                                    <TableCell>{task.stStartDate ? new Date(task.stStartDate).toLocaleString() : "-"}</TableCell>
                                    {selectedScheduleType === "2" && (
                                      <TableCell>{task.stEndDate ? new Date(task.stEndDate).toLocaleString() : "-"}</TableCell>
                                    )}
                                    <TableCell>{task.estimatedDuration}</TableCell>
                                    <TableCell>{task.assignToName}</TableCell>
                                    {selectedScheduleType === "2" && (
                                      <TableCell>{task.taskScheduleType ? getTaskScheduleTypeLabel(task.taskScheduleType) : '-'}</TableCell>
                                    )}
                                    <TableCell>
                                      {task.dependentTask.length > 0
                                        ? task.dependentTask.map((id: any) => getTaskNameById(id)).join(", ")
                                        : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSubTask(index)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={selectedScheduleType === "2" ? 9 : 8} className="h-24 text-center">
                                  No tasks added yet. Add tasks using the form above.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <DialogFooter className="px-2 md:px-6 py-4">
                      <Button type="button" variant="outline" onClick={handleCancelCreateProject}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (formMode === "edit" ? "Updating..." : "Creating...") : (formMode === "edit" ? "Update Project" : "Create Project")}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Project Details Dialog */}
          <Dialog open={isDetailsDialogOpen}
            onOpenChange={(open) => {
              setIsDetailsDialogOpen(open);
              if (!open) {
                setSelectedProject(null);
                setFormMode('add');
              }
            }}
          >
            <DialogContent
              onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDetailsDialogOpen(false)}
              className="max-w-4xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
              <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
                <DialogTitle>Project Details</DialogTitle>
                <DialogDescription>View project information and tasks</DialogDescription>
              </DialogHeader>

              {selectedProject && (
                <div className="h-full space-y-6 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 mb-2 z-0">
                  {/* Project Information */}
                  <div className="bg-darkblue-foreground/10 rounded-lg  p-6  dark:bg-slate-800/50">
                    {/* <h3 className="text-lg font-medium mb-4">Project Information</h3> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-sm">{selectedProject.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                        <p className="text-sm">{selectedProject.createdByName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created On</Label>
                        <p className="text-sm"> {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString('en-US') : "-"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Schedule Type</Label>
                        <p className="text-sm">{getScheduleTypeLabel(selectedProject.scheduleType)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Project Type</Label>
                        <p className="text-sm">{getProjectTypeNameById(selectedProject.typeId)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Number of Tasks</Label>
                        <p className="text-sm">{selectedProject.noOfTask}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Org Unit</Label>
                        <p className="text-sm">{getUnitNameById(selectedProject.unitId)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                        <p className="text-sm">{getDepartmentsNameById(selectedProject.departmentId)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Start Date & Time</Label>
                        <p className="text-sm">{new Date(selectedProject.startDate).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">End Date & Time</Label>
                        <p className="text-sm">{new Date(selectedProject.endDate).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="text-sm">{selectedProject.description ? selectedProject.description : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tasks */}
                  {selectedProject.taskLists && selectedProject.taskLists.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Tasks</h3>
                      <div className="mt-4 rounded-md relative w-full overflow-auto">
                        <Table className="min-w-[900px] dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]x:w-[4px] overflow-auto">
                          <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                            <TableRow>
                              <TableHead className="min-w-[50px] max-w-[50px]">#</TableHead>
                              <TableHead className="min-w-[150px]">Task Name</TableHead>
                              <TableHead className="min-w-[150px]">Start Date & Time</TableHead>
                              {selectedProject.scheduleType == 2 && (
                                <TableHead className="min-w-[150px]">End Date & Time</TableHead>
                              )}
                              {selectedProject.scheduleType == 2 && (
                                <TableHead className="min-w-[100px]">Scheduling</TableHead>
                              )}
                              <TableHead className="min-w-[100px]">Duration</TableHead>
                              <TableHead className="min-w-[100px]">Assigned To</TableHead>
                              <TableHead className="min-w-[100px]">Dependent Tasks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProject.taskLists.map((task: any, index: number) => (
                              <TableRow key={index} className={index % 2 === 0 ? "bg-muted/50" : "bg-background"}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{getTaskNameById(task.taskId)}</TableCell>
                                <TableCell>{task.startDate ? new Date(task.startDate).toLocaleString() : "-"}</TableCell>
                                {selectedProject.scheduleType == 2 && (
                                  <TableCell>{task.endDate ? new Date(task.endDate).toLocaleString() : "-"}</TableCell>
                                )}
                                {selectedProject.scheduleType == 2 && (
                                  <TableCell>
                                    {getTaskScheduleTypeLabel(task.scheduleType.toString())}
                                  </TableCell>
                                )}
                                <TableCell>{convertMinutesToDurationString(task.estimatedDuration)}</TableCell>
                                <TableCell>{task.assignToName}</TableCell>
                                <TableCell>
                                  {task.dependentTask && task.dependentTask.length > 0
                                    ? task.dependentTask
                                      .map((depTaskId: string) => getTaskNameByTaskId(depTaskId))
                                      .join(", ")
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter  className="px-2 md:px-6 py-4 gap-2">
                {/* <Button variant="default"
                  onClick={() => handleAssignTask('edit', selectedProject)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button> */}
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteProject(selectedProject)
                  }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remove task confrim modal */}
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteConfirmOpen(false)}>
              <DialogHeader>
                <DialogTitle>Confirm Removal</DialogTitle>
                <DialogDescription>Are you sure you want to remove this task from the map?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmRemoveSubTask}>Yes, Remove</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Project modal close confrim modal */}
          <Dialog open={isCloseConfirmOpen} onOpenChange={setIsCloseConfirmOpen}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsCloseConfirmOpen(false)}>
              <DialogHeader>
                <DialogTitle>Discard Changes?</DialogTitle>
                <DialogDescription>
                  You have added tasks to this project. Are you sure you want to discard them and close?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCloseConfirmOpen(false)}>No, Keep Editing</Button>
                <Button variant="destructive" onClick={confirmCloseProjectDialog}>Yes, Discard & Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete project modal */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteDialogOpen(false)}
              className="dark:bg-modal max-w-full sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center">
                    <AlertTriangle className="text-amber-500 w-5 h-5 mr-2" />  
                    Delete Project
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this Project? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedProject && (
                <div className="pb-4 pt-2">
                  <p className="text-sm/10 leading-[1.4] mb-3">
                    You are about to delete: <strong>{selectedProject.name}</strong>
                  </p>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </div>
  )
}