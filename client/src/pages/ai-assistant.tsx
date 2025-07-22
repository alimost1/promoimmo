import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Clock, 
  Languages, 
  Settings, 
  Bot, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Globe,
  Send
} from "lucide-react";
import { format } from "date-fns";

export default function AIAssistant() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/messages"],
  });

  // Mock AI stats - in a real implementation, these would come from AI service analytics
  const aiStats = {
    messagesHandled: 342,
    averageResponseTime: "1.2s",
    languagesSupported: 8,
    satisfactionRate: 94.5,
    automationRate: 78.3,
    activeSessions: 23,
  };

  const recentInteractions = [
    {
      id: 1,
      guestName: "Sarah Johnson",
      message: "What time is check-in?",
      aiResponse: "Check-in time is 3:00 PM. You can check in anytime after that. Would you like me to arrange early check-in?",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      language: "English",
      resolved: true,
    },
    {
      id: 2,
      guestName: "Carlos Mendez",
      message: "¿Dónde está el WiFi password?",
      aiResponse: "La contraseña del WiFi es 'CloudStay2024'. También puede encontrarla en la mesa de la sala. ¿Hay algo más en lo que pueda ayudarle?",
      timestamp: new Date(Date.now() - 1000 * 60 * 32), // 32 minutes ago
      language: "Spanish",
      resolved: true,
    },
    {
      id: 3,
      guestName: "Liu Wei",
      message: "How to use the coffee machine?",
      aiResponse: "The coffee machine is a Nespresso system. Insert a capsule, close the lid, and press the large button. There are additional capsules in the kitchen cabinet above the machine.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      language: "English",
      resolved: true,
    },
  ];

  const testAIMutation = useMutation({
    mutationFn: (message: string) =>
      // In a real implementation, this would call your AI service
      new Promise((resolve) => setTimeout(() => resolve({ response: `AI Response to: "${message}"` }), 1000)),
    onSuccess: () => {
      toast({ title: "AI test completed successfully" });
      setTestMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "AI test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestMessage = () => {
    if (testMessage.trim()) {
      testAIMutation.mutate(testMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-gray-500">Automated guest support and communication</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">AI Assistant</span>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}>
              <span className={`w-2 h-2 ${isEnabled ? "bg-green-400" : "bg-gray-400"} rounded-full mr-2`}></span>
              {isEnabled ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Recent Interactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* AI Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Messages Handled Today</p>
                    <p className="text-2xl font-bold text-gray-900">{aiStats.messagesHandled}</p>
                    <p className="text-sm text-green-600 mt-1">+23% from yesterday</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{aiStats.averageResponseTime}</p>
                    <p className="text-sm text-green-600 mt-1">-0.3s improvement</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Languages Supported</p>
                    <p className="text-2xl font-bold text-gray-900">{aiStats.languagesSupported}</p>
                    <p className="text-sm text-blue-600 mt-1">Multilingual ready</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Languages className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Satisfaction Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{aiStats.satisfactionRate}%</p>
                    <p className="text-sm text-green-600 mt-1">+2.3% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span>AI Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Guest FAQ</p>
                      <p className="text-sm text-gray-500">Check-in, WiFi, amenities</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Booking Assistance</p>
                      <p className="text-sm text-gray-500">Modifications, extensions</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Local Recommendations</p>
                      <p className="text-sm text-gray-500">Restaurants, attractions</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Requests</p>
                      <p className="text-sm text-gray-500">Route to staff for issues</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Learning</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Test AI Assistant */}
            <Card>
              <CardHeader>
                <CardTitle>Test AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Test Message</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask the AI assistant a question..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTestMessage()}
                    />
                    <Button 
                      onClick={handleTestMessage}
                      disabled={!testMessage.trim() || testAIMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Quick Test Examples:</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setTestMessage("What time is check-in?")}
                    >
                      "What time is check-in?"
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setTestMessage("Where can I find the WiFi password?")}
                    >
                      "Where can I find the WiFi password?"
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setTestMessage("Can you recommend a nearby restaurant?")}
                    >
                      "Can you recommend a nearby restaurant?"
                    </Button>
                  </div>
                </div>

                {testAIMutation.isPending && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{interaction.guestName}</h4>
                        <p className="text-sm text-gray-500">
                          {format(interaction.timestamp, "MMM dd, h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{interaction.language}</Badge>
                        {interaction.resolved && (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Guest:</p>
                        <p className="text-sm text-blue-800">{interaction.message}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">AI Assistant:</p>
                        <p className="text-sm text-gray-700">{interaction.aiResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentInteractions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent interactions</h3>
                    <p className="text-gray-500">AI interactions will appear here as they happen.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Auto-Response</p>
                      <p className="text-sm text-gray-500">Automatically respond to common questions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Multilingual Support</p>
                      <p className="text-sm text-gray-500">Detect and respond in guest's language</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Learning Mode</p>
                      <p className="text-sm text-gray-500">Continuously improve responses</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Escalation Alerts</p>
                      <p className="text-sm text-gray-500">Notify staff for complex issues</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Response Tone</label>
                    <Select defaultValue="friendly">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Default Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Response Delay (seconds)</label>
                    <Input type="number" defaultValue="1" min="0" max="10" className="mt-1" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Max Response Length</label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (100 chars)</SelectItem>
                        <SelectItem value="medium">Medium (250 chars)</SelectItem>
                        <SelectItem value="long">Long (500 chars)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Automation Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{aiStats.automationRate}%</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{aiStats.activeSessions}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cost Savings</p>
                    <p className="text-2xl font-bold text-gray-900">$2,340</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Top Question Categories</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Check-in/Check-out</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">WiFi & Amenities</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "32%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">32%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Local Information</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">18%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintenance Issues</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: "5%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Response Quality</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm font-semibold text-green-600">96.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Helpfulness</span>
                      <span className="text-sm font-semibold text-green-600">94.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resolution Rate</span>
                      <span className="text-sm font-semibold text-blue-600">89.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Escalation Rate</span>
                      <span className="text-sm font-semibold text-orange-600">8.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
