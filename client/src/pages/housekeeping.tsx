import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHousekeepingTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar as CalendarIcon, CheckSquare, Clock, AlertTriangle, User, Fan } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { HousekeepingTask, Property, Booking, User as UserType } from "@shared/schema";

export default function Housekeeping() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<HousekeepingTask[]>({
    queryKey: ["/api/housekeeping"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm({
    resolver: zodResolver(insertHousekeepingTaskSchema),
    defaultValues: {
      propertyId: undefined,
      bookingId: undefined,
      assignedTo: undefined,
      taskType: "cleaning",
      status: "pending",
      dueDate: new Date(),
      notes: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/housekeeping", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/housekeeping"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Task created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/housekeeping/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/housekeeping"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Task updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createTaskMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case "cleaning":
        return <Fan className="h-4 w-4 text-blue-600" />;
      case "maintenance":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "inspection":
        return <CheckSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Fan className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (dueDate: string, status: string) => {
    if (status === "completed") return "";
    
    const due = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return "border-l-4 border-red-500"; // Overdue
    if (hoursUntilDue < 2) return "border-l-4 border-orange-500"; // Due soon
    if (hoursUntilDue < 24) return "border-l-4 border-yellow-500"; // Due today
    return "border-l-4 border-green-500"; // Future
  };

  const getPropertyName = (propertyId: number) => {
    return properties?.find((p: Property) => p.id === propertyId)?.name || `Property #${propertyId}`;
  };

  const getBookingInfo = (bookingId?: number) => {
    if (!bookingId) return null;
    return bookings?.find((b: Booking) => b.id === bookingId);
  };

  const getAssignedUserName = (userId?: number) => {
    if (!userId) return "Unassigned";
    const user = users?.find((u: UserType) => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "Unknown";
  };

  const filteredTasks = tasks?.filter((task: HousekeepingTask) => 
    statusFilter === "all" || task.status === statusFilter
  ) || [];

  const taskStats = tasks?.reduce((acc: any, task: HousekeepingTask) => {
    acc.total++;
    if (task.status === "pending") acc.pending++;
    if (task.status === "in_progress") acc.inProgress++;
    if (task.status === "completed") acc.completed++;
    
    // Check if overdue
    const due = new Date(task.dueDate);
    const now = new Date();
    if (due < now && task.status !== "completed") acc.overdue++;
    
    return acc;
  }, { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }) || 
  { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Housekeeping</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Housekeeping</h1>
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {properties?.map((property: Property) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.name}
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
                      name="taskType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="inspection">Inspection</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users?.filter((user: UserType) => user.role === "staff").map((user: UserType) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username
                                  }
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bookingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Booking (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booking" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bookings?.map((booking: Booking) => (
                              <SelectItem key={booking.id} value={booking.id.toString()}>
                                Booking #{booking.id} - {booking.guestName}
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional task details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTaskMutation.isPending}>
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
              </div>
              <Fan className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length ? (
          filteredTasks.map((task: HousekeepingTask) => {
            const booking = getBookingInfo(task.bookingId || undefined);
            return (
              <Card key={task.id} className={cn("transition-all hover:shadow-md", getPriorityColor(task.dueDate, task.status))}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTaskTypeIcon(task.taskType)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg capitalize">
                            {task.taskType} - {getPropertyName(task.propertyId)}
                          </h3>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {getAssignedUserName(task.assignedTo || undefined)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                          {booking && (
                            <div className="text-sm text-gray-600">
                              Related to Booking #{booking.id} ({booking.guestName})
                            </div>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-sm text-gray-500 mt-2">{task.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updateTaskMutation.mutate({
                            id: task.id,
                            data: { status: "in_progress" }
                          })}
                          disabled={updateTaskMutation.isPending}
                        >
                          Start
                        </Button>
                      )}
                      
                      {task.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => updateTaskMutation.mutate({
                            id: task.id,
                            data: { status: "completed", completedAt: new Date() }
                          })}
                          disabled={updateTaskMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      
                      {task.status === "completed" && task.completedAt && (
                        <div className="text-sm text-green-600">
                          Completed {format(new Date(task.completedAt), "MMM dd, h:mm a")}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Fan className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {statusFilter !== "all" 
                ? `No ${statusFilter.replace("_", " ")} tasks found`
                : "Create your first housekeeping task to get started"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
