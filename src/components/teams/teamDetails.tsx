import { useState } from "react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useQuery } from '@tanstack/react-query';
import { getTeamById } from '@/lib/actions';
import { LoaderCircle } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { EditTeamDialog } from './EditTeamDialog';
import { ChevronDownIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { deleteTeamAction } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export default function TeamDetails({ teamId }: { teamId: string }) {

    const router = useRouter();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { theme } = useTheme();
    const { data: team, isLoading, error } = useQuery({
        queryKey: ['teamDetails', teamId],
        queryFn: () => getTeamById(teamId),
        enabled: !!teamId,
    });

    const handleMakeCaptain = () => {
        alert("Make Captain: Functionality not yet implemented.");
    };

    const handleMakeViceCaptain = () => {
        alert("Make Vice-Captain: Functionality not yet implemented.");
    };

    const handleAddPlayer = () => {
        alert("Add Player: Functionality not yet implemented.");
    };

    const handleRemovePlayer = () => {
        alert("Remove Player: Functionality not yet implemented.");
    };


    const { mutate: deleteTeam } = useMutation({
        mutationFn: () => deleteTeamAction(teamId),
        onSuccess: () => {
            toast.success("Team deleted successfully");
            router.navigate({ to: "/app/team" });
        },
        onError: (error) => {
            alert(error.message)
            toast.error("Error while deleting team!!");
        },
    });

    if (!teamId) {
        return (
            <div className="flex items-center justify-center h-full w-full p-4 text-muted-foreground">
                Please select a team to view details.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full p-4">
                <LoaderCircle className="animate-spin mr-2 h-5 w-5" />
                <span>Loading Team Details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full p-4 text-red-500">
                Error loading team details: {error.message}
            </div>
        );
    }

    if (!team) {
        return (
            <div className="flex items-center justify-center h-full w-full p-4 text-muted-foreground">
                Team not found or could not be loaded.
            </div>
        );
    }

    const teamData = {
        name: team?.name ?? 'Unnamed Team',
        owner: team?.owner ?? 'Unknown Owner',
        captain: team?.captain ?? 'Unknown Captain',
        amountSpent: team?.spent ?? 0,
        totalPlayers: team?.players ?? 0,
        batsmenCount: team?.batsmenCount ?? 0,
        bowlersCount: team?.bowlersCount ?? 0,
        allRoundersCount: team?.allRoundersCount ?? 0,
        playersBought: team?.playersBought?.map((player, index) => ({
            srNo: index + 1,
            player: player.player ?? 'Unknown Player',
            iplTeam: player.iplTeam ?? '-',
            role: player.role ?? 'Unknown',
            price: player.price ?? 0,
        })) || [],
    };


    return (
        <>
            <main className="flex-grow overflow-y-auto overflow-x-hidden">
                <div className="container mx-auto w-full px-2 py-4 sm:px-4 md:px-6 lg:py-6 space-y-4 sm:space-y-6">
                    <div className="flex flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground break-words">
                            Team: {teamData.name}
                        </h1>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`cursor-pointer border sm:self-auto ${theme === "dark" ? "border-white/50" : "border-black/50"} hover:bg-muted`}
                                >
                                    Actions
                                    <ChevronDownIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="cursor-pointer mt-2">
                                <DropdownMenuLabel className="hover:bg-gray-600 hover:rounded-sm" onClick={() => setIsDialogOpen(true)}>Update Team</DropdownMenuLabel>
                                <EditTeamDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} team={team} />
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleMakeCaptain} className="cursor-pointer">
                                    Make Captain
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleMakeViceCaptain} className="cursor-pointer">
                                    Make Vice-Captain
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleAddPlayer} className="cursor-pointer">
                                    Add Player
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleRemovePlayer} className="cursor-pointer">
                                    Remove Player
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/50"
                                    onClick={() => setIsAlertOpen(true)} // Open alert manually
                                >
                                    Delete Team
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Move AlertDialog outside to prevent closing issue */}
                        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                            <AlertDialogContent className="sm:max-w-[700px] tracking-wider border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete entire team details from the database.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="cursor-pointer" onClick={() => deleteTeam()}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div>
                            <Label htmlFor="owner" className="text-sm font-medium text-muted-foreground">Owner</Label>
                            <Input id="owner" disabled value={teamData.owner || "No Captain Assigned"} readOnly className="mt-1 font-bold tracking-wider" />
                        </div>
                        <div>
                            <Label htmlFor="amountSpent" className="text-sm font-medium text-muted-foreground">Amount Spent</Label>
                            <Input disabled id="amountSpent" type="number" value={teamData.amountSpent} readOnly className="mt-1 font-bold" />
                        </div>
                        <div>
                            <Label htmlFor="totalPlayers" className="text-sm font-medium text-muted-foreground">Total Players</Label>
                            <Input disabled id="totalPlayers" type="number" value={teamData.totalPlayers} readOnly className="mt-1 font-bold" />
                        </div>
                    </div>

                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-3 sm:mb-4 text-foreground">
                        Player Counts
                    </h2>
                    <div className="text-md grid w-full grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10 text-center">
                        <Card className="w-full">
                            <CardHeader className="pb-2 pt-3 px-3 sm:pt-4 sm:px-4">
                                <CardTitle className=" font-medium text-muted-foreground text-sm sm:text-base">Total Batsmen</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3 px-3 sm:pb-4 sm:px-4">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">{teamData.batsmenCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="w-full">
                            <CardHeader className="pb-2 pt-3 px-3 sm:pt-4 sm:px-4">
                                <CardTitle className="font-medium text-muted-foreground text-sm sm:text-base">Total Bowlers</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3 px-3 sm:pb-4 sm:px-4">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">{teamData.bowlersCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="w-full">
                            <CardHeader className="pb-2 pt-3 px-3 sm:pt-4 sm:px-4">
                                <CardTitle className="font-medium text-muted-foreground text-sm sm:text-base">Total All-Rounders</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3 px-3 sm:pb-4 sm:px-4">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">{teamData.allRoundersCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-3 sm:mb-4 text-foreground">
                        Players Bought
                    </h2>
                    <Card className="mt-0 sm:mt-0 w-full px-0 lg:px-10">
                        <CardContent className="sm:p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b dark:border-neutral-800 hover:bg-transparent">
                                            <TableHead className="w-[300px] md:w-[150px] px-2 sm:px-4 text-muted-foreground text-xs sm:text-sm">Sr.</TableHead>
                                            <TableHead className="px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm">Player</TableHead>
                                            <TableHead className="px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm">IPL Team</TableHead>
                                            <TableHead className="px-2 sm:px-2 text-muted-foreground text-xs sm:text-sm">Role</TableHead>
                                            <TableHead className="text-right px-2 sm:px-4 text-muted-foreground text-xs sm:text-sm">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamData.playersBought.length > 0 ? (
                                            teamData.playersBought.map((player) => (
                                                <TableRow key={player.srNo} className="border-b dark:border-neutral-800/50 hover:bg-muted/20">
                                                    <TableCell className="py-2 px-2 sm:py-2 sm:px-4 font-medium text-xs sm:text-sm">{player.srNo}</TableCell>
                                                    <TableCell className="py-1 px-1 sm:py-2 sm:px-2 text-xs sm:text-sm">{player.player}</TableCell>
                                                    <TableCell className="py-1 px-1 sm:py-2 sm:px-2 text-xs sm:text-sm">{player.iplTeam}</TableCell>
                                                    <TableCell className="py-1 px-2 sm:py-2 sm:px-2 text-xs sm:text-sm">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-medium tracking-wider ${player.role === "Batsman" ? (theme === "dark" ? "bg-blue-900/70 text-blue-100" : "bg-blue-100 text-blue-800") :
                                                            player.role === "Bowler" ? (theme === "dark" ? "bg-green-900/70 text-green-100" : "bg-green-100 text-green-800") :
                                                                player.role === "All-rounder" ? (theme === "dark" ? "bg-purple-900/70 text-purple-100" : "bg-purple-100 text-purple-800") :
                                                                    (theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800")
                                                            }`}>
                                                            {player.role}
                                                        </span>
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