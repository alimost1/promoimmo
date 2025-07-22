import { MessageSquare, Clock, Languages } from "lucide-react";

export default function AIAssistantPanel() {
  const stats = [
    {
      title: "Messages Handled Today",
      value: "342",
      icon: MessageSquare,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      icon: Clock,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Languages Supported",
      value: "8",
      icon: Languages,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant Activity</h3>
            <p className="text-sm text-gray-500">Automated guest interactions and support</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Active
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{stat.value}</h4>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
