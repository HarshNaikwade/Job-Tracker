import { Navigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
