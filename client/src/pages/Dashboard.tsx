// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type UserInfo = {
  name: string;
  email: string;
  role: string;
  department?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("securehub_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Top section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Welcome back{user ? `, ${user.name}` : ""}. Here is an overview of SecureHub.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/80 border-slate-700 text-slate-50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">128</div>
            <p className="text-xs text-slate-400 mt-2">
              Files stored securely across all departments.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700 text-slate-50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">12</div>
            <p className="text-xs text-slate-400 mt-2">
              Users with access to SecureHub today.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700 text-slate-50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Today&apos;s Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">37</div>
            <p className="text-xs text-slate-400 mt-2">
              Uploads, downloads & logins recorded.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (static for now) */}
      <Card className="bg-slate-900/80 border-slate-700 text-slate-50">
        <CardHeader>
          <CardTitle className="text-sm text-slate-200">
            Recent Activity (sample data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <p className="font-medium text-slate-100">
                  Payroll_Report_May.pdf downloaded
                </p>
                <p className="text-xs text-slate-400">
                  By: HR Manager • 10 minutes ago
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Download
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <p className="font-medium text-slate-100">
                  Monthly_Sales_Overview.xlsx uploaded
                </p>
                <p className="text-xs text-slate-400">
                  By: Sales Lead • 25 minutes ago
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Upload
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">
                  New device approved for admin
                </p>
                <p className="text-xs text-slate-400">
                  By: Super Admin • 1 hour ago
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Security
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

