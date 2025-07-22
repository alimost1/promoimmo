import { Mail, CheckSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface QuickActionsProps {
  stats?: {
    unreadMessages: number;
    pendingTasks: number;
  };
}

export default function QuickActions({ stats }: QuickActionsProps) {
  const actions = [
    {
      title: "Unread Messages",
      description: `${stats?.unreadMessages || 0} new guest messages`,
      icon: Mail,
      href: "/messages",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Cleanings",
      description: `${stats?.pendingTasks || 0} properties need cleaning`,
      icon: CheckSquare,
      href: "/housekeeping",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Payment Issues",
      description: "Review failed payments",
      icon: AlertTriangle,
      href: "/payments",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500">Recent messages and tasks</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <div className={`flex items-center justify-between p-3 ${action.bgColor} rounded-lg hover:opacity-80 transition-opacity cursor-pointer`}>
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <span className="sr-only">View {action.title}</span>
                    →
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
