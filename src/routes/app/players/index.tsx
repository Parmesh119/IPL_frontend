import { createFileRoute } from '@tanstack/react-router'
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
import { type Payment, columns } from "@/components/players/columns"
import { DataTable } from "@/components/players/data_table"
import { authService } from "@/lib/auth"
import { redirect } from "@tanstack/react-router"
import { toast } from "sonner"
import { useQuery } from '@tanstack/react-query';
import {listPlayersAction} from "@/lib/actions"

export const Route = createFileRoute('/app/players/')({
  component: RouteComponent,
  loader: async () => {
    const isLoggedIn = await authService.isLoggedIn()
    if (isLoggedIn) {
      return redirect({ to: '/auth/login' })
    }
  },
  pendingComponent: () => {
    return toast.loading('Loading...')
  },
  errorComponent: () => {
    return toast.error('Failed to load data. Please try again.')
  }
})


async function RouteComponent() {

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["players"],
    queryFn: listPlayersAction,
  });
  
  if (isLoading) {
    toast.loading("Loading players...");
  }
  
  if (isError) {
    toast.error("Failed to load players.");
    console.error("Error fetching players:", error);
  }

  return (
    <SidebarInset className="w-full">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Players</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator className="mb-4" />
      <div className="container mx-auto py-2">
        <DataTable columns={columns} data={data ?? []} />
      </div>
    </SidebarInset>
  )
}