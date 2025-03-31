import { useMemo } from "react";
import { APPLICATION_STATUS } from "../../services/firebase";

const ApplicationStats = ({ applications }) => {
  const statusCounts = useMemo(() => {
    const counts = {
      All: applications.length,
    };

    // Initialize counts for each status to 0
    Object.values(APPLICATION_STATUS).forEach((status) => {
      counts[status] = 0;
    });

    // Count applications by status
    applications.forEach((app) => {
      if (app.status && counts.hasOwnProperty(app.status)) {
        counts[app.status]++;
      }
    });

    return counts;
  }, [applications]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-3">
      {Object.entries(statusCounts).map(([status, count]) => (
        <div
          key={status}
          className="bg-card shadow-sm rounded-lg p-4 text-center border"
        >
          <p className="text-sm text-muted-foreground">{status}</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      ))}
    </div>
  );
};

export default ApplicationStats;
