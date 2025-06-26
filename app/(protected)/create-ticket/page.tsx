"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, CheckCircle, AlertTriangle } from "lucide-react";
import {
  DEPARTMENT_STRUCTURE,
  type Department,
  type TicketPriority,
} from "@/lib/types";

const CreateTicketPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    if (user?.role !== "EMPLOYEE") {
      router.push("/dashboard");
    }
  }, [user, router]);

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

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          department: formData.department,
          priority: formData.priority,
          category: formData.category,
          subcategory: formData.subcategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

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
        router.push("/my-tickets");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments: Department[] = ["ADMIN", "FINANCE", "HR"];
  const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];

  if (submitSuccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-black mb-2">
                  Ticket Created Successfully!
                </h3>
                <p className="font-body text-incub-gray-600">
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
            <CardTitle className="font-heading">Ticket Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                        {dept === "HR"
                          ? "HR"
                          : dept.charAt(0).toUpperCase() +
                            dept.slice(1).toLowerCase()}
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
                          <AlertTriangle
                            className={`h-3 w-3 ${
                              priority === "HIGH"
                                ? "text-red-500"
                                : priority === "MEDIUM"
                                  ? "text-orange-500"
                                  : "text-green-500"
                            }`}
                          />
                          {priority.charAt(0).toUpperCase() +
                            priority.slice(1).toLowerCase()}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border border-blue-500"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Category Preview */}
        {formData.department && (
          <Card className="mt-6 border border-incub-blue-100 bg-incub-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading font-medium text-incub-blue-900">
                Available Categories for{" "}
                {formData.department.charAt(0).toUpperCase() +
                  formData.department.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCategories.map((category) => (
                  <div
                    key={category}
                    className="bg-white p-2 rounded border border-incub-blue-200"
                  >
                    <h4 className="font-heading font-medium text-sm text-black mb-1">
                      {category}
                    </h4>
                    <div className="text-xs font-body text-incub-gray-600">
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

export default CreateTicketPage;
