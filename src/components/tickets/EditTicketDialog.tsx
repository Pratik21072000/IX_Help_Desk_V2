import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ticket, Department, TicketPriority } from "@/types";
import { getTickets, saveTickets } from "@/lib/tickets";
import { AlertTriangle, Save, X } from "lucide-react";

// Department structure mapping (same as CreateTicket)
const DEPARTMENT_STRUCTURE = {
  admin: {
    "Office Facility": [
      "AC/Lighting Issues",
      "Desk Setup",
      "Cleanliness",
      "Power Outage",
      "Pest Control",
    ],
    "IT Assets": [
      "Laptop/Desktop Request",
      "Accessory Request",
      "Disposal Request",
    ],
    "ID Card & Access": [
      "ID Card Issue/Loss",
      "Door Access Request",
      "Visitor Pass",
      "Biometric Issue",
    ],
    "Travel & Transport": [
      "Cab Booking",
      "Travel Reimbursement",
      "Itinerary Change",
    ],
    "Stationery & Supplies": [
      "New Request",
      "Refill Request",
      "Printer Ink Request",
    ],
    Housekeeping: [
      "Cleaning Request",
      "Pantry Supplies",
      "Water Dispenser Issues",
    ],
    Maintenance: ["Furniture Repair", "Electrical Issue", "Plumbing"],
  },
  hr: {
    "Leave & Attendance": [
      "Leave Balance Query",
      "Attendance Correction",
      "Comp Off Request",
    ],
    "Employee Records": ["Document Request", "Name/Address Update"],
    Onboarding: ["Laptop Allocation", "Document Submission"],
    "Exit Process": ["Clearance", "Final Settlement"],
    "Policy & Compliance": ["Leave Policy", "Code of Conduct"],
    "Employee Benefits": ["Insurance", "Wellness Program"],
  },
  finance: {
    Reimbursements: ["Travel", "Food", "WFH Setup"],
    "Payroll & Salary": [
      "Salary Discrepancy",
      "Payslip Request",
      "Tax Declaration Help",
      "PF Issues",
    ],
    "Vendor Payments": ["Invoice Submission", "PO Status"],
    Taxation: ["Form 16", "Investment Proof", "TDS Query"],
    "Accounts Payable": ["Payment Follow-up", "Bank Details Update"],
    "Accounts Receivable": ["Invoice Follow-up", "Receipt Confirmation"],
    "Procurement Support": ["PO Creation", "Software Request"],
  },
};

interface EditTicketDialogProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
}

const EditTicketDialog: React.FC<EditTicketDialogProps> = ({
  ticket,
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    department: "" as Department | "",
    category: "",
    subcategory: "",
    priority: "" as TicketPriority | "",
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when ticket changes
  useEffect(() => {
    if (ticket) {
      // Parse the subject to extract category and subcategory if present
      const subjectMatch = ticket.subject.match(/^\[(.+?) - (.+?)\] (.+)$/);
      let parsedSubject = ticket.subject;
      let parsedCategory = "";
      let parsedSubcategory = "";

      if (subjectMatch) {
        parsedCategory = subjectMatch[1];
        parsedSubcategory = subjectMatch[2];
        parsedSubject = subjectMatch[3];
      }

      setFormData({
        subject: parsedSubject,
        description: ticket.description,
        department: ticket.department,
        category: parsedCategory,
        subcategory: parsedSubcategory,
        priority: ticket.priority,
      });
    }
  }, [ticket]);

  // Update categories when department changes
  useEffect(() => {
    if (formData.department) {
      const categories = Object.keys(DEPARTMENT_STRUCTURE[formData.department]);
      setAvailableCategories(categories);
      if (!categories.includes(formData.category)) {
        setFormData((prev) => ({ ...prev, category: "", subcategory: "" }));
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableCategories([]);
      setAvailableSubcategories([]);
    }
  }, [formData.department]);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.department && formData.category) {
      const subcategories =
        DEPARTMENT_STRUCTURE[formData.department][formData.category] || [];
      setAvailableSubcategories(subcategories);
      if (!subcategories.includes(formData.subcategory)) {
        setFormData((prev) => ({ ...prev, subcategory: "" }));
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.department, formData.category]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.department) {
        throw new Error("Department is required");
      }
      if (!formData.priority) {
        throw new Error("Priority is required");
      }

      // Create comprehensive subject with category info
      const fullSubject =
        formData.category && formData.subcategory
          ? `[${formData.category} - ${formData.subcategory}] ${formData.subject}`
          : formData.subject;

      // Update the ticket
      const tickets = getTickets();
      const ticketIndex = tickets.findIndex((t) => t.id === ticket.id);

      if (ticketIndex === -1) {
        throw new Error("Ticket not found");
      }

      // Check if ticket is still editable (only open tickets can be edited)
      if (tickets[ticketIndex].status !== "open") {
        throw new Error("Only open tickets can be edited");
      }

      tickets[ticketIndex] = {
        ...tickets[ticketIndex],
        subject: fullSubject,
        description: formData.description,
        department: formData.department,
        priority: formData.priority,
        updatedAt: new Date().toISOString(),
      };

      saveTickets(tickets);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments: Department[] = ["admin", "hr", "finance"];
  const priorities: TicketPriority[] = ["low", "medium", "high"];

  // Check if ticket can be edited (only open tickets)
  const canEdit = ticket?.status === "open";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Ticket
          </DialogTitle>
        </DialogHeader>

        {!canEdit ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This ticket cannot be edited because it's no longer in "Open"
              status. Only open tickets can be modified.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Department Selection */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            {availableCategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subcategory Selection */}
            {availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Sub-category</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) =>
                    handleInputChange("subcategory", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-3 w-3 ${
                            priority === "high"
                              ? "text-red-500"
                              : priority === "medium"
                                ? "text-orange-500"
                                : "text-green-500"
                          }`}
                        />
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Enter a brief summary of your request"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your request..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                required
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Updating Ticket..." : "Update Ticket"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketDialog;
