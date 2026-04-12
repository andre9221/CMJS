import {
  Users, FileText, Search, Shield, UserCheck, Building, Scale, Gavel, BookOpen, Eye, Key, Home, Database
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  {
    label: "People",
    color: "text-rose-400",
    glow: "shadow-rose-500/20",
    items: [
      { title: "Victims", url: "/victims", icon: Users },
      { title: "Criminals", url: "/criminals", icon: Shield },
      { title: "Officers", url: "/officers", icon: UserCheck },
    ]
  },
  {
    label: "Cases",
    color: "text-indigo-400",
    glow: "shadow-indigo-500/20",
    items: [
      { title: "Crimes", url: "/crimes", icon: FileText },
      { title: "FIRs", url: "/firs", icon: BookOpen },
      { title: "Investigations", url: "/investigations", icon: Search },
      { title: "Officer Assignments", url: "/officer-assignments", icon: Key },
      { title: "Evidence", url: "/evidence", icon: Eye },
    ]
  },
  {
    label: "Judiciary",
    color: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    items: [
      { title: "Court Cases", url: "/court-cases", icon: Building },
      { title: "Hearings", url: "/hearings", icon: Gavel },
      { title: "Verdicts", url: "/verdicts", icon: Scale },
    ]
  },
  {
    label: "Corrections",
    color: "text-amber-400",
    glow: "shadow-amber-500/20",
    items: [
      { title: "Prison Records", url: "/prison-records", icon: Building },
      { title: "Parole", url: "/parole", icon: Key },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end activeClassName="bg-indigo-500/10 text-indigo-400 font-bold border-l-2 border-indigo-500">
                    <Home className="mr-3 h-5 w-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    {!collapsed && <span className="font-semibold text-lg tracking-wide">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sections.map((section) => (
          <SidebarGroup key={section.label} className="py-2">
            <SidebarGroupLabel className={`font-bold tracking-wider text-sm uppercase mb-3 ${section.color} border-b border-white/5 pb-1`}>
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-white/5 transition-all duration-200 group/item"
                        activeClassName="bg-white/5 text-white font-bold border-l-2 border-current shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      >
                        <item.icon className={`mr-3 h-5 w-5 transition-transform duration-300 group-hover/item:scale-110 ${section.color} filter drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]`} />
                        {!collapsed && <span className="font-medium text-base tracking-wide text-zinc-300 group-hover/item:text-white">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
