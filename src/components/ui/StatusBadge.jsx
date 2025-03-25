
import { cn } from '@/lib/utils';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Applied':
        return 'bg-[hsl(var(--status-applied))] text-white';
      case 'In Progress':
        return 'bg-[hsl(var(--status-in-progress))] text-black';
      case 'Waiting':
        return 'bg-[hsl(var(--status-waiting))] text-white';
      case 'Rejected':
        return 'bg-[hsl(var(--status-rejected))] text-white';
      case 'Approved':
        return 'bg-[hsl(var(--status-approved))] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusStyles()
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
