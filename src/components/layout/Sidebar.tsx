import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isManager } from "@/lib/auth";
import {
  Ticket,
  BarChart3,
  Plus,
  FileText,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      show: true,
    },
    {
      name: "Create Ticket",
      href: "/create-ticket",
      icon: Plus,
      show: user?.role === "employee",
    },
    {
      name: "My Tickets",
      href: "/my-tickets",
      icon: FileText,
      show: user?.role === "employee",
    },
    {
      name: "Manage Tickets",
      href: "/manage-tickets",
      icon: Settings,
      show: user && isManager(user.role),
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-incub-blue-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-incub-blue-500 to-incub-blue-600 p-2 rounded-xl shadow-md">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-black tracking-tight">
              TicketFlow
            </h1>
            <p className="text-xs font-body text-incub-gray-500">
              Strategic Management
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-incub-blue-100 bg-incub-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-incub-blue-100 p-2 rounded-full">
            <User className="h-4 w-4 text-incub-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-medium text-black truncate">
              {user?.name}
            </p>
            <p className="text-xs font-body text-incub-gray-500 capitalize truncate">
              {user?.role === "employee"
                ? "Employee"
                : `${user?.department} Manager`}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-body font-medium transition-all duration-200",
                  isActive
                    ? "bg-incub-blue-100 text-incub-blue-700 shadow-sm"
                    : "text-incub-gray-600 hover:bg-incub-blue-50 hover:text-incub-blue-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-incub-blue-100">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 font-body text-incub-gray-600 hover:text-incub-blue-700 hover:bg-incub-blue-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
