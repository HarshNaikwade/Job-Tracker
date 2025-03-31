import Navbar from "../components/layout/Navbar";
import ConfirmResetPassword from "../components/auth/ConfirmResetPassword";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const ConfirmPasswordReset = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Extract oobCode from the URL (Firebase password reset links)
  const searchParams = new URLSearchParams(location.search);
  const oobCode = searchParams.get("oobCode");
  const email = searchParams.get("email") || "";
  const mode = searchParams.get("mode");

  // Check if this is a Firebase password reset action
  const isFirebaseReset = mode === "resetPassword" && !!oobCode;

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
              Set Your New Password
            </h1>
            <p className="text-lg text-muted-foreground">
              Create a strong, unique password to secure your account. Make sure
              to use a combination of letters, numbers, and special characters.
            </p>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Secure Password Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Use a mix of characters, avoid common words, and make it at
                  least 8 characters long
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Account Security</h3>
                <p className="text-sm text-muted-foreground">
                  After resetting your password, review your account details to
                  ensure everything is up to date
                </p>
              </div>
            </div>
          </motion.div>
          <ConfirmResetPassword
            oobCode={oobCode}
            email={email}
            isFirebaseReset={isFirebaseReset}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmPasswordReset;
