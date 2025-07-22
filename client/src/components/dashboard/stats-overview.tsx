import { Home, Calendar, TrendingUp, DollarSign } from "lucide-react";

interface StatsOverviewProps {
  stats?: {
    totalProperties: number;
    activeBookings: number;
    occupancyRate: number;
    monthlyRevenue: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statsData = [
    {
      name: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: Home,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: Calendar,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      name: "Occupancy Rate",
      value: `${stats?.occupancyRate || 0}%`,
      icon: TrendingUp,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      name: "Monthly Revenue",
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
