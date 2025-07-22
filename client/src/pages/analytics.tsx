import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Calendar, Users, Home, BarChart3 } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

const COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(348, 83%, 47%)'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery<any[]>({
    queryKey: ["/api/analytics", selectedProperty, dateRange?.from, dateRange?.to],
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const { data: dashboardStats = {} } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock analytics data for visualization
  const mockRevenueData = [
    { month: "Jan", revenue: 12000, bookings: 45, occupancy: 75 },
    { month: "Feb", revenue: 15000, bookings: 52, occupancy: 82 },
    { month: "Mar", revenue: 18000, bookings: 58, occupancy: 88 },
    { month: "Apr", revenue: 16000, bookings: 51, occupancy: 79 },
    { month: "May", revenue: 22000, bookings: 67, occupancy: 95 },
    { month: "Jun", revenue: 25000, bookings: 73, occupancy: 92 },
  ];

  const mockSourceData = [
    { name: "Direct Booking", value: 35, color: COLORS[0] },
    { name: "Airbnb", value: 40, color: COLORS[1] },
    { name: "Booking.com", value: 20, color: COLORS[2] },
    { name: "VRBO", value: 5, color: COLORS[3] },
  ];

  const mockPropertyPerformance = [
    { name: "Downtown Loft", revenue: 4280, occupancy: 92, bookings: 18 },
    { name: "Garden House", revenue: 3920, occupancy: 88, bookings: 15 },
    { name: "City Studio", revenue: 3680, occupancy: 85, bookings: 22 },
    { name: "Beach Condo", revenue: 5200, occupancy: 94, bookings: 12 },
  ];

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${(dashboardStats?.monthlyRevenue || 24680).toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Occupancy Rate",
      value: `${dashboardStats?.occupancyRate || 78.5}%`,
      change: "+3.2%",
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Avg Daily Rate",
      value: "$142",
      change: "+8.7%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Bookings",
      value: dashboardStats?.activeBookings || 47,
      change: "+15.3%",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties?.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className={`text-sm ${kpi.color} mt-1`}>{kpi.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue and Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Booking Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="revenue" orientation="left" />
              <YAxis yAxisId="bookings" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : name === 'bookings' ? 'Bookings' : 'Occupancy %'
                ]}
              />
              <Legend />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke={COLORS[0]} strokeWidth={2} name="Revenue" />
              <Line yAxisId="bookings" type="monotone" dataKey="bookings" stroke={COLORS[1]} strokeWidth={2} name="Bookings" />
              <Line yAxisId="bookings" type="monotone" dataKey="occupancy" stroke={COLORS[2]} strokeWidth={2} name="Occupancy %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockPropertyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Property</th>
                  <th className="text-right p-4 font-semibold">Revenue</th>
                  <th className="text-right p-4 font-semibold">Occupancy</th>
                  <th className="text-right p-4 font-semibold">Bookings</th>
                  <th className="text-right p-4 font-semibold">ADR</th>
                </tr>
              </thead>
              <tbody>
                {mockPropertyPerformance.map((property, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{property.name}</td>
                    <td className="p-4 text-right">${property.revenue.toLocaleString()}</td>
                    <td className="p-4 text-right">{property.occupancy}%</td>
                    <td className="p-4 text-right">{property.bookings}</td>
                    <td className="p-4 text-right">${Math.round(property.revenue / property.bookings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
