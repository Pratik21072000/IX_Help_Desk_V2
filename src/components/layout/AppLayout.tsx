import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { initializeSampleData } from "@/lib/tickets";

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Initialize sample data on first load
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-incub-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-white via-incub-blue-50/30 to-incub-blue-100/20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
