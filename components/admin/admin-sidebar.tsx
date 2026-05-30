'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Brain, LayoutDashboard, Users, CalendarCheck, Calendar, Clock, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

const navItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Deportistas', href: '/admin/dashboard/deportistas', icon: Users },
  { title: 'Solicitudes', href: '/admin/dashboard/solicitudes', icon: CalendarCheck },
  { title: 'Calendario', href: '/admin/dashboard/calendario', icon: Calendar },
  { title: 'Horarios', href: '/admin/dashboard/horarios', icon: Clock },
]

interface AdminSidebarProps {
  user: {
    name: string
    email: string
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-2 py-4">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">PsicoDeporte</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="p-4 space-y-3">
          <div className="text-sm">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
