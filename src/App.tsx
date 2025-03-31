import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ConfirmPasswordReset from "./pages/ConfirmPasswordReset";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

// Move AuthProvider inside AnimatedRoutes to ensure correct context nesting
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/confirm-password-reset"
            element={<ConfirmPasswordReset />}
          />
          {/* Handle Firebase password reset URLs directly */}
          <Route path="/__/auth/action/" element={<ConfirmPasswordReset />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Toaster />
          <Sonner position="top-center" closeButton className="z-[100]" />
          <AnimatedRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
