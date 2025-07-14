"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, NavLink } from "react-router-dom";
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
import { Button } from "../components/ui/button.tsx";
import { User } from "lucide-react";


export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(
    location.state?.activeSection || "employees"
  );

  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);

  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);


  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employees/verify-session`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          const text = await response.text();
          console.log("Verify session response:", response.status, text);
          if (response.ok) {
            const data = JSON.parse(text);
            setUser({ id: data.id, email: data.email, role: data.role });
          } else {
            console.log("Session verification failed, status:", response.status);
            if (response.status === 401) {
              localStorage.removeItem("token");
              setUser(null);
              navigate("/");
            }
          }
        } catch (error) {
          console.error("Error verifying session:", error);
          localStorage.removeItem("token");
          setUser(null);
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSwitchToProfile = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    } else {
      console.log("User not authenticated or ID missing");
    }
  };

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
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-6 bg-gradient-to-r from-[#15669d] to-[#94b3ca] shadow-lg border-gray-700">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-300 transform hover:scale-110">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">Admin Dashboard</h1>
            </div>
          </div>
          {user?.role === "admin" && (
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#15669d] text-white font-semibold rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <User />
              <span>Profile</span>
            </Link>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {renderContent()}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
