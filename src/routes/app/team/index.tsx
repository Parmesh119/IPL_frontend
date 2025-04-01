import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/teams/data_table'
import { type Team } from '@/schemas/team'
import { columns } from '@/components/teams/columns'
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useQuery } from '@tanstack/react-query'
import { getAllTeams } from '@/lib/actions'
import { LoaderCircle } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const Route = createFileRoute('/app/team/')({
  component: TeamComponent,
})

async function TeamComponent() {

  const { data: teams, isLoading, error } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const teams = await getAllTeams();
      if (!teams) {
        return [];
      }
      return teams;
    },
  });

  if (isLoading) {
    return <div className='flex items-center m-auto'><LoaderCircle />&nbsp; Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <SidebarInset className="w-full">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className='tracking-wider'>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Teams</BreadcrumbLink>
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
        {teams && teams.length > 0 ? (
          <DataTable columns={columns} data={teams ?? []} />
        ) : (
          <div>No team found</div>
        )}
      </div>
    </SidebarInset>
  )
}
