// src/components/ProtectedRoute.tsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/pages/(auth)/context/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useContext(AuthContext);

  if (!auth || !auth.isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/auth" replace />;
  }

  // Logged in, show the page
  return children;
};

export default ProtectedRoute;