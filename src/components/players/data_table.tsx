"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnFiltersState,
    getFilteredRowModel
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getAllTeams } from "@/lib/actions"
import { type Player, PlayerSchema } from "@/schemas/players"
import { Link } from "@tanstack/react-router"
import AddPlayerDialog from "@/components/players/AddPlayerDialog";
import { useTheme } from "@/components/theme-provider"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addPlayerAction } from "@/lib/actions"
import { toast } from "sonner"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}


export function DataTable<TData extends { id: string }, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {

    const { theme } = useTheme()
    
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [open, setOpen] = useState(false); // State for AddPlayerDialog visibility
    const [newPlayer, setNewPlayer] = useState<Player>({

        name: "",
        country: "",
        age: undefined,
        role: "",
        battingStyle: "",
        bowlingStyle: "",
        teamId: "",
        basePrice: "",
        sellPrice: "",
        iplTeam: "",
        status: "Pending"
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
        },

        filterFns: {
            arrIncludesSome: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const value = row.getValue(columnId);

                return Array.isArray(filterValue) && filterValue.includes(value);
            }
        },
    })

    const roles = ["Batsman", "Bowler", "Wicketkeeper", "All-rounder"]
    const status = ["Pending", "Sold", "Unsold"]
    const battingStyles = ["Right-handed", "Left-handed"];
    const bowlingStyles = ["Fast", "Spin", "Medium"];

    const { data: teams, isLoading: isLoadingTeams, error: errorTeams } = useQuery({
        queryKey: ["teams"],
        queryFn: async () => {
            const teamsData = await getAllTeams();

            return Array.isArray(teamsData) ? teamsData : [];
        },
    });

    // Filter logic for roles
    const toggleRole = (role: string) => {
        const newSelectedRoles = selectedRoles.includes(role)
            ? selectedRoles.filter((r) => r !== role)
            : [...selectedRoles, role];
        setSelectedRoles(newSelectedRoles);

        table.getColumn("role")?.setFilterValue(newSelectedRoles.length > 0 ? newSelectedRoles : undefined);

    };

    // Filter logic for status
    const toggleStatus = (stat: string) => {
        const newSelectedStatus = selectedStatus.includes(stat)
            ? selectedStatus.filter((s) => s !== stat)
            : [...selectedStatus, stat];
        setSelectedStatus(newSelectedStatus);

        table.getColumn("status")?.setFilterValue(newSelectedStatus.length > 0 ? newSelectedStatus : undefined);

    };

    const queryClient = useQueryClient(); // Get query client instance


    const { mutate: addPlayer } = useMutation({
        mutationFn: async (player: Player) => {

            const data = await addPlayerAction(player);

            if (!data) {
                throw new Error("Failed to add player");
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Player added successfully");
            queryClient.invalidateQueries({ queryKey: ['players'] });

            setOpen(false);

            handleCancelAdd();

        },
        onError: (error) => {
            console.error("Error adding player:", error);

            toast.error(`Error adding player: ${error.message || "Unknown error"}`);

        },
    });


    const handleAddPlayerSubmit = () => {

        const selectedTeam = teams?.find((team) => team.name === newPlayer.teamId);
        const teamIdToSend = selectedTeam?.id; // Get the ID


        if (newPlayer.teamId && !selectedTeam) {
            toast.error("Invalid team selected. Please refresh or choose a valid team.");
            return;
        }


        const playerToValidate: Partial<Player> = {
            ...newPlayer,

            teamId: teamIdToSend || undefined,

            age: newPlayer.age ? Number(newPlayer.age) : undefined,
        };


        const validationResult = PlayerSchema.safeParse(playerToValidate);

        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join("; ");
            toast.error(`Validation failed: ${errorMessages}`);
            console.error("Zod Validation Errors:", validationResult.error.flatten());
            return;
        }


        if (validationResult.data.role === "Bowler" && !validationResult.data.bowlingStyle) {
            toast.error("Bowling style is required for Bowlers");
            return;
        }


        addPlayer(validationResult.data as Player);
    };


    const handleCancelAdd = () => {
        setOpen(false);
        setNewPlayer({
            name: "",
            country: "",
            age: undefined,
            role: "",
            battingStyle: "",
            bowlingStyle: "",
            teamId: "",
            basePrice: "",
            sellPrice: "",
            iplTeam: "",
            status: "Pending",
        });
    };



    if (isLoadingTeams) {
        return <div className='flex items-center justify-center m-auto'>Loading team data...</div>;
    }
    if (errorTeams) {
        console.error("Error fetching teams:", errorTeams);
        return <div className='flex items-center justify-center m-auto text-red-600'>Error fetching teams data. Please try again later.</div>;
    }

    const safeTeams = Array.isArray(teams) ? teams : [];

    return (
        <div className="w-full px-2 sm:px-4 tracking-wider">
            <div className="flex flex-col sm:flex-row items-center py-4 justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4 sm:gap-4 cursor-pointer">
                    <Input
                        autoFocus
                        placeholder="Filter By Player Names ..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer border-input bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Role
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-full sm:w-full cursor-pointer">
                            {roles.map((role) => (
                                <DropdownMenuItem key={role} onSelect={(e) => e.preventDefault()} className="flex items-center space-x-2 cursor-pointer">
                                    <Checkbox
                                        id={`role-${role}`}
                                        checked={selectedRoles.includes(role)}
                                        onCheckedChange={() => toggleRole(role)}
                                        className={`border ${theme === "dark" ? "border-white" : "border-black"}`}
                                    />
                                    <label htmlFor={`role-${role}`} className="cursor-pointer">{role}</label>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer border-input bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Status
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-full sm:w-auto">
                            {status.map((stat) => (
                                <DropdownMenuItem key={stat} onSelect={(e) => e.preventDefault()} className="flex items-center space-x-2 cursor-pointer">
                                    <Checkbox
                                        id={`status-${stat}`}
                                        checked={selectedStatus.includes(stat)}
                                        onCheckedChange={() => toggleStatus(stat)}
                                        className={`border ${theme === "dark" ? "border-white" : "border-black"}`}
                                    />
                                    <label htmlFor={`status-${stat}`} className="cursor-pointer">{stat}</label>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                </div>
                <AddPlayerDialog
                    open={open}
                    setOpen={setOpen}
                    newPlayer={newPlayer}
                    setNewPlayer={setNewPlayer}
                    teams={safeTeams ?? []}
                    roles={roles}
                    battingStyles={battingStyles}
                    bowlingStyles={bowlingStyles}
                    handleAddPlayer={handleAddPlayerSubmit}
                    handleCancelAdd={handleCancelAdd}
                />
            </div>




            <div className="rounded-md border mt-4 overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id} className="bg-gray-100 dark:bg-gray-800">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}

                                        className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-muted-foreground"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer relative hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3 text-xs sm:text-sm md:text-base"
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    <Link
                                        to={`/app/players/$playerId`}
                                        params={{ playerId: row.original.id as string }}
                                        className="absolute inset-0 z-10"
                                        aria-label={`View player ${row.original.name}`}
                                    ></Link>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}

                                    className="h-24 text-center text-xs sm:text-sm md:text-base"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                <span className="text-xs sm:text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="cursor-pointer"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="cursor-pointer"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}