import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Callback from "./pages/Callback";
import Home from "./pages/Home";
import NotFound from "@/pages/not-found";
import Login from "./components/Login";
import { magic } from "./lib/magic";

function Router() {
  const [location] = useLocation(); 
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await magic.user.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkLogin();
  }, [location]); 

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Always allow callback */}
      <Route path="/callback" component={Callback} />

      {/* Not logged in → show login */}
      {!isLoggedIn && <Route path="*" component={Login} />}

      {/* Logged in → show app */}
      {isLoggedIn && (
        <>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
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