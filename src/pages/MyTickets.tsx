import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTicketsForUser,
  getDashboardStats,
  filterTickets,
} from "@/lib/tickets";
import { Ticket, TicketFilters } from "@/types";
import TicketFiltersComponent from "@/components/tickets/TicketFilters";
import TicketCard from "@/components/tickets/TicketCard";
import EditTicketDialog from "@/components/tickets/EditTicketDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    loadTickets();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchQuery]);

  const loadTickets = () => {
    if (!user) return;
    const userTickets = getTicketsForUser(user.id);
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

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
  };

  const handleEditClose = () => {
    setEditingTicket(null);
    loadTickets();
  };

  const stats = getDashboardStats(tickets);

  const statsCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: FileText,
      color: "blue" as const,
    },
    {
      title: "Open",
      value: stats.open,
      icon: Clock,
      color: "yellow" as const,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: AlertTriangle,
      color: "blue" as const,
    },
    {
      title: "On Hold",
      value: stats.onHold,
      icon: Pause,
      color: "purple" as const,
    },
    {
      title: "Closed",
      value: stats.closed,
      icon: CheckCircle,
      color: "green" as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-black flex items-center gap-3 tracking-tight">
            <FileText className="h-7 w-7 text-incub-blue-600" />
            My Tickets
          </h1>
          <p className="text-incub-gray-600 font-body text-lg mt-3">
            View and track all your submitted tickets
          </p>
        </div>
        <Button
          onClick={() => navigate("/create-ticket")}
          className="gap-2 bg-incub-blue-500 hover:bg-incub-blue-600 font-body font-medium px-6 py-2.5 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Create New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg border ${
                  card.color === "blue"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : card.color === "yellow"
                      ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                      : card.color === "purple"
                        ? "bg-purple-50 text-purple-600 border-purple-200"
                        : card.color === "green"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your tickets by subject or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <TicketFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          userRole="employee"
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Tickets</h2>
          <span className="text-sm text-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tickets.length === 0
                ? "No tickets created yet"
                : "No tickets found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {tickets.length === 0
                ? "Create your first support ticket to get started."
                : "Try adjusting your search or filter criteria."}
            </p>
            {tickets.length === 0 && (
              <Button
                onClick={() => navigate("/create-ticket")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showActions={false}
                showEdit={true}
                onEdit={() => handleEditTicket(ticket)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingTicket && (
        <EditTicketDialog
          ticket={editingTicket}
          open={!!editingTicket}
          onClose={handleEditClose}
        />
      )}
    </div>
  );
};

export default MyTickets;
