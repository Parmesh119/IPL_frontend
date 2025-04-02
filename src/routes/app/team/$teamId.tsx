import { createFileRoute, Link } from '@tanstack/react-router';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useQuery } from '@tanstack/react-query';
import { getTeamById } from '@/lib/actions';
import { LoaderCircle } from 'lucide-react';
import TeamDetails  from "@/components/teams/teamDetails";

export const Route = createFileRoute('/app/team/$teamId')({
    component: RouteComponent,
    loader: async ({ params }) => {
        console.log("Loading data for team:", params.teamId);
        return {
            teamId: params.teamId
        };
    },
});

function RouteComponent() {
    let { teamId } = Route.useLoaderData();

    const { data: team, isLoading, error } = useQuery({
        queryKey: ['teamDetails'],
        queryFn: () => getTeamById(teamId),
    });

    if (isLoading) {
        return <div><LoaderCircle />&nbsp; Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const teamData = {
        name: team?.name,
        amountSpent: team?.spent,
        totalPlayers: team?.players,
        batsmenCount: team?.batsmenCount,
        bowlersCount: team?.bowlersCount,
        allRoundersCount: team?.allRoundersCount,
        playersBought: team?.playersBought?.map((player, index) => ({
            srNo: index + 1,
            player: player.player,
            iplTeam: player.iplTeam,
            role: player.role,
            price: player.price,
        })) || [],
    };

    return (
        <div className='flex flex-col w-full h-full overflow-hidden tracking-wider'>
            <SidebarInset className="w-full">
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList className='tracking-wider'>
                                <BreadcrumbItem>
                                    <Link to="/app/team"><BreadcrumbLink>Teams</BreadcrumbLink></Link>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Team Information: {teamData.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <Separator className="mb-4" />
                <TeamDetails teamId={teamId} />
            </SidebarInset>
        </div>
    );
}