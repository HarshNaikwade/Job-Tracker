import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  onAuthChange,
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  loginWithGoogle,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
} from "../services/firebase";

interface AuthContextType {
  currentUser: any;
  isAuthenticated: boolean;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      const { user } = await registerUser(email, password);
      navigate("/dashboard");
      toast.success("Account created successfully!");
      return user;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(getReadableErrorMessage(error));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user } = await loginUser(email, password);
      navigate("/dashboard");
      toast.success("Logged in successfully!");
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(getReadableErrorMessage(error));
      throw error;
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const { user } = await loginWithGoogle();
      navigate("/dashboard");
      toast.success("Logged in with Google successfully!");
      return user;
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(getReadableErrorMessage(error));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(getReadableErrorMessage(error));
      throw error;
    }
  };

  const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
    try {
      await firebaseConfirmPasswordReset(oobCode, newPassword);
      toast.success("Password has been reset successfully!");
    } catch (error: any) {
      console.error("Confirm password reset error:", error);
      toast.error(getReadableErrorMessage(error));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(getReadableErrorMessage(error));
      throw error;
    }
  };

  const getReadableErrorMessage = (error: any) => {
    if (error.code === "auth/invalid-credential") {
      return "Invalid email or password. Please try again.";
    } else if (error.code === "auth/user-disabled") {
      return "Your account has been disabled. Please contact support.";
    } else if (error.code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    } else if (error.code === "auth/email-already-in-use") {
      return "This email is already registered. Please use a different email or try logging in.";
    } else if (error.code === "auth/weak-password") {
      return "Password is too weak. Please use a stronger password.";
    } else if (error.code === "auth/popup-closed-by-user") {
      return "Login cancelled. Please try again.";
    } else if (error.code === "auth/popup-blocked") {
      return "Login popup was blocked. Please allow popups for this site.";
    } else if (error.code === "auth/api-key-not-valid") {
      return "Authentication service unavailable. Please try again later.";
    } else if (error.code === "auth/user-not-found") {
      return "No account found with this email address.";
    } else if (error.code?.includes("auth/network-request-failed")) {
      return "Network error. Please check your connection and try again.";
    } else if (error.code === "auth/too-many-requests") {
      return "Too many failed login attempts. Please try again later.";
    } else if (error.code === "auth/invalid-action-code") {
      return "This password reset link has expired or already been used. Please request a new one.";
    }
    return "An error occurred. Please try again later.";
  };

  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    loginWithGoogle: handleLoginWithGoogle,
    resetPassword,
    confirmPasswordReset,
    logout,
    isAuthenticated: !!currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
