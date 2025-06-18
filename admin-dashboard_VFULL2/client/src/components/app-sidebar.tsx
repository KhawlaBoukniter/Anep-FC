"use client"

import { Users, Briefcase, Building, BarChart3, BookOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "./ui/sidebar.tsx"

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const menuItems = [
    {
      title: "Employés",
      icon: Users,
      id: "employees",
    },
    {
      title: "Emplois",
      icon: Briefcase,
      id: "jobs",
    },
    {
      title: "Compétences requises",
      icon: BookOpen,
      id: "req-skills",
    },
    {
      title: "Analyse Compétences",
      icon: BarChart3,
      id: "skills-analysis",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold"><img src="logo1.png" className="w-24 h-12" alt="Description de l'image" /></span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem className="rounded-full shadow-lg py-2 px-4 border-l-4"  style={{ borderColor: '#06668C' }}    key={item.id}>
                  <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                    <item.icon   style={{ color: '#06668C' }} />
                    <span className="font-bold"  style={{ color: '#06668C' }} >{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
