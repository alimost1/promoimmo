import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Home, Users, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Property, Booking, HousekeepingTask } from "@shared/schema";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'booking' | 'housekeeping' | 'blocked';
    bookingId?: number;
    propertyId: number;
    propertyName: string;
    status: string;
    source?: string;
    guestName?: string;
    taskType?: string;
    assignedTo?: string;
  };
};

export default function Calendar() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<string>("month");
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Fetch housekeeping tasks
  const { data: housekeepingTasks = [] } = useQuery<HousekeepingTask[]>({
    queryKey: ["/api/housekeeping"],
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking updated successfully" });
    },
  });

  // Convert data to calendar events
  const events: CalendarEvent[] = [
    // Booking events
    ...bookings
      .filter((booking) => booking.propertyId && (selectedProperty === "all" || booking.propertyId.toString() === selectedProperty))
      .map((booking) => ({
        id: booking.id,
        title: `${booking.guestName} (${booking.source})`,
        start: new Date(booking.checkInDate),
        end: new Date(booking.checkOutDate),
        resource: {
          type: 'booking' as const,
          bookingId: booking.id,
          propertyId: booking.propertyId!,
          propertyName: properties.find((p) => p.id === booking.propertyId)?.name || 'Unknown Property',
          status: booking.status,
          source: booking.source,
          guestName: booking.guestName,
        },
      })),
    
    // Housekeeping events
    ...housekeepingTasks
      .filter((task) => task.propertyId && (selectedProperty === "all" || task.propertyId.toString() === selectedProperty))
      .filter((task) => task.dueDate)
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        return {
          id: task.id + 10000, // Offset to avoid ID conflicts
          title: `${task.taskType} (${task.status})`,
          start: dueDate,
          end: new Date(dueDate.getTime() + 2 * 60 * 60 * 1000), // 2 hour duration
          resource: {
            type: 'housekeeping' as const,
            propertyId: task.propertyId!,
            propertyName: properties.find((p) => p.id === task.propertyId)?.name || 'Unknown Property',
            status: task.status || 'pending',
            taskType: task.taskType,
            assignedTo: task.assignedTo ? `User ${task.assignedTo}` : 'Unassigned',
          },
        };
      }),
  ];

  // Event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let color = 'white';
    
    if (event.resource.type === 'booking') {
      switch (event.resource.status) {
        case 'confirmed':
          backgroundColor = '#10b981';
          break;
        case 'checked_in':
          backgroundColor = '#3b82f6';
          break;
        case 'checked_out':
          backgroundColor = '#6b7280';
          break;
        case 'cancelled':
          backgroundColor = '#ef4444';
          break;
        case 'pending':
          backgroundColor = '#f59e0b';
          break;
        default:
          backgroundColor = '#8b5cf6';
      }
    } else if (event.resource.type === 'housekeeping') {
      switch (event.resource.status) {
        case 'completed':
          backgroundColor = '#22c55e';
          break;
        case 'in_progress':
          backgroundColor = '#f97316';
          break;
        case 'pending':
          backgroundColor = '#eab308';
          break;
        default:
          backgroundColor = '#64748b';
      }
    }

    return {
      style: {
        backgroundColor,
        color,
        border: 'none',
        borderRadius: '4px',
        opacity: 0.9,
      },
    };
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const getStatusIcon = (type: string, status: string) => {
    if (type === 'booking') {
      switch (status) {
        case 'confirmed':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'checked_in':
          return <Users className="h-4 w-4 text-blue-500" />;
        case 'cancelled':
          return <XCircle className="h-4 w-4 text-red-500" />;
        case 'pending':
          return <Clock className="h-4 w-4 text-yellow-500" />;
        default:
          return <CalendarDays className="h-4 w-4" />;
      }
    } else {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'in_progress':
          return <Clock className="h-4 w-4 text-orange-500" />;
        case 'pending':
          return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        default:
          return <Home className="h-4 w-4" />;
      }
    }
  };

  const getAvailabilityStatus = (propertyId: number, date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const isBooked = bookings.some((booking) => 
      booking.propertyId === propertyId &&
      new Date(booking.checkInDate) <= dayEnd &&
      new Date(booking.checkOutDate) >= dayStart &&
      booking.status !== 'cancelled'
    );

    const hasHousekeeping = housekeepingTasks.some((task) =>
      task.propertyId === propertyId &&
      task.dueDate &&
      new Date(task.dueDate) >= dayStart &&
      new Date(task.dueDate) <= dayEnd &&
      task.status !== 'completed'
    );

    if (isBooked) return 'occupied';
    if (hasHousekeeping) return 'maintenance';
    return 'available';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar Management</h1>
          <p className="text-muted-foreground">
            Real-time availability across all channels with housekeeping status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Availability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {properties.filter((property) => 
                getAvailabilityStatus(property.id, new Date()) === 'available'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Properties ready to book</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {properties.filter((property) => 
                getAvailabilityStatus(property.id, new Date()) === 'occupied'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Properties with guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {properties.filter((property) => 
                getAvailabilityStatus(property.id, new Date()) === 'maintenance'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Properties under maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <CalendarDays className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {properties.length > 0 ? 
                Math.round((properties.filter((property) => 
                  getAvailabilityStatus(property.id, new Date()) === 'occupied'
                ).length / properties.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Current occupancy</p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Confirmed Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Checked In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Housekeeping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Checked Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Property Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              views={['month', 'week', 'day']}
              defaultView="month"
              popup
              showMultiDayTimes
              step={60}
              showAllEvents
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getStatusIcon(selectedEvent.resource.type, selectedEvent.resource.status)}
              {selectedEvent?.resource.type === 'booking' ? 'Booking Details' : 'Housekeeping Task'}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedEvent.resource.propertyName}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(selectedEvent.start, 'PPP')} - {format(selectedEvent.end, 'PPP')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={selectedEvent.resource.status === 'confirmed' || selectedEvent.resource.status === 'completed' ? 'default' : 'secondary'}>
                  {selectedEvent.resource.status}
                </Badge>
                {selectedEvent.resource.source && (
                  <Badge variant="outline">{selectedEvent.resource.source}</Badge>
                )}
              </div>

              {selectedEvent.resource.type === 'booking' ? (
                <div className="space-y-2">
                  <p><strong>Guest:</strong> {selectedEvent.resource.guestName}</p>
                  <p><strong>Source:</strong> {selectedEvent.resource.source}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateBookingMutation.mutate({
                          id: selectedEvent.resource.bookingId!,
                          status: 'checked_in'
                        });
                        setSelectedEvent(null);
                      }}
                      disabled={selectedEvent.resource.status === 'checked_in'}
                    >
                      Check In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateBookingMutation.mutate({
                          id: selectedEvent.resource.bookingId!,
                          status: 'checked_out'
                        });
                        setSelectedEvent(null);
                      }}
                      disabled={selectedEvent.resource.status === 'checked_out'}
                    >
                      Check Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Task Type:</strong> {selectedEvent.resource.taskType}</p>
                  <p><strong>Assigned To:</strong> {selectedEvent.resource.assignedTo}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}