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
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTheme } from '@/components/theme-provider';
import { useQuery } from '@tanstack/react-query';
import { getTeamById } from '@/lib/actions';
import { LoaderCircle } from 'lucide-react';

// const teamData = {
//     name: team.name,
//     amountSpent: 100,
//     totalPlayers: 19,
//     batsmenCount: 4,
//     bowlersCount: 10,
//     allRoundersCount: 5,
//     playersBought: [
//         { srNo: 1, player: "Riyan Parag", iplTeam: "RR", role: "Batsman", price: 9.5 },
//         { srNo: 2, player: "Player Two", iplTeam: "CSK", role: "Bowler", price: 8.0 },
//         { srNo: 3, player: "Player Three", iplTeam: "MI", role: "All Rounder", price: 11.2 },
//     ],
// };


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
    const { theme } = useTheme();

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

    const handleEditDetails = () => {
        alert(team?.bowlersCount)
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
                <main className="flex-grow overflow-y-auto overflow-x-hidden">
                    <div className="container mx-auto w-full px-4 py-6 md:px-6 space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Team : {teamData.name}
                            </h1>
                            <Button size="default" onClick={handleEditDetails} variant="outline" className={`cursor-pointer border ${theme === "dark" ? "border-white" : "border-black"}`}>Edit</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <Label htmlFor="teamName" className="text-sm font-medium text-muted-foreground">Name</Label>
                                <Input id="teamName" value={teamData.name} readOnly className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="amountSpent" className="text-sm font-medium text-muted-foreground">Amount Spent</Label>
                                <Input id="amountSpent" value={teamData.amountSpent} readOnly className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="totalPlayers" className="text-sm font-medium text-muted-foreground">Total Players</Label>
                                <Input id="totalPlayers" value={teamData.totalPlayers} readOnly className="mt-1" />
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold tracking-tight mb-4 text-foreground">
                            Players Bought
                        </h2>
                        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                            <Card className='w-full'>
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Batsmen</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4 px-4">
                                    <div className="text-2xl font-bold text-foreground">{teamData.batsmenCount}</div>
                                </CardContent>
                            </Card>
                            <Card className='w-full'>
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Bowlers</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4 px-4">
                                    <div className="text-2xl font-bold text-foreground">{teamData.bowlersCount}</div>
                                </CardContent>
                            </Card>
                            <Card className='w-full'>
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">All Rounders</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4 px-4">
                                    <div className="text-2xl font-bold text-foreground">{teamData.allRoundersCount}</div>
                                </CardContent>
                            </Card>
                        </div>
                        <hr />
                        <Card className='mt-10'>
                            <CardContent className="p-4">
                                <div className="overflow-x-auto relative">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b dark:border-neutral-800 hover:bg-transparent">
                                                <TableHead className="w-[80px] text-muted-foreground">Sr. No.</TableHead>
                                                <TableHead className="text-muted-foreground">Player</TableHead>
                                                <TableHead className="text-muted-foreground">IPL Team</TableHead>
                                                <TableHead className="text-muted-foreground">Role</TableHead>
                                                <TableHead className="text-right text-muted-foreground">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teamData.playersBought.length > 0 ? (
                                                (teamData.playersBought || []).map((player) => (
                                                    <TableRow key={player.srNo} className="border-b dark:border-neutral-800/50 hover:bg-muted/20">
                                                        <TableCell className="py-2 px-4 font-medium">{player.srNo}</TableCell>
                                                        <TableCell className="py-2 px-4">{player.player}</TableCell>
                                                        <TableCell className="py-2 px-4">{player.iplTeam}</TableCell>
                                                        <TableCell className="py-2 px-4">{player.role}</TableCell>
                                                        <TableCell className="py-2 px-4 text-right">{player.price}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                        No players bought yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
}