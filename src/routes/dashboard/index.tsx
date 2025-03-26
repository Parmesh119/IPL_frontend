import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export const Route = createFileRoute('/dashboard/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
      </SidebarProvider>
    </div>
  )
}
