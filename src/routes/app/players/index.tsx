import React, { useState, useMemo } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Plus, Upload, Loader, Trash2 } from 'lucide-react';
import { useDebounce } from "@uidotdev/usehooks";
import { toast } from "sonner";
import { uploadFileAction } from "@/lib/actions";
import { deletePlayerAction } from "@/lib/actions";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";

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
import { type Player, type ListUserRequest } from "@/schemas/players";
import {
    listPlayersAction, // ** Action now returns Promise<Player[]> **
    getTeamById,
    addPlayerAction,
    getAllTeams,
} from "@/lib/actions";

import { useTheme } from '@/components/theme-provider';
import { Badge } from '@/components/ui/badge';

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
        bowlingStyle: "", teamId: "", basePrice: 0.0, sellPrice: null,
        iplTeam: "", status: "Pending",
    });
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [isGlobalSelected, setIsGlobalSelected] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const fileUpload = useMutation({
        mutationFn: async (file: File) => {
            return await uploadFileAction(file); // Call the action function
        },
        onSuccess: () => {
            window.location.reload()
        },
        onError: (error: any) => {
            toast.error(`Error uploading file: ${error.response?.data?.error || error.message}`);
        },
    });

    // --- Data Fetching: Teams ---
    const { data: teamsData, isLoading: isLoadingTeams, error: errorTeams } = useQuery({
        queryKey: ["teams"],
        queryFn: getAllTeams,
        staleTime: 5 * 60 * 1000,
    });

    const {
        data: fetchedPlayersList = defaultPlayersData,
        isLoading: isLoadingPlayers,
        error: errorPlayers,
        isFetching,
    } = useQuery<Player[], Error>({
        queryKey: [
            'playersList',
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
            selectedRoles,
            selectedStatuses,
            selectIPLTeam,
            selectTeam,
        ],
        queryFn: async (): Promise<Player[]> => {
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

    const { mutate: addPlayer, isPending: isAddingPlayer } = useMutation<Player, Error, Player>({
        mutationFn: addPlayerAction,
        onSuccess: (data) => { toast.success(`Player "${data.name}" added successfully`); queryClient.invalidateQueries({ queryKey: ['playersList'] }); setOpenAddDialog(false); handleCancelAdd(); },
        onError: (error) => { toast.error(`Error adding player: ${error.message || "An unknown error occurred"}`); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const deletedPlayer = await deletePlayerAction(id);
            return deletedPlayer;
        },
        onSuccess: () => {
            toast.success("Player deleted successfully");
            window.location.href = `/app/players`;
        },
        onError: () => {
            toast.error(`Error deleting player`);
            setSelectedPlayers([]);
        },
    });

    const safeTeams = useMemo(() => Array.isArray(teamsData) ? teamsData : [], [teamsData]);

    const hasNextPage = useMemo(() => fetchedPlayersList.length >= pagination.pageSize, [fetchedPlayersList, pagination.pageSize]);

    const playersData = useMemo(() => fetchedPlayersList.slice(0, pagination.pageSize), [fetchedPlayersList, pagination.pageSize]);

    if (errorTeams) {
        return (<div className='p-4 m-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md'> Error loading essential team data: {errorTeams.message}. Cannot manage players effectively. Please try reloading. </div>);
    }

    const handleAddPlayerSubmit = () => {
        // No validation logic here since we've moved it to the AddPlayerDialog component
        const selectedTeam = safeTeams.find((team) => team.name === newPlayer.teamId);
        const playerToValidate = {
            ...newPlayer,
            teamId: selectedTeam?.id,
            age: newPlayer.age === undefined ? undefined : Number(newPlayer.age),
            sellPrice: Number(newPlayer.sellPrice) == null ? null : Number(newPlayer.sellPrice),
            basePrice: Number(newPlayer.basePrice),
            iplTeam: String(newPlayer.iplTeam),
            battingStyle: String(newPlayer.battingStyle),
            role: String(newPlayer.role),
            country: String(newPlayer.country),
            status: newPlayer.status ?? "Pending",
            bowlingStyle: newPlayer.bowlingStyle ? String(newPlayer.bowlingStyle) : undefined,
        };

        // Validation is now handled inside the dialog component
        addPlayer(playerToValidate as Player);
    };
    const handleCancelAdd = () => { /* ... reset form ... */
        setOpenAddDialog(false); setNewPlayer({ name: "", country: "", age: undefined, role: "", battingStyle: "", bowlingStyle: "", teamId: "", basePrice: 0.0, sellPrice: null, iplTeam: "", status: "Pending", });
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

    const { theme } = useTheme()

    // State to track upload status



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) {
            toast.error("No file selected.");
            return;
        }

        // Validate file type
        const validTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Invalid file type. Please upload a .csv or .xlsx file.");
            return;
        }

        setIsUploading(true);

        setTimeout(() => {
            setIsUploading(false);
            toast.success(`File "${selectedFile.name}" uploaded successfully.`);
        }, 2000);

        setFile(selectedFile);

        fileUpload.mutate(selectedFile);
    };

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleDownloadSampleFile = () => {
        const sampleData = [
            ["Name", "Country", "Role", "Base Price", "IPL Team"],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "sample.xlsx";
        link.click();

        URL.revokeObjectURL(url);
        handleCloseDialog(); // Close the dialog after downloading
    };

    const handleGlobalCheckboxChange = (isChecked: boolean) => {
        setIsGlobalSelected(isChecked);
        if (isChecked) {
            const allPlayerIds = playersData.map((player) => player.id);
            setSelectedPlayers(allPlayerIds.filter((id): id is string => id !== undefined));
        } else {
            setSelectedPlayers([]);
        }
    };

    const handleRowCheckboxChange = (playerId: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedPlayers((prev) => [...prev, playerId]);
        } else {
            setSelectedPlayers((prev) => prev.filter((id) => id !== playerId));
            setIsGlobalSelected(false);
        }
    };

    const handleDeletePlayer = () => {
        if (isGlobalSelected) {
            if (!window.confirm("Are you sure you want to delete all selected players?")) {
                return;
            }

            selectedPlayers.forEach((playerId) => {
                deleteMutation.mutate(playerId);
            });

            setSelectedPlayers([]);
            setIsGlobalSelected(false);
        } else {
            if (newPlayer.teamId !== null) {
                toast.error("Player is a part of a team. Cannot remove the player")
                setSelectedPlayers([]);
                return;
            }
            if (selectedPlayers.length === 1) {
                deleteMutation.mutate(selectedPlayers[0]);
            } else {
                toast.error("Please select a single player to delete.");
            }
        }
    };

    return (
        <SidebarInset className="w-full lg:m-2 sm:m-6 flex flex-col h-full tracking-wider">
            <header className={`flex flex-col sm:flex-row h-auto sm:h-16 shrink-0 items-center justify-between gap-2 border-b p-4 ${theme === "dark" ? "bg-black" : "bg-white"} `}>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mx-2 h-6" />
                    <Breadcrumb>
                        <BreadcrumbList className="tracking-wider text-sm sm:text-base">
                            <BreadcrumbItem>
                                <Link to="/app/players" className="transition-colors hover:text-foreground">
                                    <BreadcrumbLink>Players</BreadcrumbLink>
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>List</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant={theme === "dark" ? null : "destructive"}
                        className={`cursor-pointer ${theme !== "dark" ? "text-white font-bold" : "bg-destructive text-white font-bold"}`}
                        disabled={selectedPlayers.length === 0} onClick={() => handleDeletePlayer()}><Trash2 />{isGlobalSelected ? "Delete All" : "Delete Player"}</Button>
                    <label
                        onClick={handleOpenDialog} // Open the dialog when clicking the Upload button
                        className={`flex flex-row cursor-pointer tracking-wider px-4 py-1 gap-2 text-md rounded-sm ${theme === "dark" ? "!bg-blue-500 text-white" : "bg-white text-black border border-gray-800"}`}
                    >
                        <Upload className="w-4 h-6" /> Upload
                    </label>
                    <input
                        id="file_upload"
                        type="file"
                        accept=".csv, .xlsx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e)}
                    />
                    <AddPlayerDialog
                        open={openAddDialog}
                        setOpen={setOpenAddDialog}
                        newPlayer={newPlayer as Player}
                        setNewPlayer={setNewPlayer as (player: Player) => void}
                        teams={safeTeams}
                        roles={ROLES}
                        IPL_TEAMS={IPL_TEAMS}
                        battingStyles={BATTING_STYLES}
                        bowlingStyles={BOWLING_STYLES}
                        handleAddPlayer={handleAddPlayerSubmit}
                        handleCancelAdd={handleCancelAdd}
                    />
                </div>
            </header>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Upload Instructions</AlertDialogTitle>
                        <AlertDialogDescription>
                            Make sure that all column names in your file match the following format:
                            <ul className="mt-2 list-disc list-inside">
                                <li>Name</li>
                                <li>Country</li>
                                <li>Role</li>
                                <li>Base Price</li>
                                <li>IPL Team</li>
                            </ul>
                            <p className="mt-4">
                                <a
                                    href="#"
                                    onClick={handleDownloadSampleFile}
                                    className="text-blue-500 underline cursor-pointer"
                                >
                                    Click here to download a sample Excel file
                                </a>
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCloseDialog} className='cursor-pointer'>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                document.getElementById("file_upload")?.click(); // Trigger file input click
                                handleCloseDialog();
                            }}
                            className='cursor-pointer'
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isUploading && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                    <div className="p-6 rounded-md shadow-md border flex flex-col items-center
                    bg-white text-black border-gray-300
                    dark:bg-[#0f0f0f] dark:text-white dark:border-white">
                        <Loader className="animate-spin w-8 h-8 text-blue-500 mb-3" />
                        <p className="text-base font-medium">Uploading...</p>
                    </div>
                </div>
            )}



            {/* Filter Controls */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b shrink-0 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Input
                        placeholder="Filter by player name..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-100"
                        autoFocus
                    />

                </div>
                <div className="flex gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" /> Role {selectedRoles.length > 0 ? `(${selectedRoles.length})` : ''}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-auto">
                            {ROLES.map((role) => (
                                <DropdownMenuCheckboxItem
                                    className={`cursor-pointer`}
                                    key={role}
                                    checked={selectedRoles.includes(role)}
                                    onCheckedChange={() => toggleRole(role)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {role}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" /> Status {selectedStatuses.length > 0 ? `(${selectedStatuses.length})` : ''}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-auto">
                            {STATUSES.map((status) => (
                                <DropdownMenuCheckboxItem
                                    className="cursor-pointer"
                                    key={status}
                                    checked={selectedStatuses.includes(status)}
                                    onCheckedChange={() => toggleStatus(status)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {status}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" /> IPL Team {selectIPLTeam.length > 0 ? `(${selectIPLTeam.length})` : ''}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-auto">
                            {IPL_TEAMS.map((iplTeam) => (
                                <DropdownMenuCheckboxItem
                                    className="cursor-pointer"
                                    key={iplTeam}
                                    checked={selectIPLTeam.includes(iplTeam)}
                                    onCheckedChange={() => toggleiplTeam(iplTeam)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {iplTeam}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" /> Team {selectTeam.length > 0 ? `(${selectTeam.length})` : ''}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-auto">
                            {safeTeams.map((team) => (
                                <DropdownMenuCheckboxItem
                                    className="cursor-pointer"
                                    key={team.id}
                                    checked={selectTeam.includes(team.id || "")}
                                    onCheckedChange={() => toggleTeam(team.id || "")}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {team.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-100 lg:w-full mx-auto py-4 sm:px-4 relative overflow-y-auto">
                {/* Loading / Error States */}
                {(isLoadingPlayers || isFetching) && (<div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-md"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading Players...</div>)}
                {errorPlayers && !isLoadingPlayers && (<div className='p-4 mb-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md'>Error fetching players: {errorPlayers.message}</div>)}

                {/* Player Table */}
                <div className="rounded-md border overflow-x-auto">

                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="px-4 py-3 text-center w-[50px]">
                                    <input
                                        type="checkbox"
                                        checked={isGlobalSelected}
                                        onChange={(e) => handleGlobalCheckboxChange(e.target.checked)}
                                        aria-label="Select all players"
                                        className="cursor-pointer"
                                    />
                                </TableHead>
                                <TableHead className="px-4 py-3 text-center">Sr. No.</TableHead>
                                <TableHead className="px-4 py-3">Name</TableHead>
                                <TableHead className="px-4 py-3">Country</TableHead>
                                <TableHead className="px-4 py-3">IPL Team</TableHead>
                                <TableHead className="px-4 py-3">Base Price</TableHead>
                                <TableHead className="px-4 py-3">Sell Price</TableHead>
                                <TableHead className="px-4 py-3">Role</TableHead>
                                <TableHead className="px-4 py-3">Team</TableHead>
                                <TableHead className="px-4 py-3">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        {playersData.length !== 0 ? (<TableBody>
                            {playersData.map((player, index) => (
                                <TableRow
                                    key={player.id}
                                    className="hover:bg-muted/40 cursor-pointer transition-colors duration-150"
                                    onClick={() => handleRowClick(player.id)} // Row click handler
                                >
                                    <TableCell
                                        className="px-4 py-2 text-center"
                                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPlayers.includes(player.id || "")}
                                            onChange={(e) => handleRowCheckboxChange(player.id || "", e.target.checked)}
                                            aria-label={`Select player ${player.name}`}
                                            className="cursor-pointer"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium px-4 py-2 text-center">
                                        {index + 1 + pagination.pageIndex * DEFAULT_PAGE_SIZE}
                                    </TableCell>
                                    <TableCell className="font-medium px-4 py-2">{player.name || 'N/A'}</TableCell>
                                    <TableCell className="px-4 py-2">{player.country || 'N/A'}</TableCell>
                                    <TableCell className="px-4 py-2">{player.iplTeam || 'N/A'}</TableCell>
                                    <TableCell className="px-4 py-2">{player.basePrice ?? 'N/A'} Cr</TableCell>
                                    <TableCell className="px-4 py-2">
                                        {player.basePrice ? (player.sellPrice ? player.sellPrice + ' Cr' : '-') : '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">{player.role || 'N/A'}</TableCell>
                                    <TableCell className="px-4 py-2">{player.teamId || '-'}</TableCell>
                                    <TableCell className="px-4 py-2">
                                        <Badge
                                            className={`px-2 font-bold tracking-wider text-sm rounded-md ${player.status === 'Unsold'
                                                ? 'bg-red-900 text-red-100'
                                                : player.status === 'Sold'
                                                    ? 'bg-green-900 text-green-100'
                                                    : player.status === 'Pending'
                                                        ? 'bg-blue-900 text-blue-100'
                                                        : player.status === 'Current_Bid'
                                                            ? 'bg-yellow-500 text-black'
                                                            : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {player.status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        ) : (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-4">
                                        No players found.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                </div>

                {(pagination.pageIndex >= 0 || hasNextPage) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 mt-4 shrink-0">

                        <span className="text-sm text-muted-foreground mb-2 sm:mb-0">
                            Page {pagination.pageIndex + 1}

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