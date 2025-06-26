import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket, TicketStatus } from "@/types";
import { updateTicketStatus } from "@/lib/tickets";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  User,
  Calendar,
  Building,
  Edit,
} from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
  showActions?: boolean;
  showEdit?: boolean;
  onStatusUpdate?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  showActions = false,
  showEdit = false,
  onStatusUpdate,
  onEdit,
  onClick,
}) => {
  const handleStatusChange = (newStatus: TicketStatus) => {
    const success = updateTicketStatus(ticket.id, newStatus);
    if (success && onStatusUpdate) {
      onStatusUpdate();
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <Clock className="h-3 w-3" />;
      case "in-progress":
        return <AlertTriangle className="h-3 w-3" />;
      case "on-hold":
        return <Pause className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      case "closed":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "on-hold":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "closed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const availableStatuses: TicketStatus[] = [
    "open",
    "in-progress",
    "on-hold",
    "cancelled",
    "closed",
  ];

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 border-incub-gray-200 bg-white ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-black truncate">
              {ticket.subject}
            </h3>
            <p className="text-sm font-body text-incub-gray-600 mt-1 line-clamp-2">
              {ticket.description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${getStatusColor(ticket.status)} flex items-center gap-1`}
              >
                {getStatusIcon(ticket.status)}
                {ticket.status
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Badge>
              {showEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Badge
              variant="outline"
              className={getPriorityColor(ticket.priority)}
            >
              {ticket.priority.charAt(0).toUpperCase() +
                ticket.priority.slice(1)}{" "}
              Priority
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs font-body text-incub-gray-500 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {ticket.department.charAt(0).toUpperCase() +
                ticket.department.slice(1)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(ticket.createdAt)}
            </div>
          </div>
          <div className="text-incub-gray-400 font-heading font-medium">
            #{ticket.id.split("-").pop()}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-600 mr-2">Update Status:</span>
            <Select
              value={ticket.status}
              onValueChange={(value) =>
                handleStatusChange(value as TicketStatus)
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      {status
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;
