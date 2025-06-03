"use client";

import { useState } from "react";
import { SidebarProvider } from "../components/ui/sidebar.tsx";
import { AppSidebar } from "../components/app-sidebar.tsx";
import { SidebarInset, SidebarTrigger } from "../components/ui/sidebar.tsx";
import { EmployeesList } from "../components/employees-list.tsx";
import { JobsList } from "../components/jobs-list.tsx";
import { SkillsAnalysis } from "../components/skills-analysis.tsx";
import { Toaster } from "../components/ui/toaster.tsx";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("employees");

  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        return <EmployeesList />;
      case "jobs":
        return <JobsList />;
      case "skills-analysis":
        return <SkillsAnalysis />;
      default:
        return <EmployeesList />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-indigo-50">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-indigo-700">Dashboard Admin</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {renderContent()}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
