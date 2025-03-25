import { useState, useEffect, useRef } from "react";
import { Edit, Trash2, MoreHorizontal, Clock } from "lucide-react";
import { motion } from "framer-motion";

import StatusBadge from "../ui/StatusBadge";

const ApplicationCard = ({ application, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onEdit(application);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onDelete(application.id);
  };

  useEffect(() => {
    if (!showActions) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    const timer = setTimeout(() => {
      setShowActions(false);
    }, 10000);

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timer);
    };
  }, [showActions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-300 card-hover"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">
            {application.companyName}
          </h3>
          <p className="text-foreground/70 font-medium mt-1">
            {application.jobRole}
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-foreground/70" />
          </button>

          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-1 w-36 bg-card rounded-md shadow-lg border z-10 overflow-hidden"
            >
              <button
                onClick={handleEdit}
                className="w-full flex items-center px-3 py-2 text-sm hover:bg-foreground/5 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={application.status} />
        <span className="text-xs text-foreground/60">
          Applied: {formatDate(application.dateApplied)}
        </span>
      </div>

      {application.notes && (
        <div className="mt-3 border-t pt-3">
          <p className="text-sm text-foreground/70 line-clamp-2">
            {application.notes}
          </p>
        </div>
      )}

      <div className="mt-3 pt-2 border-t flex items-center justify-center text-xs text-foreground/50">
        <Clock className="w-3 h-3 mr-1" />
        <span>Last Updated: {formatDate(application.updatedAt)}</span>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
