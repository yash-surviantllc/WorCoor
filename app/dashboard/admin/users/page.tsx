"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, MapPin, Wifi, Users, Plus, Search, Edit, Eye, Pencil, Trash2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PageHeader } from "@/components/dashboard/page-header"
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/utils/AuthContext";
import { notification } from '@/src/services/notificationService'
import { apiService } from "@/src/services/apiService";
import { api_url } from "@/src/constants/api_url";
import { useInfiniteScroll } from "@/src/lib/use-infinite-scroll";
import { getPaginatedRequestParams } from "@/src/lib/pagination";

const USER_TYPE_TECHNICIAN = "68869af244f38b2873004135";
const USER_TYPE_WORKER = "68869aff44f38b2873004136";
const USER_TYPE_ADMIN = "68871b4ac7e56d698fffeb12";
const ADMIN_ROLE_ID = "6853d0efc8e15a7c2d3b7033";

// Users form schema
const UsersFormSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  fullName: z.string().min(1, "fullname is required"),
  email: z.string().min(1, "Email is required"),
  contactNo: z.string().min(1, "Contact No. is required"),
  unitId: z.string().min(1, { message: "Please select a org unit." }),
  departmentId: z.string().min(1, { message: "Please select a department." }),
  typeId: z.string().min(1, { message: "Please select a user type." }),
  roleId: z.string().min(1, { message: "Please select a role." }),
  shiftStratTime: z.string().optional(),
  shiftEndTime: z.string().optional(),
  skillSet: z.array(z.string()).optional(),
  emergencyContactNo: z.string().optional(),
  ipBasedLogin: z.boolean().optional(),
  timeBasedLogin: z.boolean().optional(),
  locationBasedLogin: z.boolean().optional(),
  loginStartTime: z.string().optional(),
  loginEndTime: z.string().optional(),
}).superRefine((data, ctx) => {
  const isTechOrWorker = data.typeId === USER_TYPE_TECHNICIAN || data.typeId === USER_TYPE_WORKER;
  const isExcludedForLoginTime = isTechOrWorker || data.typeId === USER_TYPE_ADMIN;
  // Validate work-related fields for technician/worker
  if (isTechOrWorker) {
    if (!data.shiftStratTime) {
      ctx.addIssue({
        path: ["shiftStratTime"],
        message: "Shift Start Time is required",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.shiftEndTime) {
      ctx.addIssue({
        path: ["shiftEndTime"],
        message: "Shift End Time is required",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.emergencyContactNo) {
      ctx.addIssue({
        path: ["emergencyContactNo"],
        message: "Emergency Contact is required",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!Array.isArray(data.skillSet) || data.skillSet.length === 0) {
      ctx.addIssue({
        path: ["skillSet"],
        message: "At least one skill must be selected",
        code: z.ZodIssueCode.custom,
      });
    }
    
    // Validate loginStartTime/loginEndTime only if NOT excluded
    if (!isExcludedForLoginTime && data.timeBasedLogin) {
      if (!data.loginStartTime) {
        ctx.addIssue({
          path: ["loginStartTime"],
          message: "Login Start Time is required",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.loginEndTime) {
        ctx.addIssue({
          path: ["loginEndTime"],
          message: "Login End Time is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  }
}).refine(
    (data) => {
      if (data.loginStartTime && data.loginEndTime) {
        return data.loginStartTime < data.loginEndTime;
      }
      return true;
    },
    {
      message: "Login start time must be before end time",
      path: ["loginEndTime"],
    }
  )
  .refine(
    (data) => {
      if (data.shiftStratTime && data.shiftEndTime) {
        return data.shiftStratTime < data.shiftEndTime;
      }
      return true;
    },
    {
      message: "Shift start time must be before end time",
      path: ["shiftEndTime"],
    }
  );

type UsersFormValues = z.infer<typeof UsersFormSchema>

export default function UsersPage() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const {isAuthenticated, isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [units, setUnit] = useState<{ value: string; label: string }[]>([]);
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [departmentDetails, setDepartmentDetails] = useState<any[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<any[]>([]);
  const [userTypes, setUserTypes] = useState<{ value: string; label: string }[]>([]);
  const [userTypesFilter, setUserTypesFilter] = useState<string>("");
  const [skillSets, setSkillSets] = useState<{ value: string; label: string }[]>([]);
  const [filtersReady, setFiltersReady] = useState(false);
  const [sameAsWorkTiming, setSameAsWorkTiming] = useState(false);
  const [isFormReady, setIsFormReady] = useState(true);
  
  const router = useRouter();
  const scrollContainerRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    onLoadMore: () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  });
  
  // Auth Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading, router]);

  // Initialize form
  const form = useForm<UsersFormValues>({
    resolver: zodResolver(UsersFormSchema),
    mode: "onChange",
    defaultValues: {
      userName: "",
      fullName: "",
      email: "",
      contactNo: "",
      unitId: "",
      departmentId: "",
      typeId: "",
      roleId: "",
      shiftStratTime: "",
      shiftEndTime: "",
      loginStartTime: "",
      loginEndTime: "",
      skillSet: [],
      emergencyContactNo: "",
      ipBasedLogin: false,
      timeBasedLogin: false,
      locationBasedLogin: false,
    },
  });

  const resetform = () => {
    form.reset({
      userName: "",
      fullName: "",
      email: "",
      contactNo: "",
      unitId: "",
      departmentId: "",
      typeId: "",
      roleId: "",
      shiftStratTime: "",
      shiftEndTime: "",
      loginStartTime: "",
      loginEndTime: "",
      skillSet: [],
      emergencyContactNo: "",
      ipBasedLogin: false,
      timeBasedLogin: false,
      locationBasedLogin: false,
    });
  };

  const userTypeId = form.watch('typeId');
  const isEdit = formMode === "edit";

  // Get Technicians
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setRoles([]);
    try {
      const response = await apiService.post({
        path: api_url.authServices.roles.list,
        data: { "totalInList": 150, "page": 0 },
        isAuth: true,
      });
      const repoObj = response.data?.data?.list || [];
      setRoles(repoObj);
    } catch (err) {
      setRoles([]);
    }
  }

  const getRoleNameById = (id: string): string => {
    const role = roles.find(r => r.id === id);
    return role ? role.name : "-";
  };

   // Get User Type
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565d0af70897486c468530",
      setState: setUserTypes,
      defaultLabel: "User Types",
    });
  }, []);

  useEffect(() => {
    if (userTypes.length > 0 && !userTypesFilter) {
      setUserTypesFilter(userTypes[0].value);
    }
  }, [userTypes, userTypesFilter]);

  const getUserTypeNameById = (id: string): string => {
    const type = userTypes.find(ut => ut.value === id);
    return type ? type.label : "-";
  };

  // Get skill sets
  useEffect(() => {
    fetchDropdownOptions({
      apiId: "68565d23f70897486c468531",
      setState: setSkillSets,
      defaultLabel: "Skill Sets",
    });
  }, []);

  const getSkillSetNameById = (id: string): string => {
    const skill = skillSets.find(ss => ss.value === id);
    return skill ? skill.label : "-";
  };

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

  // ########## User Listing ########## //
  // Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);
  
  // Filter Set All
  useEffect(() => {
    const allFetched = [roles].every(arr => Array.isArray(arr));
    const allFiltersSelected = roleFilter;
    if (allFetched && allFiltersSelected) {
      setFiltersReady(true);
    }
  }, [
    page, roles, roleFilter
  ]);

  useEffect(() => {
    setPage(0);
    setUsersData([]);
    setHasMore(true);
    setIsLoading(false);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    if (filtersReady) {
      fetchUsersList();
    }
  }, [page, searchTerm, roleFilter, filtersReady]);

  const buildFilterQuery = () => {
    const query: any = {};
    if (roleFilter && roleFilter !== "All") {
      query.roleId = roleFilter;
    }
    return query;
  };

  const fetchUsersList = async () => {
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
        path: api_url.authServices.users.list,
        data: requestData,
        isAuth: true,
      });
      const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : [];
      const totalCount = response.data?.data?.total || 0;
      setUsersData((prev) => {
        const merged = [...prev, ...list];
        const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setHasMore(uniqueById.length < totalCount);
        return uniqueById;
      });
    } catch (error) {
      setHasMore(false);
      notification.error("Failed to load user list.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle row double click
  const handleRowDoubleClick = (user: any) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  // Delete User
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }
  
  // Delete confirmation
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      const response = await apiService.delete({
        path: `${api_url.authServices.users.delete}/${selectedUser.id}`,
        isAuth: true,
      });

      if (response.data?.status === "OK") {
        // Show success message
        notification.success(response.data.message || "User deleted successfully.");
        // Refresh data
        setPage(0);
        setUsersData([]);
        setHasMore(true);
        setIsLoading(false);
        await fetchUsersList();
        // Close modals
        setIsDeleteDialogOpen(false);
        setIsViewDialogOpen(false);
      } else {
        notification.error(response.data?.message || "Failed to delete user.");
      }
    } catch (error) {
      notification.error("Something went wrong while deleting the user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (user: UsersFormValues) => {
    setIsFormReady(false);
    setSelectedUser(user);
    setFormMode("edit");
    form.setValue("userName", user.userName);
    form.setValue("fullName", user.fullName || "");
    form.setValue("email", selectedUser.maskEmail || "");
    form.setValue("contactNo", selectedUser.maskContactNo || "");
    form.reset({
      ...form.getValues(),
      unitId: user.unitId ?? "",
      departmentId: user.departmentId ?? "",
      typeId: user.typeId ?? "",
      roleId: user.roleId ?? "",
      skillSet: user.skillSet ?? [],
      emergencyContactNo: user.emergencyContactNo ?? "",
      ipBasedLogin: user.ipBasedLogin ?? false,
      timeBasedLogin: user.timeBasedLogin ?? false,
      locationBasedLogin: user.locationBasedLogin ?? false,
      loginStartTime: toLocalTimeHM(user.shiftStratTime),
      loginEndTime: toLocalTimeHM(user.shiftEndTime),
      shiftStratTime: toLocalTimeHM(user.shiftStratTime),
      shiftEndTime: toLocalTimeHM(user.shiftEndTime),
    });
    setIsAddDialogOpen(true);
    setTimeout(() => setIsFormReady(true), 0);
  };

  // Add/Update users
  const onSubmit = async (data: UsersFormValues) => {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0]; // "2025-07-28"
    const toDateTime = (timeStr?: string) => {
      if (!timeStr) return undefined;
      return new Date(`${todayDate}T${timeStr}:00`).toISOString();
    };

    let cleanedData;
    if (formMode === "edit") {
      const { loginStartTime, loginEndTime, contactNo, email, ...rest } = data;
      cleanedData = rest;
    } else {
      const { loginStartTime, loginEndTime, ...rest } = data;
      cleanedData = rest;
    }

    const reqBody = {
      ...cleanedData,
      ...(formMode === "add" ? { password: "Worcoor@123" } : {}), // ✅ removed that after implement notifyServices
      skillSet: data.skillSet?.length ? data.skillSet : undefined,
      emergencyContactNo: data.emergencyContactNo || undefined,
      shiftStratTime:
        data.typeId === USER_TYPE_TECHNICIAN || data.typeId === USER_TYPE_WORKER
          ? toDateTime(data.shiftStratTime)
          : toDateTime(data.loginStartTime),

      shiftEndTime:
        data.typeId === USER_TYPE_TECHNICIAN || data.typeId === USER_TYPE_WORKER
          ? toDateTime(data.shiftEndTime)
          : toDateTime(data.loginEndTime),
      ...(formMode === "edit" && selectedUser?.id ? { id: selectedUser.id } : {}),
    };

    if (formMode === "add") {
      setIsSubmitting(true);
      try {
        const response = await apiService.post({
          path: api_url.authServices.users.add,
          isAuth: true,
          data: reqBody,
        });

        if (response.data.status === "OK") {
          notification.success(response.data.message);
          setIsAddDialogOpen(false);
          form.reset();
          setPage(0);
          setUsersData([]);
          setHasMore(true);
          setIsLoading(false);
          await fetchUsersList();
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
        const response = await apiService.put({
          path: `${api_url.authServices.users.update}`,
          isAuth: true,
          data: reqBody,
        });

        if (response.data.status === "OK") {
          notification.success(response.data.message);
          setIsAddDialogOpen(false);
          setPage(0);
          setUsersData([]);
          setHasMore(true);
          setIsLoading(false);
          await fetchUsersList();
        } else {
          notification.error(response.data.message);
        }
      } catch (error) {
        notification.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
    setSelectedUser(null);
    setIsViewDialogOpen(false);
  }

  const formatTo12Hour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  function toLocalTimeHM(dateStr: string | undefined) {
    if (!dateStr) return "";
    const localDate = new Date(dateStr);
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  if (isAuthLoading || !isAuthenticated) return null;

  return (
      <div className="h-[calc(100vh-3rem)] overflow-hidden">
        <div className="user-management h-full flex flex-col gap-2">
          <div className="flex items-center pb-2 sm:pb-4">
            <PageHeader title="User Management"
            description="Role Based, Time Based and Geo Based Access Control"
            icon={Users} />

            <Button 
              className="border border-primary bg-darkblue text-white hover:bg-darkblue/90 ml-auto"
              onClick={() => {
                setFormMode("add");
                setSelectedUser(null);
                form.reset();
                resetform();
                setIsAddDialogOpen(true);
              }}
            >
              <span className="hidden md:block"> Create User</span>
              <Plus className="h-4 w-4 block text-white md:hidden" />
            </Button>
          </div>
          <div className="h-full grow rounded-2xl border-0 sm:border border-slate-200 backdrop-blur-sm text-card-foreground shadow-soft hover:shadow-medium transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/80 p-0 sm:p-6">
            {/* Search and Filters */}
            <div className="border-gray-200 pb-7 pt-1">
              <div className="w-full flex flex-wrap gap-4 items-center">
                <div className="w-full md:w-auto flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute align-middle h-full text-muted-foreground left-1 pl-1" size='22' />
                    <Input
                      type="search"
                      placeholder="Search Users..."
                      value={rawSearchTerm}
                      onChange={(e) => setRawSearchTerm(e.target.value)}
                      className="h-11 bg-background border-input rounded-xl pl-8 focus:outline-transparent focus:ring-0 focus:border-input focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-transparent  focus-visible:ring-transparent"
                    />
                  </div>
                </div>
                <div className="w-fit flex flex-wrap align-middle gap-3 md:gap-2 ml-auto md:flex-none">
                  {/* Roles Wise Filter  */}
                  <div  className="relative w-[160px]">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className={`peer w-full bg-background border text-left border-input focus:outline-none focus:ring-0 focus:border-input focus:ring-transparent`}>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Roles</SelectItem>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label htmlFor="status"
                      className={`pointer-events-none absolute left-3 -top-2 text-sm text-muted-foreground transition-all duration-200 bg-background px-1 peer-focus:-top-1.4 peer-focus:text-xs peer-focus:font-medium 
                        ${roleFilter ? '-top-1.4 text-xs font-medium' : 'top-3.5'}
                      `}
                    >
                      Roles
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Listing */}
            <div ref={scrollContainerRef}
              className="rounded-md min-h-[300px] max-h-[calc(100dvh-260px)] overflow-y-auto overflow-x-auto scroll-auto"
            >
              <Table className="table-auto">
                {usersData.length === 0 ? (
                  <TableBody>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={10} className="text-center">
                          No users found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                  </TableBody>
                ) : (
                  <>
                    <TableHeader className="bg-gray-100 text-black dark:bg-slate-950 dark:hover:bg-slate-950">
                      <TableRow>
                        <TableHead className="text-black font-semibold whitespace-nowrap">User Name</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[150px]">Full Name</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[180px]">Email</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">Contact No.</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[150px]">Role</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">IP Based Access</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">Time Based Access</TableHead>
                        <TableHead className="text-black font-semibold whitespace-nowrap min-w-[100px]">Geo Location Access</TableHead>
                        <TableHead className="text-black font-semibold min-w-[100px]">Org Unit</TableHead>
                        <TableHead className="text-black font-semibold min-w-[100px]">Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        usersData.map((u) => (
                          <TableRow
                            key={u.id || `${u.name}-${u.instanceName}`}
                            onDoubleClick={() => handleRowDoubleClick(u)}
                            className="cursor-pointer bg-muted/30"
                          >
                            <TableCell className="p-4 md:p-6">{u.userName}</TableCell>
                            <TableCell className="p-4 md:p-6">{u.fullName}</TableCell>
                            <TableCell className="p-4 md:p-6">{u.maskEmail}</TableCell>
                            <TableCell className="p-4 md:p-6">{u.maskContactNo}</TableCell>
                            <TableCell className="p-4 md:p-6">{getRoleNameById(u.roleId)}</TableCell>
                            <TableCell className="p-4 md:p-6">
                              {u.ipBasedLogin ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-1.5">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-4 py-1.5">
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                              {u.timeBasedLogin ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-1.5">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-4 py-1.5">
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">
                              {u.locationBasedLogin ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-1.5">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-4 py-1.5">
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="p-4 md:p-6">{getUnitNameById(u.unitId)}</TableCell>
                            <TableCell className="p-4 md:p-6">{getDepartmentsNameById(u.departmentId)}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </>
                )}
              </Table>
            </div>
          </div>

          {/* Add/Update Users Dialog */}
          <Dialog open={isAddDialogOpen}
            onOpenChange={(isOpen) => {
              setIsAddDialogOpen(isOpen);
              if (!isOpen) {
                setFormMode("add");
                form.reset();
              }
            }}
          >
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsAddDialogOpen(false)}
                className="max-w-3xl md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
                <DialogHeader className="px-2 md:px-6 pt-6 pb-[1.1rem] border-b">
                  <DialogTitle>{formMode === "edit" ? "Edit User" : "Add User"}</DialogTitle>
                  <DialogDescription>Enter the details of the user you want to add.</DialogDescription>
                </DialogHeader>
                    <div className="h-full space-y-4 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
                      {isFormReady && (
                      <Form {...form}>
                        <form className="h-full space-y-4"
                          onSubmit={form.handleSubmit(
                            async (data) => {
                              if (formMode === "edit") {
                                data.email = selectedUser?.email || "";
                                data.contactNo = selectedUser?.contactNo || "";
                              }
                              await onSubmit(data);
                            },
                            (errors) => {
                              console.log("Validation failed:", errors);
                            }
                          )}
                        >
                          {/* Username and Fullname */}
                          {formMode === "add" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                              <FormField control={form.control} name="userName"
                                render={({ field }) => (
                                  <FormItem className="space-y-0 mt-0">
                                    <FormLabel className="text-sm font-medium leading-none">User Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input disabled={isEdit} className="h-12 rounded-md border border-input" placeholder="Enter User Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField control={form.control} name="fullName"
                                render={({ field }) => (
                                  <FormItem className="space-y-0 mt-0">
                                    <FormLabel className="text-sm font-medium leading-none">Full Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input disabled={isEdit} className="h-12 rounded-md border border-input" placeholder="Enter Full Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {formMode === "edit" && selectedUser && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm">User Name</Label>
                                <p className="text-sm font-medium text-muted-foreground">{selectedUser.userName}</p>
                              </div>
                              <div>
                                <Label className="text-sm">Full Name</Label>
                                <p className="text-sm font-medium text-muted-foreground">{selectedUser.fullName}</p>
                              </div>
                            </div>
                          )}
                          {/* Email and ContactNo */}
                          {formMode === "add" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                              <FormField control={form.control} name="email"
                                render={({ field }) => (
                                  <FormItem className="space-y-0 mt-0">
                                    <FormLabel className="text-sm font-medium leading-none">Email <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input className="h-12 rounded-md border border-input" placeholder="Enter Email Address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField control={form.control} name="contactNo"
                                render={({ field }) => (
                                  <FormItem className="space-y-0 mt-0">
                                    <FormLabel className="text-sm font-medium leading-none">Contact No. <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input className="h-12 rounded-md border border-input" placeholder="Enter Contact No." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {formMode === "edit" && selectedUser && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm">Email</Label>
                                <p className="text-sm font-medium text-muted-foreground">{selectedUser.maskEmail}</p>
                              </div>
                              <div>
                                <Label className="text-sm">Contact No.</Label>
                                <p className="text-sm font-medium text-muted-foreground">{selectedUser.maskContactNo}</p>
                              </div>
                            </div>
                          )}
                          {/* Role and userType */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                              <FormField control={form.control} name="roleId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium leading-none">Role <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 rounded-md border border-input">
                                          <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-[300px]">
                                        {roles.map((r) => (
                                          <SelectItem key={r.id} value={r.id} className="py-2.5">
                                            {r.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField control={form.control} name="typeId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium leading-none">User Type <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 rounded-md border border-input">
                                          <SelectValue placeholder="Select User Type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-[300px]">
                                        {userTypes.map((u) => (
                                          <SelectItem key={u.value} value={u.value} className="py-2.5">
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
                          {/* Unit and Department */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                            <FormField
                              control={form.control} name="unitId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">Org Unit <span className="text-destructive">*</span></FormLabel>
                                  <Select value={field.value}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      if (value === "000000000000000000000000") {
                                        setFilterDepartment(departmentDetails);
                                      } else {
                                        const matched = departmentDetails.filter(
                                          (dept) => dept.detail.unitId === value
                                        );
                                        setFilterDepartment(matched);
                                      }
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-md border border-input">
                                        <SelectValue placeholder="Select Org Unit" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {units.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>
                                          {unit.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField control={form.control} name="departmentId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium leading-none">Department <span className="text-destructive">*</span></FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-md border border-input">
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
                          {/* skill set and emergency contactNo */}
                          {(userTypeId === USER_TYPE_TECHNICIAN || userTypeId === USER_TYPE_WORKER) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                              <FormField control={form.control} name="skillSet"
                                render={({ field }) => {
                                  const selectedSkills = field.value ?? [];
                                  return (
                                    <FormItem className="space-y-2">
                                      <FormLabel htmlFor="skillSet" className="text-sm font-medium leading-none">
                                        Skill Set <span className="text-destructive">*</span>
                                      </FormLabel>
                                      <Select value=""
                                        onValueChange={(value) => {
                                          if (!selectedSkills.includes(value)) {
                                            field.onChange([...selectedSkills, value]);
                                          }
                                        }}
                                      >
                                        <FormControl>
                                          <SelectTrigger id="skillSet"
                                            className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                                          >
                                            <SelectValue placeholder="Select Skill Sets" />
                                          </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                          {Array.isArray(skillSets) ? (
                                            skillSets.map((skill) => (
                                              <SelectItem key={skill.value} value={skill.value}>
                                                {skill.label}
                                              </SelectItem>
                                            ))
                                          ) : (
                                            <SelectItem value="loading">Loading...</SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                      {selectedSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {selectedSkills.map((skill: string) => (
                                            <Badge key={skill} variant="outline" className="flex items-center gap-1">
                                              {getSkillSetNameById(skill)}
                                              <button
                                                type="button"
                                                className="ml-1 text-xs"
                                                onClick={() => {
                                                  field.onChange(selectedSkills.filter((s) => s !== skill));
                                                }}
                                              >
                                                ×
                                              </button>
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </FormItem>
                                  );
                                }}
                              />
                              <FormField control={form.control} name="emergencyContactNo"
                                render={({ field }) => (
                                  <FormItem className="space-y-0 mt-0">
                                    <FormLabel className="text-sm font-medium leading-none">Emergency Contact <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                      <Input className="h-12 rounded-md border border-input" placeholder="Enter Emergency Contact" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {/* shift checkin and checkout time  */}
                          {(userTypeId === USER_TYPE_TECHNICIAN || userTypeId === USER_TYPE_WORKER) && (
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-2">
                              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800 mt-2 mb-4">
                                <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">Work Timing</h4>
                                <div className="grid grid-cols-2 gap-4">

                                  {/* Check In Time */}
                                  <FormField
                                    control={form.control}
                                    name="shiftStratTime"
                                    render={({ field }) => (
                                      <FormItem className="space-y-2">
                                        <FormLabel htmlFor="checkInTime" className="text-sm font-medium leading-none">
                                          Check In Time <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            id="checkInTime"
                                            type="time"
                                            className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  {/* Check Out Time */}
                                  <FormField
                                    control={form.control}
                                    name="shiftEndTime"
                                    render={({ field }) => (
                                      <FormItem className="space-y-2">
                                        <FormLabel htmlFor="checkOutTime" className="text-sm font-medium leading-none">
                                          Check Out Time <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            id="checkOutTime"
                                            type="time"
                                            className="h-12 rounded-md border border-input bg-white/100 dark:bg-slate-800/80 dark:border-slate-700"
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
                          )}
                          {/* Access checkboxes  */}
                          <div className="border-t pt-4">
                            <h3 className="font-medium mb-4">Access Control</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                              {/* IP Based Access */}
                              <FormField control={form.control} name="ipBasedLogin"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        id="ipBasedAccess"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel htmlFor="ipBasedAccess" className="flex items-center gap-1 text-sm font-medium leading-none">
                                      <Wifi className="h-4 w-4" /> IP Based Access
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />

                              {/* Time Based Access (only if not Admin) */}
                              {form.getValues("roleId") !== ADMIN_ROLE_ID && (
                                <FormField
                                  control={form.control}
                                  name="timeBasedLogin"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          id="timeBasedAccess"
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor="timeBasedAccess" className="flex items-center gap-1 text-sm font-medium leading-none">
                                        <Clock className="h-4 w-4" /> Time Based Access
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              )}

                              {/* Geo Location Access (only if not Admin) */}
                              {form.getValues("roleId") !== ADMIN_ROLE_ID && (
                                <FormField
                                  control={form.control}
                                  name="locationBasedLogin"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 mb-3">
                                      <FormControl>
                                        <Checkbox
                                          id="geoLocationAccess"
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor="geoLocationAccess" className="flex items-start gap-1 text-sm font-medium leading-none">
                                        <MapPin className="h-4 w-4 md:h-5 md:w-5" /> Geo Location Based Access
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>

                            {/* Time Access Section */}
                            {form.watch("roleId") !== ADMIN_ROLE_ID && form.watch("timeBasedLogin") && (
                              <div className="space-y-3 mt-4">
                                {/* Same As Work Timing */}
                                {/* <div className="flex items-base space-x-2 mb-3">
                                  <Checkbox id="sameAsWorkTiming" checked={sameAsWorkTiming}
                                    onCheckedChange={(checked) => {
                                      setSameAsWorkTiming(checked === true);
                                      if (checked === true) {
                                        form.setValue("loginStartTime", form.getValues("shiftStratTime"));
                                        form.setValue("loginEndTime", form.getValues("shiftEndTime"));
                                      }
                                    }}
                                  />
                                  <Label htmlFor="sameAsWorkTiming" className="text-sm font-medium leading-none">
                                    Same as Work Timing
                                  </Label>
                                </div> */}
                                {(userTypeId !== USER_TYPE_TECHNICIAN && userTypeId !== USER_TYPE_WORKER) && (
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Start Time */}
                                    <FormField control={form.control} name="loginStartTime"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="timeAccessStart" className="text-sm font-medium leading-none">
                                            Start Time <span className="text-destructive">*</span>
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              id="timeAccessStart"
                                              type="time"
                                              disabled={sameAsWorkTiming}
                                              {...field}
                                              value={field.value ?? ""}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    {/* End Time */}
                                    <FormField control={form.control} name="loginEndTime"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel htmlFor="timeAccessEnd" className="text-sm font-medium leading-none">
                                            End Time <span className="text-destructive">*</span>
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              id="timeAccessEnd"
                                              type="time"
                                              disabled={sameAsWorkTiming}
                                              {...field}
                                              value={field.value ?? ""} // Override value only
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Footer actions bottons */}
                          <DialogFooter className="py-4 gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddDialogOpen(false)
                              }}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                      )}
                </div>
            </DialogContent>
          </Dialog>

          {/* View Users Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={(isOpen) => {
              setIsViewDialogOpen(isOpen);
              if (!isOpen) {
                setSelectedUser(null);
                setFormMode("add");
                form.reset();
              }
            }}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsViewDialogOpen(false)}
                className="sm:max-w-[600px] max-w-md md:max-h-[90dvh] min-h-[90dvh] md:h-[90dvh] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-modal p-0 gap-0">
              <DialogHeader className="px-2 md:px-6 py-6 border-b">
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>View details of the selected User.</DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="h-full space-y-4 flex-grow-1 overflow-y-auto px-2 md:px-6 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500  dark:[&::-webkit-scrollbar]:w-[4px] pt-4 z-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">User Name</Label>
                      <p className="text-sm">{selectedUser.userName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-sm">{selectedUser.fullName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm">{selectedUser.maskEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Contact No.</Label>
                      <p className="text-sm">{selectedUser.maskContactNo}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                      <p className="text-sm">{getRoleNameById(selectedUser.roleId)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">User Type</Label>
                      <p className="text-sm">{getUserTypeNameById(selectedUser.typeId)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Org Unit</Label>
                      <p className="text-sm">{getUnitNameById(selectedUser.unitId)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                      <p className="text-sm">{getDepartmentsNameById(selectedUser.departmentId)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.workTiming && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Work Timing</Label>
                        <p className="text-sm">
                          {selectedUser.workTiming.checkIn} - {selectedUser.workTiming.checkOut}
                        </p>
                      </div>
                    )}
                    {selectedUser.emergencyContact && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                        <p className="text-sm">{selectedUser.emergencyContact}</p>
                      </div>
                    )}
                  </div>
                  {selectedUser.shiftStratTime &&  selectedUser.shiftEndTime && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Work Timing</Label>
                        <p className="text-sm">
                          {formatTo12Hour(selectedUser.shiftStratTime)} - {formatTo12Hour(selectedUser.shiftEndTime)}
                        </p>
                      </div>
                    </div>
                  )}
                    
                  <div className="col-span-1 md:col-span-2">
                    <Label className="text-xl md:text-base font-medium">Access Control</Label>
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4" />
                        <span className="text-sm">IP Based: {selectedUser.ipBasedLogin ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4" />
                        <span className="text-sm">Time Based: {selectedUser.timeBasedLogin ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 min-h-4 max-h-4 min-w-4 max-w-4" />
                        <span className="text-sm">Geo Location: {selectedUser.locationBasedLogin ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                <DialogFooter  className="px-2 md:px-6 py-4 gap-2">
                    <Button
                      variant="default"
                      onClick={() => handleEdit(selectedUser)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteUser(selectedUser)
                      }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => setIsDeleteDialogOpen(false)}>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="py-4">
                  <p className="mb-2">
                    You are about to delete: <strong>{selectedUser.fullName}</strong>
                  </p>
                  <p className="text-destructive">This will permanently remove the user and all associated records.</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </div>
  )
}