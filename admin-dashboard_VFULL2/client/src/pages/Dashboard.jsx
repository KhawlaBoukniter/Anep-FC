"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "../components/ui/sidebar.tsx";
import { AppSidebar } from "../components/app-sidebar.tsx";
import { SidebarInset, SidebarTrigger } from "../components/ui/sidebar.tsx";
import { EmployeesList } from "../components/employees-list.tsx";
import { JobsList } from "../components/jobs-list.tsx";
import { SkillsAnalysis } from "../components/skills-analysis.tsx";
import { Toaster } from "../components/ui/toaster.tsx";
import { ReqSkillsManagement } from "../components/reqSkillsManagement.tsx";
import { ModulesList } from "../components/modules-list.tsx"
import { CycleProgramList } from "../components/CycleProgramList.tsx";

export default function AdminDashboard() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(
    location.state?.activeSection || "employees"
  );

  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        return <EmployeesList />;
      case "jobs":
        return <JobsList />;
      case "req-skills":
        return <ReqSkillsManagement />;
      case "skills-analysis":
        return <SkillsAnalysis />;
      case "modules":
        return <ModulesList/>
      case "cycles-programs":
        return <CycleProgramList/>
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
