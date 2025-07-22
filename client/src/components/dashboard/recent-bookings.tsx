import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDate } from "date-fns";

export default function RecentBookings() {
  const { data: bookings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/bookings/recent"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="text-sm text-gray-500">Latest reservation activity</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        <p className="text-sm text-gray-500">Latest reservation activity</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {bookings?.length ? (
            bookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {booking.guestName?.charAt(0) || "G"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Property #{booking.propertyId}</p>
                    <p className="text-xs text-gray-500">{booking.guestName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(new Date(booking.checkInDate), "MMM dd")} - {formatDate(new Date(booking.checkOutDate), "MMM dd")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent bookings found</p>
            </div>
          )}
        </div>
        {bookings?.length > 0 && (
          <div className="mt-4">
            <Link href="/bookings">
              <Button variant="ghost" className="w-full">
                View All Bookings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
