"use client";

import { useEffect, useRef, useState } from "react";
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
import { User } from "lucide-react";
import { RegistrationsValidation } from "../components/registrations-validation.tsx";


export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(
    location.state?.activeSection || "employees"
  );

  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);


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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    const handleSwitchToProfile = () => {
      if (user?.id) {
        navigate(`/profile/${user.id}`);
        setIsMobileMenuOpen(false);
      }
    };
  }

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
        return <ModulesList />
      case "cycles-programs":
        return <CycleProgramList />
      case "registrations-validation":
        return <RegistrationsValidation />;
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

          <div className="flex items-center relative">
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleUserMenu}
                className="text-[#dce8ed] font-medium px-4 py-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v1h12v-1c0-3.31-2.69-6-6-6z" />
                </svg>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-lg py-2 z-50">

                  <Link
                    to={`/profile/${user?.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-[#06668C] hover:bg-gray-100 w-full text-left"
                  >
                    <User className="" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-[#06668C] hover:bg-gray-100 w-full text-left"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </div>

              )}
            </div>

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
