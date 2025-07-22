import { useQuery } from "@tanstack/react-query";
import StatsOverview from "@/components/dashboard/stats-overview";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentBookings from "@/components/dashboard/recent-bookings";
import PropertyPerformance from "@/components/dashboard/property-performance";
import QuickActions from "@/components/dashboard/quick-actions";
import ChannelManager from "@/components/dashboard/channel-manager";
import AIAssistantPanel from "@/components/dashboard/ai-assistant-panel";

type DashboardStats = {
  totalProperties: number;
  activeBookings: number;
  occupancyRate: number;
  monthlyRevenue: number;
  unreadMessages: number;
  pendingTasks: number;
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Recent Bookings */}
        <RecentBookings />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Performance */}
        <PropertyPerformance />

        {/* Quick Actions */}
        <QuickActions stats={stats} />
      </div>

      {/* Channel Manager Section */}
      <ChannelManager />

      {/* AI Assistant Panel */}
      <AIAssistantPanel />
    </div>
  );
}
