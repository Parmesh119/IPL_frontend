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
import { useQuery } from '@tanstack/react-query';
import { getTeamById } from '@/lib/actions';
import { LoaderCircle } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Badge } from "../ui/badge";

export default function TeamDetails({ teamId }: { teamId: string }) {

    const { theme } = useTheme();
    const { data: team, isLoading, error } = useQuery({
        queryKey: ['teamDetails'],
        queryFn: () => getTeamById(teamId),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full p-4">
                <LoaderCircle className="animate-spin mr-2" /><span>Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full p-4 text-red-500">
                Error: {error.message}
            </div>
        );
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

    const handleEditDetails = () => {
        alert(team?.bowlersCount)
    }

    return (
        <>
            <main className="flex-grow overflow-y-auto overflow-x-hidden">
                <div className="container mx-auto w-full px-2 py-4 sm:px-4 md:px-6 lg:py-6 space-y-4 sm:space-y-6">
                    <div className="flex flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                            Team: {teamData.name}
                        </h1>
                        <Button
                            size="sm"
                            onClick={handleEditDetails}
                            variant="outline"
                            className={`cursor-pointer border sm:self-auto ${theme === "dark" ? "border-white" : "border-black"}`}
                        >
                            Edit
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
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

                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-3 sm:mb-4 text-foreground">
                        Players Bought
                    </h2>
                    <div className="text-md grid w-full grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10 text-center">
                        <Card className="w-full ">
                            <CardHeader className="pb-2 pt-3 px-3 sm:pt-4 sm:px-4">
                                <CardTitle className=" font-medium text-muted-foreground">Batsmen</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3 px-3 sm:pb-4 sm:px-4">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">{teamData.batsmenCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="w-full">
                            <CardHeader className="pb-2 pt-3 px-3 sm:pt-4 sm:px-4">
                                <CardTitle className="font-medium text-muted-foreground">Bowlers</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3 px-3 sm:pb-4 sm:px-4">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">{teamData.bowlersCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="w-full">
                            <CardHeader className="pb-2 pt-3 px-3 sm:pt-4 sm:px-4">
                                <CardTitle className="font-medium text-muted-foreground">All Rounders</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3 px-3 sm:pb-4 sm:px-4">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">{teamData.allRoundersCount}</div>
                            </CardContent>
                        </Card>
                    </div>
                    <hr className="opacity-30" />
                    <Card className="mt-6 sm:mt-10 w-full">
                        <CardContent className="p-2 sm:p-4">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b dark:border-neutral-800 hover:bg-transparent">
                                            <TableHead className="w-80 text-muted-foreground text-xs sm:text-sm">Sr. No.</TableHead>
                                            <TableHead className="text-muted-foreground text-xs sm:text-sm">Player</TableHead>
                                            <TableHead className="text-muted-foreground text-xs sm:text-sm">IPL Team</TableHead>
                                            <TableHead className="text-muted-foreground text-xs sm:text-sm">Role</TableHead>
                                            <TableHead className="text-right text-muted-foreground text-xs sm:text-sm">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamData.playersBought.length > 0 ? (
                                            (teamData.playersBought || []).map((player) => (
                                                <TableRow key={player.srNo} className="border-b dark:border-neutral-800/50 hover:bg-muted/20">
                                                    <TableCell className="py-1 px-2 sm:py-2 sm:px-4 font-medium text-xs sm:text-sm">{player.srNo}</TableCell>
                                                    <TableCell className="py-1 px-1 sm:py-2 sm:px-2 text-xs sm:text-sm">{player.player}</TableCell>
                                                    <TableCell className="py-1 px-1 sm:py-2 sm:px-2 text-xs sm:text-sm">{player.iplTeam}</TableCell>
                                                    <TableCell className="py-1 px-2 sm:py-2 sm:px-2 text-xs sm:text-sm">
                                                        {player.role === "Batsman" && (
                                                            <span className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium tracking-widest ${theme === "dark" ? "bg-blue-900/70 text-blue-100" : "bg-blue-100 text-blue-800"
                                                                }`}>
                                                                {player.role}
                                                            </span>
                                                        )}
                                                        {player.role === "Bowler" && (
                                                            <span className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium tracking-widest ${theme === "dark" ? "bg-green-900/70 text-green-100" : "bg-green-100 text-green-800"
                                                                }`}>
                                                                {player.role}
                                                            </span>
                                                        )}
                                                        {player.role === "All-rounder" && (
                                                            <span className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium tracking-widest ${theme === "dark" ? "bg-purple-900/70 text-purple-100" : "bg-purple-100 text-purple-800"
                                                                }`}>
                                                                {player.role}
                                                            </span>
                                                        )}
                                                        {!player.role && (
                                                            <span className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium tracking-wider ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800"
                                                                }`}>
                                                                Unknown
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 sm:py-2 sm:px-4 text-right text-xs sm:text-sm">{player.price}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-16 sm:h-24 text-muted-foreground">
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
        </>
    )
}