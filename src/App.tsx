import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load pages for code splitting
const PromptGenerator = lazy(() => import("./pages/PromptGenerator"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load heavy components
const GlobalStats = lazy(() => 
  import("./components/stats/GlobalStats").then(mod => ({ default: mod.GlobalStats }))
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoadingSpinner />}>
            <Routes>
              <Route path="/" element={<PromptGenerator />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        {/* Global Stats Bar - Shows real-time animated stats at bottom of page */}
        <Suspense fallback={null}>
          <GlobalStats />
        </Suspense>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
