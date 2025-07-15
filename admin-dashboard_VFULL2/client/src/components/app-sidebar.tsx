"use client"

import { Users, Briefcase, Building, BarChart3, BookOpen, BookMarked, ListOrdered, ListIcon, ChevronUp, BadgeCheck, ClipboardCheck } from "lucide-react"
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
import { useState } from "react"

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const [recOpen, setRecOpen] = useState(true)
  const [formationOpen, setFormationOpen] = useState(true)
  
  const menuItems = [
    {
      title: "Employés",
      icon: Users,
      id: "employees",
      group: "rec",
    },
    {
      title: "Emplois",
      icon: Briefcase,
      id: "jobs",
      group: "rec",
    },
    {
      title: "Compétences requises",
      icon: BookOpen,
      id: "req-skills",
      group: "rec",
    },
    {
      title: "Analyse Compétences",
      icon: BarChart3,
      id: "skills-analysis",
      group: "rec",
    },
    {
      title: "Modules",
      icon: BookMarked,
      id: "modules",
      group: "formation",
    },
    {
      title: "Cycles - Programmes",
      icon: ListIcon,
      id: "cycles-programs",
      group: "formation",
    },
    {
      title: "Validation des Inscriptions",
      icon: ClipboardCheck,
      id: "registrations-validation",
      group: "formation",
    },
  ]

  return (
    <>
      <style>{`
        @-webkit-keyframes aitf {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animated-text-fill {
          background: url(https://i.pinimg.com/736x/36/38/ec/3638ecac127d1087a01e28a15166692e.jpg) repeat-y;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-animation: aitf 80s linear infinite;
          -webkit-transform: translate3d(0,0,0);
          -webkit-backface-visibility: hidden;
        }
      `}</style>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold"><img src="logo1.png" className="w-24 h-12" alt="Description de l'image" /></span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setRecOpen(!recOpen)}>
              <span className="font-extrabold text-[1rem] uppercase font-[Oswald,sans-serif] text-shadow-[0_0_80px_rgba(255,255,255,0.5)] animated-text-fill py-2">Gestion Rec</span>
              <ChevronUp className={`h-5 w-5 text-[#06668C] transition-transform ${recOpen ? "rotate-180" : "rotate-90"}`} />
            </SidebarGroupLabel>
            <SidebarGroupContent className={`${recOpen ? "block" : "hidden"} mb-2`}>
              <SidebarMenu>
                {menuItems
                  .filter((item) => item.group === "rec")
                  .map((item) => (
                    <SidebarMenuItem className="rounded-full shadow-lg py-2 px-4 border-l-4" style={{ borderColor: '#06668C' }} key={item.id}>
                      <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                        <item.icon style={{ color: '#06668C' }} />
                        <span className="font-bold" style={{ color: '#06668C' }}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setFormationOpen(!formationOpen)}>
              <span className="font-extrabold text-[1rem] uppercase font-[Oswald,sans-serif] text-shadow-[0_0_80px_rgba(255,255,255,0.5)] animated-text-fill py-2">Gestion Formation</span>
              <ChevronUp className={`h-5 w-5 text-[#06668C] transition-transform ${formationOpen ? "rotate-180" : "rotate-90"}`} />
            </SidebarGroupLabel>
            <SidebarGroupContent className={`${formationOpen ? "block" : "hidden"}`}>
              <SidebarMenu>
                {menuItems
                  .filter((item) => item.group === "formation")
                  .map((item) => (
                    <SidebarMenuItem className="rounded-full shadow-lg py-2 px-4 border-l-4" style={{ borderColor: '#06668C' }} key={item.id}>
                      <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                        <item.icon style={{ color: '#06668C' }} />
                        <span className="font-bold" style={{ color: '#06668C' }}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  )
}
