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
import { type Payment, columns } from "@/components/players_data_table/columns"
import { DataTable } from "@/components/players_data_table/data_table"
import { authService } from "@/lib/auth"
import { redirect } from "@tanstack/react-router"
import { toast } from "sonner"
// import { useQuery } from '@tanstack/react-query';
// import {listPlayersAction} from "@/lib/actions"

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

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      srNo: 1,
      name: "Player 1",
      country: "Country A",
      age: 25,
      role: "Batsman",
      battingStyle: "Right-handed",
      bowlingStyle: "Right-arm medium",
      team: "Team A",
      basePrice: "1 Cr",
      sellPrice: "1.5 Cr",
      status: "Sold",
    },
    {
      srNo: 2,
      name: "Player 2",
      country: "Country B",
      age: 30,
      role: "Bowler",
      battingStyle: "Left-handed",
      bowlingStyle: "Left-arm fast",
      team: "Team B",
      basePrice: "2 Cr",
      sellPrice: null,
      status: "Unsold",
    },
    {
      srNo: 3,
      name: "Player 3",
      country: "Country C",
      age: 28,
      role: "All-rounder",
      battingStyle: "Right-handed",
      bowlingStyle: "Right-arm off-spin",
      team: "Team C",
      basePrice: "1.5 Cr",
      sellPrice: null,
      status: "Pending",
    },
  ]
}


async function RouteComponent() {
  const data = await getData()

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
        <DataTable columns={columns} data={data} />
      </div>
    </SidebarInset>
  )
}