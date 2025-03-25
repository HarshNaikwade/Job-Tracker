import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  onAuthChange,
  loginUser,
  registerUser,
  logoutUser,
} from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up function
  const signup = async (email, password) => {
    try {
      const { user } = await registerUser(email, password);
      navigate("/dashboard");
      toast.success("Account created successfully!");
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const { user } = await loginUser(email, password);
      navigate("/dashboard");
      toast.success("Logged in successfully!");
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
