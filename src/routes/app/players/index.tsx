import React, { useState, useMemo } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Plus } from 'lucide-react';
import { useDebounce } from "@uidotdev/usehooks";
import { toast } from "sonner";

// Shadcn UI Components
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Custom Components & Actions
import AddPlayerDialog from '@/components/players/AddPlayerDialog';
import { type Player, PlayerSchema, type ListUserRequest } from "@/schemas/players";
import {
    listPlayersAction, // ** Action now returns Promise<Player[]> **
    getTeamById,
    addPlayerAction,
    getAllTeams,
} from "@/lib/actions";

import { useTheme } from '@/components/theme-provider';

// Define the Route
export const Route = createFileRoute('/app/players/')({
    component: PlayerComponent,
});

// --- Constants ---
const DEFAULT_PAGE_SIZE = 10;
const ROLES = ["Batsman", "Bowler", "Wicketkeeper", "All-rounder"];
const STATUSES = ["Pending", "Sold", "Unsold", "Current_Bid"];
const BATTING_STYLES = ["Right-handed", "Left-handed"];
const BOWLING_STYLES = ["Fast", "Spin", "Medium"];
const IPL_TEAMS = [
    "Chennai Super Kings",
    "Mumbai Indians",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Rajasthan Royals",
    "Delhi Capitals",
    "Sunrisers Hyderabad",
    "Punjab Kings",
    "Lucknow Super Giants",
    "Gujarat Titans"
  ];

// Default empty array for players
const defaultPlayersData: Player[] = [];

// --- The React Component ---
function PlayerComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectIPLTeam, setSelectIPLTeam] = useState<string[]>([]);
    const [selectTeam, setSelectTeam] = useState<string[]>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>({
        name: "", country: "", age: undefined, role: "", battingStyle: "",
        bowlingStyle: "", teamId: "", basePrice: "", sellPrice: null,
        iplTeam: "", status: "Pending",
    });

    const debouncedSearch = useDebounce(searchTerm, 300);

    // --- Data Fetching: Teams ---
    const { data: teamsData, isLoading: isLoadingTeams, error: errorTeams } = useQuery({
        queryKey: ["teams"],
        queryFn: getAllTeams,
        staleTime: 5 * 60 * 1000,
    });
    const safeTeams = useMemo(() => Array.isArray(teamsData) ? teamsData : [], [teamsData]);

    if (errorTeams) {
        return (<div className='p-4 m-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md'> Error loading essential team data: {errorTeams.message}. Cannot manage players effectively. Please try reloading. </div>);
    }

    // --- Data Fetching: Players (Workaround for missing totalCount) ---
    const {
        data: fetchedPlayersList = defaultPlayersData, // Expect Player[] directly, provide default
        isLoading: isLoadingPlayers,
        error: errorPlayers,
        isFetching,
        // isPlaceholderData is less relevant here as we don't know the total pages
    } = useQuery<Player[], Error>({ // Expect Player[] directly
        queryKey: [
            'playersList',
            pagination.pageIndex,
            pagination.pageSize, // Still use pageSize in key for consistency
            debouncedSearch,
            selectedRoles,
            selectedStatuses,
            selectIPLTeam,
            selectTeam,
        ],
        queryFn: async (): Promise<Player[]> => { // Return Promise<Player[]>
            const fetchSize = pagination.pageSize;

            const filters: ListUserRequest = {
                page: pagination.pageIndex + 1,
                size: fetchSize, // Fetch N+1
                search: debouncedSearch || null,
                roles: selectedRoles.length > 0 ? selectedRoles : null,
                status: selectedStatuses.length > 0 ? selectedStatuses : null,
                iplTeam: selectIPLTeam.length > 0 ? selectIPLTeam : null,
                team: selectTeam.length > 0 ? teamsData?.map(team => team.id).filter((id): id is string => id !== undefined && selectTeam.includes(id)) : null,
            };

            try {
                const players = await listPlayersAction(filters);
                
                if (!Array.isArray(players)) {
                    toast.error("Received invalid data structure from server.");
                    return defaultPlayersData; // Return empty array
                }

                if (players.length === 0) {
                    return [];
                }

                // --- Map Team Names ---
                const validTeamIds = players.map(p => p.teamId).filter(id => !!id) as string[];
                const uniqueTeamIds = [...new Set(validTeamIds)];
                let teamMap = new Map<string, string>();
                if (uniqueTeamIds.length > 0) {
                    const teamPromises = uniqueTeamIds.map(id => getTeamById(id).catch(() => null));
                    const teamsResults = await Promise.all(teamPromises);
                    const validTeams = teamsResults.filter(t => t !== null) as { id: string; name: string }[];
                    teamMap = new Map(validTeams.map(t => [t.id, t.name]));
                }
                const mappedPlayers = players.map((player: Player) => {
                    const teamName = player.teamId ? teamMap.get(player.teamId) : undefined;
                    return {
                        ...player,
                        teamId: teamName || (player.teamId ? `ID: ${player.teamId}` : '-'),
                    };
                });
                // --- End Map Team Names ---

                // *** Return the potentially larger list (N+1 items) ***
                return mappedPlayers;

            } catch (err: any) {
                throw new Error(err.message || "Failed to fetch players");
            }
        },
        // Keep placeholderData to show old data while refetching
        placeholderData: (previousData) => previousData,
        staleTime: 30 * 1000,
        enabled: !isLoadingTeams,
    });

    // --- Logic for Workaround Pagination ---
    // Check if there are more items than the page size (indicates a next page)
    const hasNextPage = useMemo(() => fetchedPlayersList.length >= pagination.pageSize, [fetchedPlayersList, pagination.pageSize]);
    // Data to actually display (only up to pageSize items)
    const playersData = useMemo(() => fetchedPlayersList.slice(0, pagination.pageSize), [fetchedPlayersList, pagination.pageSize]);
    // We don't know the real total count or page count anymore
    // const totalPlayerCount = ???;
    // const pageCount = ???;

    // --- Add Player Mutation (No changes needed here) ---
    const { mutate: addPlayer, isPending: isAddingPlayer } = useMutation<Player, Error, Player>({
        mutationFn: addPlayerAction,
        onSuccess: (data) => { toast.success(`Player "${data.name}" added successfully`); queryClient.invalidateQueries({ queryKey: ['playersList'] }); setOpenAddDialog(false); handleCancelAdd(); },
        onError: (error) => { toast.error(`Error adding player: ${error.message || "An unknown error occurred"}`); },
    });

    // --- Add Player Dialog Handlers (No changes needed here) ---
    const handleAddPlayerSubmit = () => { /* ... validation logic ... */
        const selectedTeam = safeTeams.find((team) => team.name === newPlayer.teamId);
        const playerToValidate = { /* ... prepare data ... */
            ...newPlayer, teamId: selectedTeam?.id,
            age: newPlayer.age === undefined ? undefined : Number(newPlayer.age),
            sellPrice: newPlayer.sellPrice === "" || newPlayer.sellPrice === null || newPlayer.sellPrice === undefined ? null : String(newPlayer.sellPrice),
            basePrice: String(newPlayer.basePrice), iplTeam: String(newPlayer.iplTeam), battingStyle: String(newPlayer.battingStyle), role: String(newPlayer.role), country: String(newPlayer.country), status: newPlayer.status ?? "Pending", bowlingStyle: newPlayer.bowlingStyle ? String(newPlayer.bowlingStyle) : undefined,
        };
        const validationResult = PlayerSchema.safeParse(playerToValidate);
        if (!validationResult.success) { /* ... handle errors ... */
            const errorMessages = validationResult.error.errors.map((err) => `${err.path.join('.') || 'field'}: ${err.message}`).join("\n"); toast.error(`Validation failed:\n${errorMessages}`); return;
        }
        if ((validationResult.data.role === "Bowler" || validationResult.data.role === "All-rounder") && !validationResult.data.bowlingStyle) { toast.error("Bowling style is required for Bowlers and All-rounders."); return; }
        if (validationResult.data.role !== "Bowler" && validationResult.data.role !== "All-rounder" && validationResult.data.bowlingStyle) { validationResult.data.bowlingStyle = undefined; }
        addPlayer(validationResult.data as Player);
    };
    const handleCancelAdd = () => { /* ... reset form ... */
        setOpenAddDialog(false); setNewPlayer({ name: "", country: "", age: undefined, role: "", battingStyle: "", bowlingStyle: "", teamId: "", basePrice: "", sellPrice: null, iplTeam: "", status: "Pending", });
    };

    // --- Filter Toggle Handlers (No changes needed) ---
    const toggleRole = (role: string) => { /* ... update state and reset pageIndex ... */
        setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]); setPagination(p => ({ ...p, pageIndex: 0 }));
    };
    const toggleStatus = (status: string) => { /* ... update state and reset pageIndex ... */
        setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]); setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    const toggleiplTeam = (iplTeam: string) => {
        setSelectIPLTeam(prev => prev.includes(iplTeam) ? prev.filter(t => t !== iplTeam) : [...prev, iplTeam]); setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    const toggleTeam = (teamId: string) => {
        setSelectTeam(prev => prev.includes(teamId) ? prev.filter(t => t !== teamId) : [...prev, teamId]); setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    // --- Row Click Handler (No changes needed) ---
    const handleRowClick = (playerId: string | undefined) => { /* ... navigate ... */
        if (playerId) { navigate({ to: '/app/players/$playerId', params: { playerId } }); } else { toast.error("Cannot view details: Player ID is missing."); }
    };

    // --- Render Logic ---
    if (isLoadingTeams) { return (<div className='flex items-center justify-center h-screen'> <LoaderCircle className="mr-2 h-6 w-6 animate-spin" /> <span className="text-lg">Loading essential data...</span> </div>); }

    const {theme} = useTheme()

    return (
        <SidebarInset className="w-full lg:m-2 sm:m-6 flex flex-col h-full">
            {/* Header */}
            <header className={`flex flex-col sm:flex-row h-auto sm:h-16 shrink-0 items-center justify-between gap-2 border-b p-4 ${theme === "dark" ? "bg-black" : "bg-white"} `}>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SidebarTrigger className="-ml-1" /> <Separator orientation="vertical" className="mx-2 h-6" />
                    <Breadcrumb> <BreadcrumbList className='tracking-wider text-sm sm:text-base'> <BreadcrumbItem> <Link to="/app/players" className="transition-colors hover:text-foreground"><BreadcrumbLink>Players</BreadcrumbLink></Link> </BreadcrumbItem> <BreadcrumbSeparator /> <BreadcrumbItem> <BreadcrumbPage>List</BreadcrumbPage> </BreadcrumbItem> </BreadcrumbList> </Breadcrumb>
                </div>
                <AddPlayerDialog open={openAddDialog} setOpen={setOpenAddDialog} newPlayer={newPlayer as Player} setNewPlayer={setNewPlayer as (player: Player) => void} teams={safeTeams} roles={ROLES} IPL_TEAMS={IPL_TEAMS} battingStyles={BATTING_STYLES} bowlingStyles={BOWLING_STYLES} handleAddPlayer={handleAddPlayerSubmit} handleCancelAdd={handleCancelAdd} />
            </header>

            {/* Filter Controls */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b shrink-0 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
                <Input placeholder="Filter by player name..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="w-full sm:w-100" autoFocus />
                <div className="flex gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
                    <DropdownMenu> <DropdownMenuTrigger asChild><Button variant="outline" className="w-full sm:w-auto cursor-pointer"><Plus className="h-4 w-4 mr-2" /> Role {selectedRoles.length > 0 ? `(${selectedRoles.length})` : ''}</Button></DropdownMenuTrigger> <DropdownMenuContent align="center" className='w-auto'>{ROLES.map((role) => (<DropdownMenuCheckboxItem className={`cursor-pointer`} key={role} checked={selectedRoles.includes(role)} onCheckedChange={() => toggleRole(role)} onSelect={(e) => e.preventDefault()}>{role}</DropdownMenuCheckboxItem>))}</DropdownMenuContent> </DropdownMenu>
                    <DropdownMenu> <DropdownMenuTrigger asChild><Button variant="outline" className="w-full sm:w-auto cursor-pointer"><Plus className="h-4 w-4 mr-2" /> Status {selectedStatuses.length > 0 ? `(${selectedStatuses.length})` : ''}</Button></DropdownMenuTrigger> <DropdownMenuContent align="center" className='w-auto'>{STATUSES.map((status) => (<DropdownMenuCheckboxItem className='cursor-pointer' key={status} checked={selectedStatuses.includes(status)} onCheckedChange={() => toggleStatus(status)} onSelect={(e) => e.preventDefault()}>{status}</DropdownMenuCheckboxItem>))}</DropdownMenuContent> </DropdownMenu>
                    <DropdownMenu> <DropdownMenuTrigger asChild><Button variant="outline" className="w-full sm:w-auto cursor-pointer"><Plus className="h-4 w-4 mr-2" /> IPL Team {selectIPLTeam.length > 0 ? `(${selectIPLTeam.length})` : ''}</Button></DropdownMenuTrigger> <DropdownMenuContent align="center" className='w-auto'>{IPL_TEAMS.map((iplTeam) => (<DropdownMenuCheckboxItem className='cursor-pointer' key={iplTeam} checked={selectIPLTeam.includes(iplTeam)} onCheckedChange={() => toggleiplTeam(iplTeam)} onSelect={(e) => e.preventDefault()}>{iplTeam}</DropdownMenuCheckboxItem>))}</DropdownMenuContent> </DropdownMenu>
                    <DropdownMenu> <DropdownMenuTrigger asChild><Button variant="outline" className="w-full sm:w-auto cursor-pointer"><Plus className="h-4 w-4 mr-2" /> Team {selectTeam.length > 0 ? `(${selectTeam.length})` : ''}</Button></DropdownMenuTrigger> <DropdownMenuContent align="center" className='w-auto'>{safeTeams.map((team) => (<DropdownMenuCheckboxItem className='cursor-pointer' key={team.id} checked={selectTeam.includes(team.id || "")} onCheckedChange={() => toggleTeam(team.id || "")} onSelect={(e) => e.preventDefault()}>{team.name}</DropdownMenuCheckboxItem>))}</DropdownMenuContent> </DropdownMenu>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 container mx-auto py-4 px-0 sm:px-4 relative overflow-y-auto">
                {/* Loading / Error States */}
                {(isLoadingPlayers || isFetching) && (<div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-md"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading Players...</div>)}
                {errorPlayers && !isLoadingPlayers && (<div className='p-4 mb-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md'>Error fetching players: {errorPlayers.message}</div>)}

                {/* Player Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[150px]"> Sr. No.</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[150px]">Name</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[120px]">Country</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[120px]">IPL Team</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[80px]">Base Price</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[80px]">Sell Price</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[130px]">Role</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[150px]">Team</TableHead>
                                <TableHead className="px-4 py-3 whitespace-nowrap w-[100px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Use playersData (sliced list) */}
                            {!isLoadingPlayers && !errorPlayers && playersData.length > 0 ? (
                                playersData.map((player, index) => (
                                    <TableRow key={index} className="hover:bg-muted/40 cursor-pointer transition-colors duration-150" onClick={() => handleRowClick(player.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRowClick(player.id) }} >
                                        <TableCell className="font-medium px-4 py-2">{index + 1 + (pagination.pageIndex) * DEFAULT_PAGE_SIZE}</TableCell>
                                        <TableCell className="font-medium px-4 py-2">{player.name || 'N/A'}</TableCell>
                                        <TableCell className="px-4 py-2">{player.country || 'N/A'}</TableCell>
                                        <TableCell className="px-4 py-2">{player.iplTeam || 'N/A'}</TableCell>
                                        <TableCell className="px-4 py-2">{player.basePrice ?? 'N/A'}</TableCell>
                                        <TableCell className="px-4 py-2">{player.basePrice ? player.sellPrice ?? "-" : "-"}</TableCell>
                                        <TableCell className="px-4 py-2">{player.role || 'N/A'}</TableCell>
                                        <TableCell className="px-4 py-2">{player.teamId ? player.teamId : "-"}</TableCell>
                                        <TableCell className="px-4 py-2">{player.status || 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                !isLoadingPlayers && !isFetching && !errorPlayers && playersData.length === 0 && (<TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No players found matching the criteria.</TableCell></TableRow>)
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls (Workaround Logic) */}
                {/* Show controls only if on page > 0 OR if there's a next page */}
                {(pagination.pageIndex >= 0 || hasNextPage) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 mt-4 shrink-0">
                        {/* Display current page number ONLY */}
                        <span className="text-sm text-muted-foreground mb-2 sm:mb-0">
                            Page {pagination.pageIndex + 1}
                            {/* We cannot show total pages or total players accurately */}
                        </span>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                                disabled={pagination.pageIndex === 0}
                                aria-label="Go to previous page"
                                className='cursor-pointer'
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                                disabled={!hasNextPage || isFetching}
                                aria-label="Go to next page"
                                className='cursor-pointer'
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div> {/* End Content Area */}
        </SidebarInset>
    );
}