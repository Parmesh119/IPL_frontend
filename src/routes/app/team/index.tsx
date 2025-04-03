import { useState } from 'react'
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
import { Button } from "@/components/ui/button";
import { AddTeamDialog } from '@/components/teams/AddTeamDialog'

export const Route = createFileRoute('/app/team/')({
  component: TeamComponent,
})

async function TeamComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    <>
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
      <div className="container mx-auto py-2 px-2 flex items-center mb-auto">
        {teams && teams.length > 0 ? (
          <DataTable columns={columns} data={teams ?? []} />
        ) : (
          <div className='flex items-center m-auto gap-10 flex-col justify-between'>
            <div className='flex m-auto text-center'>No team found
              <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="border cursor-pointer bg-blue-500 hover:bg-white hover:text-black ml-4"
                  >
                      Add Team
                  </Button>
              </div>
              <AddTeamDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
          </div>
        )}
      </div>
    </SidebarInset>
    </>
  )
}
