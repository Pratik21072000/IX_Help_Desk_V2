import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { createTicket } from "@/lib/tickets";
import { Department, TicketPriority } from "@/types";
import { Plus, CheckCircle, AlertTriangle } from "lucide-react";

// Department structure mapping
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

const CreateTicket: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  // Update categories when department changes
  useEffect(() => {
    if (formData.department) {
      const categories = Object.keys(DEPARTMENT_STRUCTURE[formData.department]);
      setAvailableCategories(categories);
      setFormData((prev) => ({ ...prev, category: "", subcategory: "" }));
      setAvailableSubcategories([]);
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
      setFormData((prev) => ({ ...prev, subcategory: "" }));
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

      // Create comprehensive subject with category info - clean and sanitize
      const cleanSubject = formData.subject
        .trim()
        .replace(/[^\w\s\-.,!?()]/g, "");
      const fullSubject =
        formData.category && formData.subcategory
          ? `[${formData.category} - ${formData.subcategory}] ${cleanSubject}`
          : cleanSubject;

      // Create the ticket
      const ticket = createTicket(
        fullSubject,
        formData.description,
        formData.department,
        formData.priority,
        user?.id || "",
      );

      setSubmitSuccess(true);

      // Reset form after a short delay
      setTimeout(() => {
        setFormData({
          subject: "",
          description: "",
          department: "" as Department | "",
          category: "",
          subcategory: "",
          priority: "" as TicketPriority | "",
        });
        setSubmitSuccess(false);
        navigate("/my-tickets");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments: Department[] = ["admin", "hr", "finance"];
  const priorities: TicketPriority[] = ["low", "medium", "high"];

  if (submitSuccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ticket Created Successfully!
                </h3>
                <p className="text-gray-600">
                  Your ticket has been submitted and you'll be redirected to
                  view your tickets.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-black flex items-center gap-3 tracking-tight">
            <Plus className="h-7 w-7 text-incub-blue-600" />
            Create New Ticket
          </h1>
          <p className="text-incub-gray-600 font-body text-lg mt-3">
            Submit a new support request to the appropriate department
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection */}
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
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          {priority === "high" && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                          {priority === "medium" && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                          {priority === "low" && (
                            <AlertTriangle className="h-3 w-3 text-green-500" />
                          )}
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Category Preview */}
        {formData.department && (
          <Card className="mt-6 border border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">
                Available Categories for{" "}
                {formData.department.charAt(0).toUpperCase() +
                  formData.department.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCategories.map((category) => (
                  <div
                    key={category}
                    className="bg-white p-2 rounded border border-blue-200"
                  >
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {category}
                    </h4>
                    <div className="text-xs text-gray-600">
                      {DEPARTMENT_STRUCTURE[formData.department][category].join(
                        ", ",
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateTicket;
