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
import { columns } from "@/components/players/columns"
import { type Player } from "@/schemas/players"
import { DataTable } from "@/components/players/data_table"
import { useQuery } from '@tanstack/react-query';
import { listPlayersAction, getTeamById } from "@/lib/actions"
import { LoaderCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/app/players/')({
  component: PlayerComponent,
})

async function PlayerComponent() {
  const navigate = useNavigate();

  const { data: updatedPlayers, isLoading, error } = useQuery<Player[]>({
    queryKey: ['players'],

    queryFn: async () => {
      const players = await listPlayersAction();

      if (!players) {
        return [];
      }

      const validTeamIds = players
        .map((player) => player.teamId)
        .filter(teamId => teamId !== null && teamId !== undefined) as string[];

      const uniqueTeamIds = [...new Set(validTeamIds)];

      const teamPromises = uniqueTeamIds.map((id) => getTeamById(id));
      const teams = await Promise.all(teamPromises);

      const teamMap = new Map(teams.map((team) => [team.id, team.name]));

      return players.map((player) => {
        const teamName = teamMap.get(player.teamId ?? '');
        return {
          ...player,
          teamId: teamName || player.teamId,
        };
      });

    },

  });

  if (isLoading) {
    return <div className='flex items-center m-auto'><LoaderCircle />&nbsp; Loading...</div>
  }

  if (error) {
    return <div>Error while fetching data: {error.message}</div>
  }

  return (
    <SidebarInset className="w-full lg:m-2 sm:m-6">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList className='tracking-wider'>
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
      <div className="container mx-auto py-2 px-2">
        {updatedPlayers && updatedPlayers.length > 0 ? (
          <DataTable columns={columns} data={updatedPlayers ?? []} />
        ) : (
          <div>
            No players found
          </div>
        )}
      </div>
    </SidebarInset>
  )
}