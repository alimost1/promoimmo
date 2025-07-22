import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, Calendar, MessageSquare, Fan, TrendingUp, 
  Users, CreditCard, Link as LinkIcon, Bot, Building
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: TrendingUp },
  { name: "Properties", href: "/properties", icon: Home },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Housekeeping", href: "/housekeeping", icon: Fan },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Owners", href: "/owners", icon: Users },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Integrations", href: "/integrations", icon: LinkIcon },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
];

type DashboardStats = {
  totalProperties: number;
  activeBookings: number;
  occupancyRate: number;
  monthlyRevenue: number;
  unreadMessages: number;
  pendingTasks: number;
};

export default function Sidebar() {
  const [location] = useLocation();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:block">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CloudStay</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            // Get badge count for certain items
            let badgeCount = null;
            if (item.name === "Properties" && stats?.totalProperties) {
              badgeCount = stats.totalProperties;
            } else if (item.name === "Bookings" && stats?.activeBookings) {
              badgeCount = stats.activeBookings;
            } else if (item.name === "Messages" && stats?.unreadMessages) {
              badgeCount = stats.unreadMessages;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                {item.name}
                {badgeCount && (
                  <span className={cn(
                    "ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full",
                    item.name === "Messages" && badgeCount > 0
                      ? "bg-red-100 text-red-800"
                      : item.name === "Bookings"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">System Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
