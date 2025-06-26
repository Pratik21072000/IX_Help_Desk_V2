export interface User {
  id: string;
  username: string;
  role: UserRole;
  department?: Department;
  name: string;
}

export type UserRole = "employee" | "admin" | "finance" | "hr";

export type Department = "admin" | "finance" | "hr";

export type TicketStatus =
  | "open"
  | "in-progress"
  | "on-hold"
  | "cancelled"
  | "closed";

export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  department: Department;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface TicketFilters {
  department?: Department;
  priority?: TicketPriority;
  status?: TicketStatus;
  search?: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  onHold: number;
  cancelled: number;
  closed: number;
  byDepartment: {
    admin: number;
    finance: number;
    hr: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}
