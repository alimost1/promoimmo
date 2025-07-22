import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, Bed, Globe } from "lucide-react";

export default function ChannelManager() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations/ota"],
  });

  // Mock channel data for display
  const mockChannels = [
    {
      name: "Airbnb",
      platform: "airbnb",
      icon: "🏠",
      status: "connected",
      properties: 18,
      lastSync: "2 min ago",
      bookings: 23,
    },
    {
      name: "Booking.com",
      platform: "booking_com",
      icon: "🛏️",
      status: "connected",
      properties: 20,
      lastSync: "5 min ago",
      bookings: 19,
    },
    {
      name: "VRBO",
      platform: "vrbo",
      icon: "🏡",
      status: "syncing",
      properties: 15,
      lastSync: "15 min ago",
      bookings: 5,
    },
    {
      name: "Direct Booking",
      platform: "direct",
      icon: "🌐",
      status: "active",
      properties: 20,
      conversion: "3.2%",
      revenue: "$8,420",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case "airbnb":
        return <Home className="h-5 w-5 text-red-500" />;
      case "booking_com":
        return <Bed className="h-5 w-5 text-blue-600" />;
      case "vrbo":
        return <Home className="h-5 w-5 text-purple-600" />;
      case "direct":
        return <Globe className="h-5 w-5 text-green-600" />;
      default:
        return <Home className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Channel Manager</h3>
            <p className="text-sm text-gray-500">OTA integration status and sync</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockChannels.map((channel) => (
            <div key={channel.platform} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getIcon(channel.platform)}
                  <span className="font-medium text-gray-900">{channel.name}</span>
                </div>
                <Badge className={getStatusColor(channel.status)}>
                  {channel.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Properties:</span>
                  <span>{channel.properties}</span>
                </div>
                {channel.lastSync && (
                  <div className="flex justify-between">
                    <span>Last sync:</span>
                    <span>{channel.lastSync}</span>
                  </div>
                )}
                {channel.bookings && (
                  <div className="flex justify-between">
                    <span>Bookings:</span>
                    <span>{channel.bookings}</span>
                  </div>
                )}
                {channel.conversion && (
                  <div className="flex justify-between">
                    <span>Conversion:</span>
                    <span>{channel.conversion}</span>
                  </div>
                )}
                {channel.revenue && (
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span>{channel.revenue}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
