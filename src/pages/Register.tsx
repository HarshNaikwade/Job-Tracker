import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../context/AuthContext";

const Register = () => {
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
              Start Your Job Search Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Create an account to keep track of your job applications, get
              organized, and never miss an opportunity.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Centralized Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  All your applications in one place
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Email Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-detect applications from your inbox
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Keep track of changing statuses
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Data Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze your job search performance
                </p>
              </div>
            </div>
          </motion.div>
          <RegisterForm />
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
