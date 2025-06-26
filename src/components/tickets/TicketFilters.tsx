import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TicketFilters,
  UserRole,
  Department,
  TicketPriority,
  TicketStatus,
} from "@/types";
import { X } from "lucide-react";

interface TicketFiltersProps {
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  userRole: UserRole;
}

const TicketFiltersComponent: React.FC<TicketFiltersProps> = ({
  filters,
  onFiltersChange,
  userRole,
}) => {
  const updateFilter = (
    key: keyof TicketFilters,
    value: string | undefined,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );

  const departments: Department[] = ["admin", "finance", "hr"];
  const priorities: TicketPriority[] = ["low", "medium", "high"];
  const statuses: TicketStatus[] = [
    "open",
    "in-progress",
    "on-hold",
    "cancelled",
    "closed",
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Department Filter - Only show for managers or admin */}
      {(userRole === "admin" ||
        userRole === "finance" ||
        userRole === "hr") && (
        <Select
          value={filters.department || "all"}
          onValueChange={(value) => updateFilter("department", value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept.charAt(0).toUpperCase() + dept.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Priority Filter */}
      <Select
        value={filters.priority || "all"}
        onValueChange={(value) => updateFilter("priority", value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {priorities.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          <X className="h-3 w-3 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default TicketFiltersComponent;
