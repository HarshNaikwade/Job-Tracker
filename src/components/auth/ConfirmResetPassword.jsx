import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ConfirmResetPassword = ({
  oobCode: propOobCode,
  email: propEmail,
  isFirebaseReset,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oobCode, setOobCode] = useState(propOobCode || "");
  const [email, setEmail] = useState(propEmail || "");
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract parameters if not provided as props
    if (!propOobCode) {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("oobCode");
      const emailParam = searchParams.get("email") || "";

      if (code) {
        setOobCode(code);
        setEmail(emailParam);
      } else {
        setError("Invalid password reset link. Please request a new one.");
      }
    }
  }, [location, propOobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!password) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(oobCode, password);
      setSuccess(true);
      toast.success("Password has been reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Confirm password reset error:", error);

      // Show detailed error message
      if (error.code === "auth/invalid-action-code") {
        setError(
          "This password reset link has expired or already been used. Please request a new one."
        );
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Failed to reset password. Please try again.");
      }

      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-0 pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
          {email && (
            <p className="text-sm text-muted-foreground">
              For <span className="font-medium">{email}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-start gap-2 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 p-4 rounded-md mb-6 flex items-start gap-2 text-sm"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Password changed successfully!</p>
                <p className="mt-1">
                  You will be redirected to the login page shortly.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Enter new password"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Confirm new password"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5"
              disabled={loading || success || !oobCode}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-6">
          <Link to="/login" className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ConfirmResetPassword;
