import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import DashboardComponent from "../components/dashboard/Dashboard";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // If not authenticated, redirect to login
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" />;
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
      <main className="flex-1">
        <DashboardComponent />
      </main>
    </motion.div>
  );
};

export default DashboardPage;
