import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  KeyRound,
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      console.error("Reset password error:", error);

      // Show detailed error message
      if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (error.code?.includes("auth/network-request-failed")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          "Failed to send password reset email. Please try again later."
        );
      }

      toast.error("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto p-8 bg-card shadow-lg rounded-xl mt-20"
    >
      <Button
        variant="outline"
        size="sm"
        style={{ position: "absolute" }}
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div className="flex justify-center mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Reset Your Password
      </h2>

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
            <p className="font-medium">Password reset email sent!</p>
            <p className="mt-1">
              Please check your inbox and follow the instructions to reset your
              password.
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the email address associated with your account, and we'll send
            you a link to reset your password.
          </p>
        </div>

        <Button type="submit" className="w-full py-2.5" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </motion.div>
  );
};

export default ResetPasswordForm;
