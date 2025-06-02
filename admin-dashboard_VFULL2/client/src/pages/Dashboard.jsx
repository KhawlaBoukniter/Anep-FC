"use client"

import { useState } from "react"
import { SidebarProvider } from "../components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "../components/ui/sidebar"
import { EmployeesList } from "../components/employees-list"
import { JobsList } from "../components/jobs-list"
import { SkillsAnalysis } from "../components/skills-analysis"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("employees")

  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        return <EmployeesList />
      case "jobs":
        return <JobsList />
      case "skills-analysis":
        return <SkillsAnalysis />
      default:
        return <EmployeesList />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard Admin</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}