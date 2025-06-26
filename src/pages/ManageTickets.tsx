import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Construction } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ManageTickets: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-6 w-6" />
          Manage Tickets
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and update tickets for the{" "}
          {user?.department?.toUpperCase() || "your"} department
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-blue-600" />
            Department Management Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <Settings className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {user?.department?.toUpperCase() || "Department"} Ticket
                Management
              </h3>
              <p className="text-gray-600 text-sm">
                This page will provide comprehensive ticket management tools for
                department managers:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Management Tools
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bulk status updates</li>
                  <li>• Ticket assignment</li>
                  <li>• Priority management</li>
                  <li>• Response templates</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Analytics & Reports
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Department performance</li>
                  <li>• Response time metrics</li>
                  <li>• Workload distribution</li>
                  <li>• Trend analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageTickets;
