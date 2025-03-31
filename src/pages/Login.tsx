import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 ">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden md:flex flex-col space-y-6 p-8"
          >
            <h1 className="text-4xl font-bold tracking-tight">
              Track Your Job Applications
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay organized and never miss an opportunity with our job tracking
              dashboard. Sign in to manage your applications and get insights on
              your job search.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor all your applications in one place
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Smart Parsing</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically extract job data from emails
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Status Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Keep track of your application statuses
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Cross-Device</h3>
                <p className="text-sm text-muted-foreground">
                  Access your data on any device
                </p>
              </div>
            </div>
          </motion.div>
          <LoginForm />
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
