import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Home, DollarSign, TrendingUp, Mail, Phone } from "lucide-react";
import type { User as UserType, Property } from "@shared/schema";

export default function Owners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<UserType | null>(null);
  const { toast } = useToast();

  const { data: owners = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users?role=owner"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema.extend({
      role: insertUserSchema.shape.role.default("owner"),
    })),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "owner",
    },
  });

  const createOwnerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=owner"] });
      toast({ title: "Owner created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating owner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createOwnerMutation.mutate(data);
  };

  const getOwnerProperties = (ownerId: number) => {
    return properties?.filter((property: Property) => property.ownerId === ownerId) || [];
  };

  const getOwnerStats = (ownerId: number) => {
    const ownerProperties = getOwnerProperties(ownerId);
    const totalProperties = ownerProperties.length;
    // Mock revenue calculation - in real app would come from analytics
    const totalRevenue = totalProperties * 2500; // Mock average revenue per property
    const occupancyRate = 85; // Mock occupancy rate

    return {
      totalProperties,
      totalRevenue,
      occupancyRate,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Property Owners</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Owner
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
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
        <h1 className="text-2xl font-bold">Property Owners</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Owner</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOwnerMutation.isPending}>
                    {createOwnerMutation.isPending ? "Creating..." : "Create Owner"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {selectedOwner ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setSelectedOwner(null)}>
              ← Back to All Owners
            </Button>
            <h2 className="text-xl font-semibold">
              {selectedOwner.firstName} {selectedOwner.lastName}
            </h2>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const stats = getOwnerStats(selectedOwner.id);
                  return (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Properties</p>
                              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                            </div>
                            <Home className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                              <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Owner Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedOwner.email}</span>
                    </div>
                    {selectedOwner.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedOwner.phone}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Badge variant="outline">{selectedOwner.role}</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getOwnerProperties(selectedOwner.id).map((property: Property) => (
                  <Card key={property.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                      <p className="text-lg font-semibold">${property.basePrice}/night</p>
                      <Badge variant={property.isActive ? "default" : "secondary"} className="mt-2">
                        {property.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                {getOwnerProperties(selectedOwner.id).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No properties assigned to this owner</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Gross Revenue (YTD)</span>
                      <span className="text-lg font-semibold">${getOwnerStats(selectedOwner.id).totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Platform Fees</span>
                      <span className="text-lg font-semibold">-$2,420</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Management Commission (10%)</span>
                      <span className="text-lg font-semibold">-${Math.round(getOwnerStats(selectedOwner.id).totalRevenue * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t-2">
                      <span className="font-bold">Net Payout</span>
                      <span className="text-xl font-bold text-green-600">
                        ${Math.round(getOwnerStats(selectedOwner.id).totalRevenue * 0.9 - 2420).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {owners?.length ? (
            owners.filter((user: UserType) => user.role === "owner").map((owner: UserType) => {
              const stats = getOwnerStats(owner.id);
              return (
                <Card key={owner.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedOwner(owner)}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {owner.firstName} {owner.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{owner.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Properties</span>
                        <span className="font-semibold">{stats.totalProperties}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Revenue</span>
                        <span className="font-semibold">${stats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Occupancy</span>
                        <span className="font-semibold">{stats.occupancyRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
              <p className="text-gray-500">Add your first property owner to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
