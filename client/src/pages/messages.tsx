import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@shared/schema";

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => apiRequest("PUT", `/api/messages/${messageId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/messages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setReplyText("");
      toast({ title: "Reply sent successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    createMessageMutation.mutate({
      bookingId: selectedMessage.bookingId,
      propertyId: selectedMessage.propertyId,
      sender: "host",
      senderName: "Host",
      senderEmail: "host@cloudstay.com",
      message: replyText,
      source: selectedMessage.source,
    });
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "airbnb":
        return "bg-red-100 text-red-800";
      case "booking_com":
        return "bg-blue-100 text-blue-800";
      case "vrbo":
        return "bg-purple-100 text-purple-800";
      case "whatsapp":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {messages?.filter((m: Message) => !m.isRead).length || 0} unread
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-4">
          {messages?.length ? (
            messages.map((message: Message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id
                    ? "border-blue-500 bg-blue-50"
                    : message.isRead
                    ? "hover:bg-gray-50"
                    : "border-blue-200 bg-blue-50"
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">
                        {message.senderName || "Guest"}
                      </span>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <Badge className={getSourceBadgeColor(message.source || "direct")}>
                      {message.source || "direct"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {message.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Property #{message.propertyId}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
              <p className="text-gray-500">Guest messages will appear here.</p>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div>
                    <span>Message from {selectedMessage.senderName || "Guest"}</span>
                    <Badge className={`ml-2 ${getSourceBadgeColor(selectedMessage.source || "direct")}`}>
                      {selectedMessage.source || "direct"}
                    </Badge>
                  </div>
                  <span className="text-sm font-normal text-gray-500">
                    {selectedMessage.createdAt ? formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true }) : "Unknown"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Property #{selectedMessage.propertyId}</p>
                  {selectedMessage.bookingId && (
                    <p className="text-sm text-gray-600">Booking #{selectedMessage.bookingId}</p>
                  )}
                  <p className="text-sm text-gray-600">From: {selectedMessage.senderEmail}</p>
                </div>
                
                <div className="bg-white border-l-4 border-blue-500 p-4">
                  <p className="text-gray-900">{selectedMessage.message}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Reply to guest:</label>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || createMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createMessageMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
