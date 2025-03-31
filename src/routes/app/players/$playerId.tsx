import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPlayerById, getTeamById } from '@/lib/actions'; // Adjust path if needed
import PlayerDetails from '@/components/players/playerDetails'; // Adjust path if needed
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
import { Loader2 } from 'lucide-react';


export const Route = createFileRoute('/app/players/$playerId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return {
      playerId: params.playerId,
    };
  },
});

function RouteComponent() {
  const { playerId } = Route.useLoaderData();

  const { data: player, isLoading, error } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const playerData = await getPlayerById(playerId);
      if (!playerData) {
        throw new Error("Player not found"); // Handle player not found
      }

      try {
        const team = playerData.teamId ? await getTeamById(playerData.teamId) : null;
        return {
          ...playerData,
          teamId: team ? team.name : playerData.teamId, // Use the team name if available, otherwise keep the original value
        };
      } catch (teamError) {
        console.error("Error fetching team:", teamError);
        // Optionally:  Display a message or set teamId to a default "Team not found"
        return {
          ...playerData,
          teamId: "Team Not Found", //Or maybe, keep the team ID as a fallback
        };
      }
    },
  });

  if (isLoading) {
    return <div className='flex items-center m-auto justify-content-center'> <Loader2 />&nbsp; Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!player) {
    return <div>Player not found</div>;  // Double check, in case useQuery doesn't throw
  }

  return (
    <div className='flex flex-col gap-4 w-full'>
      <SidebarInset className="w-full">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/app/players"><BreadcrumbLink>Players</BreadcrumbLink></Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Player Information</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Separator className="mb-4" />
        <PlayerDetails player={player} />
      </SidebarInset>
    </div>
  );
}