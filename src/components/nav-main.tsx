
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Bot, 
  Settings,
  LogIn,
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react"
import { useUser } from "@/firebase"
import { PlaceHolderImages } from "@/lib/placeholder-images"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Inventory", icon: Package, href: "/inventory" },
  { title: "Sales", icon: ShoppingCart, href: "/sales" },
  { title: "Customers", icon: Users, href: "/customers" },
  { title: "Master Ledger", icon: FileSpreadsheet, href: "/reports" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "AI Assistant", icon: Bot, href: "/ai-assistant" },
]

export function NavMain() {
  const pathname = usePathname()
  const { user } = useUser()
  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-20 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-sidebar-primary/10 p-1 rounded-lg overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <Bot className="w-8 h-8 text-sidebar-primary" />
            )}
          </div>
          <span className="font-headline font-bold text-xl group-data-[collapsible=icon]:hidden text-sidebar-foreground">SpecsBiz</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 group-data-[collapsible=icon]:hidden">Management</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  className="px-4 h-11"
                >
                  <Link href={item.href}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-body font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cloud Sync" className={`px-4 h-11 ${user ? 'text-green-500 font-bold' : 'text-orange-500 font-bold'}`}>
              <Link href="/auth">
                {user ? <ShieldCheck className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                <span className="font-body">{user ? 'Cloud Active' : 'Offline Mode'}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings" className="px-4 h-11">
              <Link href="/settings">
                <Settings className="w-5 h-5" />
                <span className="font-body">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
