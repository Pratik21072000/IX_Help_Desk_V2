import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let whereClause: any = {};

    // Apply role-based filtering
    if (user.role === "EMPLOYEE") {
      whereClause.createdBy = user.id;
    } else if (isManager(user.role) && user.department) {
      whereClause.department = user.department;
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
    });

    const stats: DashboardStats = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      onHold: 0,
      cancelled: 0,
      closed: 0,
      byDepartment: { admin: 0, finance: 0, hr: 0 },
      byPriority: { low: 0, medium: 0, high: 0 },
    };

    tickets.forEach((ticket) => {
      // Status counts
      switch (ticket.status) {
        case "OPEN":
          stats.open++;
          break;
        case "IN_PROGRESS":
          stats.inProgress++;
          break;
        case "ON_HOLD":
          stats.onHold++;
          break;
        case "CANCELLED":
          stats.cancelled++;
          break;
        case "CLOSED":
          stats.closed++;
          break;
      }

      // Department counts
      switch (ticket.department) {
        case "ADMIN":
          stats.byDepartment.admin++;
          break;
        case "FINANCE":
          stats.byDepartment.finance++;
          break;
        case "HR":
          stats.byDepartment.hr++;
          break;
      }

      // Priority counts
      switch (ticket.priority) {
        case "LOW":
          stats.byPriority.low++;
          break;
        case "MEDIUM":
          stats.byPriority.medium++;
          break;
        case "HIGH":
          stats.byPriority.high++;
          break;
      }
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
