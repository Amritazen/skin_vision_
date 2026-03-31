import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import Home from "@/pages/Home";
import Analyze from "@/pages/Analyze";
import ScanResult from "@/pages/ScanResult";
import FindDermatologist from "@/pages/FindDermatologist";
import SelfCare from "@/pages/SelfCare";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/result/:id" component={ScanResult} />
      <ProtectedRoute path="/analyze" component={Analyze} />
      <ProtectedRoute path="/dermatologist" component={FindDermatologist} />
      <ProtectedRoute path="/self-care" component={SelfCare} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
