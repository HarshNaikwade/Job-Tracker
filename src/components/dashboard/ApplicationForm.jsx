import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { APPLICATION_STATUS } from "../../services/firebase";

const ApplicationForm = ({
  application = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    jobRole: "",
    dateApplied: new Date().toISOString().split("T")[0], // Today's date as default
    status: APPLICATION_STATUS.APPLIED,
    notes: "",
  });

  // If editing an existing application, populate the form
  useEffect(() => {
    if (application) {
      setFormData({
        companyName: application.companyName || "",
        jobRole: application.jobRole || "",
        dateApplied: application.dateApplied
          ? new Date(application.dateApplied).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: application.status || APPLICATION_STATUS.APPLIED,
        notes: application.notes || "",
      });
    }
  }, [application]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const statusOptions = Object.values(APPLICATION_STATUS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-card rounded-lg shadow-xl max-h-[90vh] overflow-auto animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {application ? "Edit Application" : "Add New Application"}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="input-primary"
              placeholder="Company name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Job Role
            </label>
            <input
              type="text"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
              className="input-primary"
              placeholder="Job title or role"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Date Applied
            </label>
            <input
              type="date"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleChange}
              className="input-primary"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-primary"
              required
              disabled={isLoading}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-primary min-h-[100px]"
              placeholder="Any additional notes or details about this application"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md hover:bg-foreground/5 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : application
                ? "Update Application"
                : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
