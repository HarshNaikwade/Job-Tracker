import { useState, useEffect } from "react";
import {
  PlusIcon,
  LoaderIcon,
  MailIcon,
  LayoutDashboard,
  ListFilter,
  Search,
} from "lucide-react";
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
import GmailIntegration from "./GmailIntegration";
import ApplicationStats from "./ApplicationStats";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState("applications");
  const [searchTerm, setSearchTerm] = useState("");

  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load applications on component mount
  useEffect(() => {
    fetchApplications();
  }, [currentUser]);

  // Filter applications when the list, filter, or search query changes
  useEffect(() => {
    let filtered = applications;

    // Apply status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.companyName.toLowerCase().includes(term) ||
          app.jobRole.toLowerCase().includes(term) ||
          (app.notes && app.notes.toLowerCase().includes(term))
      );
    }

    setFilteredApplications(filtered);
  }, [applications, filterStatus, searchTerm]);

  // Fetch applications from Firestore
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const fetchedApplications = await getApplications(currentUser.uid);
      setApplications(fetchedApplications);
      setError(null);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load your job applications. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load your job applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new application
  const handleAddApplication = async (data) => {
    try {
      setLoading(true);
      await addApplication(currentUser.uid, data);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Job application added successfully",
      });
      await fetchApplications();
    } catch (err) {
      console.error("Error adding application:", err);
      toast({
        title: "Error",
        description: "Failed to add job application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle updating an application
  const handleUpdateApplication = async (data) => {
    try {
      setLoading(true);
      await updateApplication(currentApplication.id, data);
      setIsFormOpen(false);
      setCurrentApplication(null);
      toast({
        title: "Success",
        description: "Job application updated successfully",
      });
      await fetchApplications();
    } catch (err) {
      console.error("Error updating application:", err);
      toast({
        title: "Error",
        description: "Failed to update job application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an application
  const handleDeleteApplication = async (id) => {
    try {
      setLoading(true);
      await deleteApplication(id);
      toast({
        title: "Success",
        description: "Job application deleted successfully",
      });
      await fetchApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
      toast({
        title: "Error",
        description: "Failed to delete job application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open form to edit an application
  const handleEditApplication = (application) => {
    setCurrentApplication(application);
    setIsFormOpen(true);
  };

  // Close the form dialog
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentApplication(null);
  };

  // Open form to add a new application
  const handleOpenForm = () => {
    setCurrentApplication(null);
    setIsFormOpen(true);
  };

  return (
    <div className="page-container pt-20 pb-16 ">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Job Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your job search process
          </p>
        </div>

        <div className="hidden md:block mt-4 sm:mt-0 items-center ">
          <Button onClick={handleOpenForm} className="flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="applications"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="applications" className="flex items-center">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Applications
          </TabsTrigger>
          {/* <TabsTrigger value="integrations" className="flex items-center">
            <MailIcon className="w-4 h-4 mr-2" />
            Gmail Integration
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, position, or location"
              className="pl-10"
            />
          </div>
          {/* Application Stats */}
          {!loading && applications.length > 0 && (
            <ApplicationStats applications={applications} />
          )}

          {/* Status Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ListFilter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by status:</span>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded p-1 text-sm bg-background"
            >
              <option value="All">All Applications</option>
              {Object.values(APPLICATION_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Applications List */}
          {loading && applications.length === 0 ? (
            <div className="flex justify-center py-12">
              <LoaderIcon className="w-8 h-8 animate-spin text-primary/70" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={fetchApplications}
              >
                Try Again
              </Button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-muted py-12 px-4 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">
                No applications found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm.trim() !== ""
                  ? "No applications match your search."
                  : filterStatus === "All"
                  ? "You haven't added any job applications yet."
                  : `You don't have any ${filterStatus} applications.`}
              </p>
              {filterStatus === "All" && searchTerm.trim() === "" && (
                <Button onClick={handleOpenForm}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Application
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Gmail Integration Tab */}
        <TabsContent value="integrations">
          <GmailIntegration />
        </TabsContent>
      </Tabs>

      {/* Application Form Dialog - Outside TabsContent so it's visible regardless of active tab */}
      <AnimatePresence>
        {isFormOpen && (
          <ApplicationForm
            application={currentApplication}
            onSubmit={
              currentApplication
                ? handleUpdateApplication
                : handleAddApplication
            }
            onCancel={handleCloseForm}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed right-6 bottom-6 md:hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={handleOpenForm}
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
