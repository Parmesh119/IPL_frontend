import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <div className="flex-grow">
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>App</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <Separator className="mb-4" />
            <Outlet />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}