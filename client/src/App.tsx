import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import Bookings from "@/pages/bookings";
import Messages from "@/pages/messages";
import Analytics from "@/pages/analytics";
import Owners from "@/pages/owners";
import Payments from "@/pages/payments";
import Integrations from "@/pages/integrations";
import Housekeeping from "@/pages/housekeeping";
import AIAssistant from "@/pages/ai-assistant";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/properties" component={Properties} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/messages" component={Messages} />
            <Route path="/housekeeping" component={Housekeeping} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/owners" component={Owners} />
            <Route path="/payments" component={Payments} />
            <Route path="/integrations" component={Integrations} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
