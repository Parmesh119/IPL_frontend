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
import AddPlayerDialog from "@/components/players/AddPlayerDialog"; // Import the new component
import { useTheme } from "@/components/theme-provider"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addPlayerAction } from "@/lib/actions"
import { toast } from "sonner"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}


export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    
    const { theme } = useTheme()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [open, setOpen] = useState(false);
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
        }
    })

    const roles = ["Batsman", "Bowler", "Wicketkeeper", "All-rounder"]
    const status = ["Pending", "Sold", "Unsold"]
    const battingStyles = ["Right-handed", "Left-handed"];
    const bowlingStyles = ["Fast", "Spin", "Medium"];

    const toggleRole = (role: string) => {
        const newSelectedRoles = selectedRoles.includes(role)
            ? selectedRoles.filter((r) => r !== role)
            : [...selectedRoles, role];

        setSelectedRoles(newSelectedRoles);

        // Apply filter for roles
        table.getColumn("role")?.setFilterValue(
            newSelectedRoles.length > 0 ? newSelectedRoles : undefined
        );
    };

    const toggleStatus = (stat: string) => {
        const newSelectedStatus = selectedStatus.includes(stat)
            ? selectedStatus.filter((s) => s !== stat)
            : [...selectedStatus, stat];

        setSelectedStatus(newSelectedStatus);

        // Apply filter for status
        table.getColumn("status")?.setFilterValue(
            newSelectedStatus.length > 0 ? newSelectedStatus : undefined
        );
    };

    const handleAddPlayer = () => {
        // Find the selected team's ID based on the name
        const selectedTeam = teams?.find((team) => team.name === newPlayer.teamId);

        if (!selectedTeam) {
            alert("Invalid team selection");
            return;
        }

        // Convert player data to match schema (replace team name with ID)
        const parsedPlayer = {
            ...newPlayer,
            teamId: selectedTeam.id,  // Replace name with ID
            age: newPlayer.age ? Number(newPlayer.age) : 0,
        };

        // Validate using Zod
        const validationResult = PlayerSchema.safeParse(parsedPlayer);

        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map((err) => err.message).join("\n");
            alert(errorMessages);
            return;
        }
        addPlayer(parsedPlayer);
        setOpen(false);
    };

    const { mutate: addPlayer } = useMutation({
        mutationFn: async (player: Player) => {
            const data = await addPlayerAction(player);
            return data
        },

        onSuccess: () => {
            toast.success("Player added successfully");
            window.location.reload();
            setOpen(false);
        },
        onError: (err) => {
            alert(`Error adding player: ${err.message}`);
            toast.error("Error adding player");
        },
    });

    const handleCancelAdd = () => {
        setOpen(false);
        setNewPlayer({
            name: "",
            country: "",
            age: 0,
            role: "",
            battingStyle: "",
            bowlingStyle: "",
            teamId: "",
            basePrice: "",
            sellPrice: "",
            status: "Pending",
        });
    };

    const { data: teams, isLoading, error } = useQuery({
        queryKey: ["teams"],
        queryFn: async () => {
            const teams = await getAllTeams();
            return teams
        },
    });

    if (isLoading) {
        return <div className='flex items-center m-auto'>Loading teams...</div>
    }
    if (error) {
        return <div className='flex items-center m-auto'> Error while fetching teams data</div>
    }

    return (
        <div className="tracking-wider">
            <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-2 md:gap-0">
                <div className="flex flex-col sm:flex-row items-center w-full gap-2 sm:gap-4">
                    <Input
                        autoFocus
                        placeholder="Filter By Names..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="w-full sm:max-w-sm"
                    />
                    <DropdownMenu >
                        <DropdownMenuTrigger asChild >
                            <Button className="bg-white cursor-pointer text-black hover:bg-white hover:text-black border border-gray-600 w-full sm:w-auto">
                                <Plus className="border border-black rounded-full text-black mr-2" /> Role
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mt-1 ml-16">
                            {roles.map((role) => (
                                <DropdownMenuItem key={role} className="flex items-center space-x-4 cursor-pointer">
                                    <Checkbox
                                        checked={selectedRoles.includes(role)}
                                        onCheckedChange={() => toggleRole(role)}
                                        className={`"border" ${theme === "dark" ? "border-white" : "border-black"}`}
                                    />
                                    <span>{role}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-white cursor-pointer text-black hover:bg-white hover:text-black border border-gray-600 w-full sm:w-auto">
                                <Plus className="border border-black rounded-full text-black mr-2" /> Status
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mt-1 ml-2">
                            {status.map((stat) => (
                                <DropdownMenuItem key={stat} className="flex items-center space-x-4 cursor-pointer">
                                    <Checkbox
                                        checked={selectedStatus.includes(stat)}
                                        onCheckedChange={() => toggleStatus(stat)}
                                        className={`"border" ${theme === "dark" ? "border-white" : "border-black"}`}
                                    />
                                    <span>{stat}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <span className="border border-white rounded-md "><AddPlayerDialog
                    open={open}
                    setOpen={setOpen}
                    newPlayer={newPlayer}
                    setNewPlayer={setNewPlayer}
                    teams={teams ?? []}
                    roles={roles}
                    battingStyles={battingStyles}
                    bowlingStyles={bowlingStyles}
                    handleAddPlayer={handleAddPlayer}
                    handleCancelAdd={handleCancelAdd}
                /></span>
            </div>
            <div className="rounded-md border overflow-x-auto mt-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
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
                    <TableBody className="cursor-pointer">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    style={{ position: 'relative' }} // Make the row relative
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    <Link
                                        to={`/app/players/$playerId`}
                                        params={{ playerId: row.original.id }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            color: 'inherit',
                                            textDecoration: 'none',
                                            zIndex: 1, // Ensure it's on top
                                        }}
                                    />
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end sm:space-x-2 py-4 ">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="w-full sm:w-auto cursor-pointer"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="w-full sm:w-auto cursor-pointer"
                >
                    Next
                </Button>
            </div>
        </div>
    )
}