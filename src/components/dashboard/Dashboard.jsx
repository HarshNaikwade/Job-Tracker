import { useState, useEffect } from "react";
import { SortDesc, Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import {
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  APPLICATION_STATUS,
} from "../../services/firebase";
import ApplicationCard from "./ApplicationCard";
import ApplicationForm from "./ApplicationForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import FloatingActionButton from "../ui/FloatingActionButton";
import { Button } from "../ui/button";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering and sorting
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("lastUpdated");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
  });

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedApplications = await getApplications(currentUser.uid);
      setApplications(fetchedApplications);
    } catch (err) {
      console.error("Error fetching applications:", err);

      // Give more specific error message for the index error
      if (err.code === "failed-precondition" && err.message.includes("index")) {
        setError(
          "This query requires a Firestore index. Please click the link in the console error to create it, then refresh."
        );
        toast.error("Firebase index required. See console for details.", {
          description:
            "Click the link in the console error to create the needed index.",
        });
      } else {
        setError("Failed to load your applications");
        toast.error("Failed to load applications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser]);

  // Recalculate stats whenever applications change
  useEffect(() => {
    const statusCounts = {};
    Object.values(APPLICATION_STATUS).forEach((status) => {
      statusCounts[status] = applications.filter(
        (app) => app.status === status
      ).length;
    });
    setStats({
      total: applications.length,
      byStatus: statusCounts,
    });
  }, [applications]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...applications];

    // Apply status filter
    if (selectedStatus !== "All") {
      result = result.filter((app) => app.status === selectedStatus);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.companyName.toLowerCase().includes(term) ||
          app.jobRole.toLowerCase().includes(term) ||
          (app.notes && app.notes.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        const dateA = new Date(a.dateApplied || a.createdAt);
        const dateB = new Date(b.dateApplied || b.createdAt);
        return dateB - dateA; // newest first
      } else if (sortOrder === "oldest") {
        const dateA = new Date(a.dateApplied || a.createdAt);
        const dateB = new Date(b.dateApplied || b.createdAt);
        return dateA - dateB; // oldest first
      } else if (sortOrder === "lastUpdated") {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // most recently updated first
      }
      return 0;
    });

    setFilteredApplications(result);
  }, [applications, selectedStatus, searchTerm, sortOrder]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (currentApplication) {
        // Update existing application
        await updateApplication(currentApplication.id, formData);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === currentApplication.id
              ? { ...app, ...formData, updatedAt: new Date() }
              : app
          )
        );
        toast.success("Application updated successfully");
      } else {
        // Add new application
        const newAppRef = await addApplication(currentUser.uid, formData);
        const newApp = {
          id: newAppRef.id,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setApplications((prev) => [newApp, ...prev]);
        toast.success("Application added successfully");
      }

      setShowForm(false);
      setCurrentApplication(null);
    } catch (err) {
      console.error("Error saving application:", err);
      toast.error(
        currentApplication
          ? "Failed to update application"
          : "Failed to add application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle application deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await deleteApplication(id);
        setApplications((prev) => prev.filter((app) => app.id !== id));
        toast.success("Application deleted successfully");
      } catch (err) {
        console.error("Error deleting application:", err);
        toast.error("Failed to delete application");
      }
    }
  };

  // Handle editing an application
  const handleEdit = (application) => {
    setCurrentApplication(application);
    setShowForm(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedStatus("All");
    setSearchTerm("");
    setSortOrder("lastUpdated");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Job Applications
            </h1>
            <p className="text-foreground/70 mt-1">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""} in total
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applications..."
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-md border bg-background/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`bg-primary/10 border border-primary/20 p-4 rounded-lg cursor-pointer ${
              selectedStatus === "All" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedStatus("All")}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">All</h3>
              <span className="text-lg font-bold">{stats.total}</span>
            </div>
          </motion.div>

          {Object.entries(stats.byStatus).map(([status, count], index) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className={`bg-card border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedStatus === status ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedStatus(status)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{status}</h3>
                <span className="text-lg font-bold">{count}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-lg shadow-sm border p-4 mb-6"
        >
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-foreground/70" />
              <span className="text-sm font-medium">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-sm bg-background border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="lastUpdated">Last Updated</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
              className="text-sm flex items-center gap-1 text-primary"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1.5,
                  ease: "linear",
                  repeat: Infinity,
                }}
                className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full"
              ></motion.div>
              <p className="mt-4 text-foreground/70">
                Loading your applications...
              </p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/10 text-destructive p-6 rounded-lg text-center"
          >
            <p>{error}</p>
            <Button onClick={fetchApplications} className="mt-4">
              Try Again
            </Button>
          </motion.div>
        ) : filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg border p-8 text-center"
          >
            {applications.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  No applications yet
                </h3>
                <p className="text-foreground/70 mb-6">
                  Start by adding your first job application.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Application
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  No matching applications
                </h3>
                <p className="text-foreground/70 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <Button onClick={resetFilters}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Add Floating Action Button */}
      <div>
        <FloatingActionButton onClick={() => setShowForm(true)} />
      </div>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ApplicationForm
            application={currentApplication}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setCurrentApplication(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
