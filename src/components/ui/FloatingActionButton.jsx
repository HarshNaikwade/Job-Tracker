
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingActionButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-20 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transform transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Add new application"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
};

export default FloatingActionButton;
