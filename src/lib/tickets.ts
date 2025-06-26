import {
  Ticket,
  TicketFilters,
  DashboardStats,
  Department,
  TicketPriority,
  TicketStatus,
} from "@/types";

const STORAGE_KEY = "tickets";

export const getTickets = (): Ticket[] => {
  const ticketsStr = localStorage.getItem(STORAGE_KEY);
  return ticketsStr ? JSON.parse(ticketsStr) : [];
};

export const saveTickets = (tickets: Ticket[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

export const createTicket = (
  subject: string,
  description: string,
  department: Department,
  priority: TicketPriority,
  createdBy: string,
): Ticket => {
  const tickets = getTickets();
  const newTicket: Ticket = {
    id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    subject,
    description,
    department,
    priority,
    status: "open",
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tickets.push(newTicket);
  saveTickets(tickets);
  return newTicket;
};

export const updateTicketStatus = (
  ticketId: string,
  status: TicketStatus,
): boolean => {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);

  if (ticketIndex === -1) return false;

  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveTickets(tickets);
  return true;
};

export const getTicketsForUser = (userId: string): Ticket[] => {
  const tickets = getTickets();
  return tickets.filter((ticket) => ticket.createdBy === userId);
};

export const getTicketsForDepartment = (department: Department): Ticket[] => {
  const tickets = getTickets();
  return tickets.filter((ticket) => ticket.department === department);
};

export const filterTickets = (
  tickets: Ticket[],
  filters: TicketFilters,
): Ticket[] => {
  return tickets.filter((ticket) => {
    if (filters.department && ticket.department !== filters.department)
      return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const subjectMatch = ticket.subject.toLowerCase().includes(searchLower);
      const descriptionMatch = ticket.description
        .toLowerCase()
        .includes(searchLower);
      if (!subjectMatch && !descriptionMatch) return false;
    }
    return true;
  });
};

export const getDashboardStats = (tickets?: Ticket[]): DashboardStats => {
  const allTickets = tickets || getTickets();

  const stats: DashboardStats = {
    total: allTickets.length,
    open: 0,
    inProgress: 0,
    onHold: 0,
    cancelled: 0,
    closed: 0,
    byDepartment: { admin: 0, finance: 0, hr: 0 },
    byPriority: { low: 0, medium: 0, high: 0 },
  };

  allTickets.forEach((ticket) => {
    // Status counts
    switch (ticket.status) {
      case "open":
        stats.open++;
        break;
      case "in-progress":
        stats.inProgress++;
        break;
      case "on-hold":
        stats.onHold++;
        break;
      case "cancelled":
        stats.cancelled++;
        break;
      case "closed":
        stats.closed++;
        break;
    }

    // Department counts
    stats.byDepartment[ticket.department]++;

    // Priority counts
    stats.byPriority[ticket.priority]++;
  });

  return stats;
};

// Initialize with some sample tickets for demonstration
export const initializeSampleData = (): void => {
  const existingTickets = getTickets();
  if (existingTickets.length === 0) {
    const sampleTickets: Ticket[] = [
      {
        id: "sample-1",
        subject: "IT Equipment Request",
        description: "Need a new laptop for development work",
        department: "admin",
        priority: "high",
        status: "open",
        createdBy: "1",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sample-2",
        subject: "Expense Reimbursement",
        description: "Request reimbursement for client dinner",
        department: "finance",
        priority: "medium",
        status: "in-progress",
        createdBy: "1",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sample-3",
        subject: "Leave Request",
        description: "Requesting 5 days vacation leave",
        department: "hr",
        priority: "low",
        status: "closed",
        createdBy: "5",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    saveTickets(sampleTickets);
  }
};
