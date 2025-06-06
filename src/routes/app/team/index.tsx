import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/teams/data_table'
import { type Team } from '@/schemas/team'
import { columns } from '@/components/teams/columns'
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

function TeamComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: teams, isLoading, error } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const teams = await getAllTeams();
      return teams || [];
    },
  });

  const handleTeamAdded = () => {
    // Invalidate the 'teams' query to refetch the updated list
    queryClient.invalidateQueries({ queryKey: ['teams'] });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <div className='flex items-center justify-center h-full'><LoaderCircle className="animate-spin mr-2" /> Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {(error as Error).message}</div>;
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
        <div className="container mx-auto py-2 px-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Teams</h2>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
            >
              Add Team
            </Button>
          </div>

          {teams && teams.length > 0 ? (
            <DataTable columns={columns} data={teams} />
          ) : (
            <div className='flex flex-col items-center justify-center p-10 text-center'>
              <p className="mb-4">No teams found</p>
            </div>
          )}
        </div>
      </SidebarInset>

      <AddTeamDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTeamAdded={handleTeamAdded}
      />
    </>
  )
}