import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Navbar from '../components/layout/Navbar';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
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
      <div className="flex-1 flex items-center justify-center p-4 pt-16">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden md:flex flex-col space-y-6 p-8"
          >
            <h1 className="text-4xl font-bold tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-lg text-muted-foreground">
              Forgot your password? Don't worry, it happens to the best of us. 
              Enter your email address and we'll send you a secure link to reset your password.
            </p>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Secure Process</h3>
                <p className="text-sm text-muted-foreground">
                  We use a secure, time-limited link to help you reset your password safely
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you're having trouble resetting your password, please contact our support team
                </p>
              </div>
            </div>
          </motion.div>
          <ResetPasswordForm />
        </div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
