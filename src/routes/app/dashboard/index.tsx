import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute('/app/dashboard/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full"> 
        <AppSidebar />
        
        <div className="flex-1">
          <SidebarInset className="flex flex-col h-full w-full"> 
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem > 
                      <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator  />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <Separator className="mb-4" />
            
            {/* Ensure content takes up remaining available space and doesn't overflow */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2">Total Players</h2>
                  <p className="text-3xl font-bold text-blue-600">254</p>
                </div>
                
                <div className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2">Active Teams</h2>
                  <p className="text-3xl font-bold text-green-600">12</p>
                </div>
                
                <div className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2">Upcoming Matches</h2>
                  <p className="text-3xl font-bold text-purple-600">5</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-medium">New player joined: John Doe</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-medium">Team Alpha won match against Team Beta</p>
                    <p className="text-sm text-gray-600">Yesterday</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-medium">Tournament registration opened</p>
                    <p className="text-sm text-gray-600">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}