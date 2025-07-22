import { useQuery } from "@tanstack/react-query";

export default function PropertyPerformance() {
  const { data: properties = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  // Mock performance data - in a real app this would come from analytics
  const mockPerformance = [
    { name: "Downtown Loft", occupancy: "92%", revenue: "$4,280", growth: "+12%" },
    { name: "Garden House", occupancy: "88%", revenue: "$3,920", growth: "+8%" },
    { name: "City Studio", occupancy: "85%", revenue: "$3,680", growth: "+5%" },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
          <p className="text-sm text-gray-500">Top performing properties</p>
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
        <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
        <p className="text-sm text-gray-500">Top performing properties</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {mockPerformance.map((property, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {property.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{property.name}</p>
                  <p className="text-xs text-gray-500">{property.occupancy} occupancy</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{property.revenue}</p>
                <p className="text-xs text-green-600">{property.growth}</p>
              </div>
            </div>
          ))}
          {properties?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
