import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for the chart - in a real app this would come from the analytics API
const mockRevenueData = [
  { month: "Jan", revenue: 12000, bookings: 45 },
  { month: "Feb", revenue: 15000, bookings: 52 },
  { month: "Mar", revenue: 18000, bookings: 58 },
  { month: "Apr", revenue: 16000, bookings: 51 },
  { month: "May", revenue: 22000, bookings: 67 },
  { month: "Jun", revenue: 25000, bookings: 73 },
  { month: "Jul", revenue: 28000, bookings: 78 },
  { month: "Aug", revenue: 24000, bookings: 71 },
  { month: "Sep", revenue: 27000, bookings: 76 },
  { month: "Oct", revenue: 30000, bookings: 82 },
  { month: "Nov", revenue: 26000, bookings: 74 },
  { month: "Dec", revenue: 32000, bookings: 89 },
];

export default function RevenueChart() {
  const { data: analytics = [] } = useQuery<any[]>({
    queryKey: ["/api/analytics"],
  });

  // Use mock data for now, replace with real analytics data when available
  const chartData = analytics?.length ? analytics : mockRevenueData;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
        <p className="text-sm text-gray-500">Monthly revenue and booking trends</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="revenue" orientation="left" />
            <YAxis yAxisId="bookings" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Bookings'
              ]}
            />
            <Legend />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(207, 90%, 54%)" 
              strokeWidth={2}
              name="Revenue"
            />
            <Line 
              yAxisId="bookings"
              type="monotone" 
              dataKey="bookings" 
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={2}
              name="Bookings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
