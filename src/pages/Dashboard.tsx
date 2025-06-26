import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isManager } from "@/lib/auth";
import {
  getTickets,
  getTicketsForUser,
  getTicketsForDepartment,
  getDashboardStats,
  filterTickets,
} from "@/lib/tickets";
import { Ticket, TicketFilters } from "@/types";
import StatsCard from "@/components/dashboard/StatsCard";
import TicketFiltersComponent from "@/components/tickets/TicketFilters";
import TicketCard from "@/components/tickets/TicketCard";
import { Input } from "@/components/ui/input";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  FileText,
  Search,
  Building,
  Users,
  TrendingUp,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTickets();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchQuery]);

  const loadTickets = () => {
    if (!user) return;

    let userTickets: Ticket[];
    if (user.role === "employee") {
      userTickets = getTicketsForUser(user.id);
    } else if (isManager(user.role) && user.department) {
      userTickets = getTicketsForDepartment(user.department);
    } else {
      userTickets = getTickets();
    }

    // Sort by latest first (newest tickets on top)
    const sortedTickets = userTickets.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setTickets(sortedTickets);
  };

  const applyFilters = () => {
    const searchFilters = { ...filters, search: searchQuery };
    const filtered = filterTickets(tickets, searchFilters);
    setFilteredTickets(filtered);
  };

  const stats = getDashboardStats(tickets);

  const getWelcomeMessage = () => {
    if (!user) return "Welcome";
    if (user.role === "employee") {
      return `Welcome back, ${user.name}`;
    }
    return `${user.department?.toUpperCase()} Department Overview`;
  };

  const handleStatsCardClick = (status?: string) => {
    if (status && status !== "total") {
      setFilters({ status: status as any });
    } else {
      setFilters({});
    }
  };

  const handleNavigateToTickets = () => {
    if (user?.role === "employee") {
      navigate("/my-tickets");
    } else {
      navigate("/manage-tickets");
    }
  };

  const getStatsCards = () => {
    const cards = [
      {
        title: "Total Tickets",
        value: stats.total,
        icon: FileText,
        color: "blue" as const,
        onClick: () => handleStatsCardClick("total"),
      },
      {
        title: "Open",
        value: stats.open,
        icon: Clock,
        color: "yellow" as const,
        onClick: () => handleStatsCardClick("open"),
      },
      {
        title: "In Progress",
        value: stats.inProgress,
        icon: TrendingUp,
        color: "blue" as const,
        onClick: () => handleStatsCardClick("in-progress"),
      },
      {
        title: "On Hold",
        value: stats.onHold,
        icon: Pause,
        color: "purple" as const,
        onClick: () => handleStatsCardClick("on-hold"),
      },
      {
        title: "Cancelled",
        value: stats.cancelled,
        icon: XCircle,
        color: "red" as const,
        onClick: () => handleStatsCardClick("cancelled"),
      },
      {
        title: "Closed",
        value: stats.closed,
        icon: CheckCircle,
        color: "green" as const,
        onClick: () => handleStatsCardClick("closed"),
      },
    ];

    // For managers, add department-specific stats
    if (isManager(user?.role || "employee")) {
      return cards;
    }

    // For employees, show simplified stats
    return cards.slice(0, 4);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-heading font-bold text-black tracking-tight">
          {getWelcomeMessage()}
        </h1>
        <p className="text-incub-gray-600 font-body text-lg">
          {user?.role === "employee"
            ? "Manage your tickets and track their progress"
            : "Monitor and manage department tickets"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {getStatsCards().map((card) => (
          <div
            key={card.title}
            className="transform transition-transform hover:scale-105"
          >
            <StatsCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              onClick={card.onClick}
            />
          </div>
        ))}
      </div>

      {/* Department Stats for Managers */}
      {isManager(user?.role || "employee") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="transform transition-transform hover:scale-105">
            <StatsCard
              title="Admin Tickets"
              value={stats.byDepartment.admin}
              icon={Building}
              color="blue"
            />
          </div>
          <div className="transform transition-transform hover:scale-105">
            <StatsCard
              title="Finance Tickets"
              value={stats.byDepartment.finance}
              icon={Building}
              color="green"
            />
          </div>
          <div className="transform transition-transform hover:scale-105">
            <StatsCard
              title="HR Tickets"
              value={stats.byDepartment.hr}
              icon={Users}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by subject or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <TicketFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          userRole={user?.role || "employee"}
        />
      </div>

      {/* Recent Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-black">
            {user?.role === "employee" ? "Your Tickets" : "Recent Tickets"}
          </h2>
          <span className="text-sm font-body text-incub-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-incub-gray-200 shadow-sm">
            <FileText className="h-12 w-12 text-incub-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium text-black mb-2">
              No tickets found
            </h3>
            <p className="font-body text-incub-gray-500">
              {tickets.length === 0
                ? user?.role === "employee"
                  ? "You haven't created any tickets yet."
                  : "No tickets in your department yet."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.slice(0, 10).map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showActions={isManager(user?.role || "employee")}
                onStatusUpdate={loadTickets}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
