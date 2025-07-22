import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Clock, Filter, Download } from "lucide-react";
import { format } from "date-fns";
import type { Payment, Booking } from "@shared/schema";

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const refundPaymentMutation = useMutation({
    mutationFn: (paymentId: number) => 
      apiRequest("PUT", `/api/payments/${paymentId}`, { status: "refunded" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment refunded successfully" });
      setSelectedPayment(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error processing refund",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const retryPaymentMutation = useMutation({
    mutationFn: (paymentId: number) => 
      apiRequest("PUT", `/api/payments/${paymentId}`, { status: "pending" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment retry initiated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error retrying payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBookingInfo = (bookingId: number) => {
    return bookings.find((booking: Booking) => booking.id === bookingId);
  };

  const filteredPayments = payments.filter((payment: Payment) => 
    statusFilter === "all" || payment.status === statusFilter
  );

  const stats = payments.reduce((acc: any, payment: Payment) => {
    acc.total += Number(payment.amount);
    acc.count++;
    if (payment.status === "completed") acc.completed++;
    if (payment.status === "pending") acc.pending++;
    if (payment.status === "failed") acc.failed++;
    return acc;
  }, { total: 0, count: 0, completed: 0, pending: 0, failed: 0 }) || 
  { total: 0, count: 0, completed: 0, pending: 0, failed: 0 };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Payments</h1>
          <div className="flex space-x-2">
            <Button disabled variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.total.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length ? (
              filteredPayments.map((payment: Payment) => {
                const booking = getBookingInfo(payment.bookingId);
                return (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">
                          Payment #{payment.id}
                          {booking && (
                            <span className="text-gray-500 ml-2">
                              - Booking #{booking.id}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking?.guestName} • {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                        </p>
                        {payment.paymentMethod && (
                          <p className="text-xs text-gray-400 capitalize">
                            via {payment.paymentMethod}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">${payment.amount}</p>
                        {payment.processingFee && (
                          <p className="text-xs text-gray-500">
                            Fee: ${payment.processingFee}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        {payment.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryPaymentMutation.mutate(payment.id)}
                            disabled={retryPaymentMutation.isPending}
                          >
                            Retry
                          </Button>
                        )}
                        {payment.status === "completed" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Refund
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Refund Payment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Are you sure you want to refund this payment?</p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p><strong>Amount:</strong> ${payment.amount}</p>
                                  <p><strong>Booking:</strong> #{payment.bookingId}</p>
                                  {booking && <p><strong>Guest:</strong> {booking.guestName}</p>}
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    onClick={() => refundPaymentMutation.mutate(payment.id)}
                                    disabled={refundPaymentMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {refundPaymentMutation.isPending ? "Processing..." : "Process Refund"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setSelectedPayment(payment)}>
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {statusFilter !== "all" 
                    ? `No ${statusFilter} payments found`
                    : "Payment transactions will appear here"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-lg font-semibold">#{selectedPayment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedPayment.status)}
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-2xl font-bold text-green-600">${selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="text-lg">{selectedPayment.currency || "USD"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="capitalize">{selectedPayment.paymentMethod || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Processing Fee</label>
                  <p>${selectedPayment.processingFee || "0.00"}</p>
                </div>
              </div>

              {selectedPayment.stripePaymentIntentId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Stripe Payment Intent</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {selectedPayment.stripePaymentIntentId}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                <p>{format(new Date(selectedPayment.createdAt), "MMMM dd, yyyy 'at' h:mm a")}</p>
              </div>

              {(() => {
                const booking = getBookingInfo(selectedPayment.bookingId);
                return booking ? (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Booking Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Booking ID:</strong> #{booking.id}</p>
                      <p><strong>Guest:</strong> {booking.guestName}</p>
                      <p><strong>Email:</strong> {booking.guestEmail}</p>
                      <p><strong>Check-in:</strong> {format(new Date(booking.checkInDate), "MMM dd, yyyy")}</p>
                      <p><strong>Check-out:</strong> {format(new Date(booking.checkOutDate), "MMM dd, yyyy")}</p>
                      <p><strong>Guests:</strong> {booking.guests}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
