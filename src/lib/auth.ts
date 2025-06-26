import { User, UserRole, Department } from "@/types";

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    username: "john.employee",
    role: "employee",
    name: "John Employee",
  },
  {
    id: "2",
    username: "admin.manager",
    role: "admin",
    department: "admin",
    name: "Admin Manager",
  },
  {
    id: "3",
    username: "finance.manager",
    role: "finance",
    department: "finance",
    name: "Finance Manager",
  },
  {
    id: "4",
    username: "hr.manager",
    role: "hr",
    department: "hr",
    name: "HR Manager",
  },
  {
    id: "5",
    username: "jane.employee",
    role: "employee",
    name: "Jane Employee",
  },
];

export const authenticateUser = (
  username: string,
  password: string,
): User | null => {
  // In a real app, this would validate against a backend
  const user = mockUsers.find((u) => u.username === username);

  // For demo purposes, accept any password for existing users
  if (user && password.length > 0) {
    return user;
  }

  return null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem("currentUser");
};

export const isManager = (role: UserRole): boolean => {
  return ["admin", "finance", "hr"].includes(role);
};

export const canManageDepartment = (
  userRole: UserRole,
  userDepartment: Department | undefined,
  ticketDepartment: Department,
): boolean => {
  if (userRole === "employee") return false;
  return userDepartment === ticketDepartment;
};
