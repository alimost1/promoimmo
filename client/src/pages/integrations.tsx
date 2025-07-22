import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOtaIntegrationSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Settings, CheckCircle, AlertTriangle, Clock, Home, Bed, Globe, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { OtaIntegration, Property } from "@shared/schema";

const platforms = [
  {
    id: "airbnb",
    name: "Airbnb",
    icon: Home,
    color: "text-red-500",
    bgColor: "bg-red-100",
    description: "World's leading vacation rental platform",
  },
  {
    id: "booking_com",
    name: "Booking.com",
    icon: Bed,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    description: "Leading accommodation booking site",
  },
  {
    id: "vrbo",
    name: "VRBO",
    icon: Home,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    description: "Vacation rental by owner platform",
  },
  {
    id: "expedia",
    name: "Expedia",
    icon: Globe,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    description: "Global travel booking platform",
  },
];

export default function Integrations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const { toast } = useToast();

  const { data: integrations = [], isLoading } = useQuery<OtaIntegration[]>({
    queryKey: ["/api/integrations/ota"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm({
    resolver: zodResolver(insertOtaIntegrationSchema),
    defaultValues: {
      platform: "",
      propertyId: undefined,
      externalPropertyId: "",
      isActive: true,
      syncSettings: {},
      credentials: {},
    },
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/integrations/ota", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/ota"] });
      toast({ title: "Integration created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/integrations/ota/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/ota"] });
      toast({ title: "Integration updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncIntegrationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/integrations/ota/${id}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/ota"] });
      toast({ title: "Sync completed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createIntegrationMutation.mutate(data);
  };

  const getStatusColor = (isActive: boolean, lastSync?: string) => {
    if (!isActive) return "bg-gray-100 text-gray-800";
    if (!lastSync) return "bg-yellow-100 text-yellow-800";
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - syncDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 24) return "bg-red-100 text-red-800";
    if (hoursSinceSync > 2) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (isActive: boolean, lastSync?: string) => {
    if (!isActive) return "Disabled";
    if (!lastSync) return "Never synced";
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - syncDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 24) return "Sync overdue";
    if (hoursSinceSync > 2) return "Sync needed";
    return "Connected";
  };

  const getIntegrationsByPlatform = (platform: string) => {
    return integrations?.filter((int: OtaIntegration) => int.platform === platform) || [];
  };

  const getPlatformStats = (platform: string) => {
    const platformIntegrations = getIntegrationsByPlatform(platform);
    return {
      total: platformIntegrations.length,
      active: platformIntegrations.filter((int: OtaIntegration) => int.isActive).length,
      synced: platformIntegrations.filter((int: OtaIntegration) => int.lastSyncAt).length,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Integrations</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
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
        <h1 className="text-2xl font-bold">Platform Integrations</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              // Sync all active integrations
              integrations?.forEach((integration: OtaIntegration) => {
                if (integration.isActive) {
                  syncIntegrationMutation.mutate(integration.id);
                }
              });
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Platform Integration</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {platforms.map((platform) => (
                              <SelectItem key={platform.id} value={platform.id}>
                                {platform.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {properties?.map((property: Property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="externalPropertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Property ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Property ID on the platform" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createIntegrationMutation.isPending}>
                      {createIntegrationMutation.isPending ? "Creating..." : "Create Integration"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
          <TabsTrigger value="booking_com">Booking.com</TabsTrigger>
          <TabsTrigger value="vrbo">VRBO</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const stats = getPlatformStats(platform.id);
              
              return (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${platform.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${platform.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Properties:</span>
                        <span className="font-semibold">{stats.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Active:</span>
                        <span className="font-semibold text-green-600">{stats.active}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Synced:</span>
                        <span className="font-semibold">{stats.synced}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* All Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>All Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations?.length ? (
                  integrations.map((integration: OtaIntegration) => {
                    const platform = platforms.find(p => p.id === integration.platform);
                    const Icon = platform?.icon || Globe;
                    const property = properties?.find((p: Property) => p.id === integration.propertyId);
                    
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${platform?.bgColor || "bg-gray-100"} rounded-lg flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${platform?.color || "text-gray-600"}`} />
                          </div>
                          <div>
                            <p className="font-medium">{platform?.name || integration.platform}</p>
                            <p className="text-sm text-gray-500">{property?.name}</p>
                            <p className="text-xs text-gray-400">
                              External ID: {integration.externalPropertyId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge className={getStatusColor(integration.isActive, integration.lastSyncAt || undefined)}>
                              {getStatusText(integration.isActive, integration.lastSyncAt || undefined)}
                            </Badge>
                            {integration.lastSyncAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Last sync: {format(new Date(integration.lastSyncAt), "MMM dd, h:mm a")}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={integration.isActive}
                              onCheckedChange={(checked) => 
                                toggleIntegrationMutation.mutate({
                                  id: integration.id,
                                  isActive: checked,
                                })
                              }
                            />
                            
                            {integration.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => syncIntegrationMutation.mutate(integration.id)}
                                disabled={syncIntegrationMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button size="sm" variant="ghost">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations configured</h3>
                    <p className="text-gray-500">Connect your properties to OTA platforms to start syncing.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="airbnb" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-red-500" />
                <span>Airbnb Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect your properties to Airbnb to automatically sync availability, rates, and reservations.
                </p>
                
                {getIntegrationsByPlatform("airbnb").length > 0 ? (
                  <div className="space-y-3">
                    {getIntegrationsByPlatform("airbnb").map((integration: OtaIntegration) => {
                      const property = properties?.find((p: Property) => p.id === integration.propertyId);
                      return (
                        <div key={integration.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{property?.name}</p>
                              <p className="text-sm text-gray-500">ID: {integration.externalPropertyId}</p>
                            </div>
                            <Badge className={getStatusColor(integration.isActive, integration.lastSyncAt || undefined)}>
                              {getStatusText(integration.isActive, integration.lastSyncAt || undefined)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No Airbnb integrations configured</p>
                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      Add Airbnb Integration
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking_com" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bed className="h-5 w-5 text-blue-500" />
                <span>Booking.com Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect to Booking.com to reach millions of travelers worldwide.
                </p>
                
                {getIntegrationsByPlatform("booking_com").length > 0 ? (
                  <div className="space-y-3">
                    {getIntegrationsByPlatform("booking_com").map((integration: OtaIntegration) => {
                      const property = properties?.find((p: Property) => p.id === integration.propertyId);
                      return (
                        <div key={integration.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{property?.name}</p>
                              <p className="text-sm text-gray-500">ID: {integration.externalPropertyId}</p>
                            </div>
                            <Badge className={getStatusColor(integration.isActive, integration.lastSyncAt || undefined)}>
                              {getStatusText(integration.isActive, integration.lastSyncAt || undefined)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No Booking.com integrations configured</p>
                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      Add Booking.com Integration
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vrbo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-purple-500" />
                <span>VRBO Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect to VRBO (Vacation Rental By Owner) for vacation rental bookings.
                </p>
                
                {getIntegrationsByPlatform("vrbo").length > 0 ? (
                  <div className="space-y-3">
                    {getIntegrationsByPlatform("vrbo").map((integration: OtaIntegration) => {
                      const property = properties?.find((p: Property) => p.id === integration.propertyId);
                      return (
                        <div key={integration.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{property?.name}</p>
                              <p className="text-sm text-gray-500">ID: {integration.externalPropertyId}</p>
                            </div>
                            <Badge className={getStatusColor(integration.isActive, integration.lastSyncAt || undefined)}>
                              {getStatusText(integration.isActive, integration.lastSyncAt || undefined)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No VRBO integrations configured</p>
                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      Add VRBO Integration
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span>Messaging Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">WhatsApp Business</h4>
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Connect WhatsApp Business API for guest messaging.
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Configure WhatsApp
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">SMS Integration</h4>
                      <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Send SMS notifications and messages to guests.
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Configure SMS
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Unified Inbox</h4>
                  <p className="text-sm text-blue-800">
                    All messages from different platforms will be consolidated in your unified inbox for easy management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
