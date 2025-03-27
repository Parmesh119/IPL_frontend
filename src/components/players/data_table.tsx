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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

interface Player {
    name: string;
    age: number;
    role: string;
    battingStyle: string;
    bowlingStyle?: string;
    country: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [open, setOpen] = useState(false);
    const [newPlayer, setNewPlayer] = useState<Player>({
        name: "",
        age: 0,
        role: "",
        battingStyle: "",
        bowlingStyle: undefined,
        country: "",
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

    const roles = ["Batsman", "Bowler", "Wicketkeeper", "All-Rounder"]
    const status = ["Pending", "Sold", "Unsold"]
    const battingStyles = ["Right-Hand", "Left-Hand"];
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPlayer(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role: string) => {
        setNewPlayer(prev => ({ ...prev, role }));
    };

    const handleBattingStyleChange = (battingStyle: string) => {
        setNewPlayer(prev => ({ ...prev, battingStyle }));
    };

    const handleBowlingStyleChange = (bowlingStyle: string | undefined) => {
        setNewPlayer(prev => ({ ...prev, bowlingStyle }));
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlayer(prev => ({...prev, country: e.target.value}))
    }

    const handleAddPlayer = () => {
        // Validation
        if (!newPlayer.name || !newPlayer.age || !newPlayer.role || !newPlayer.battingStyle || !newPlayer.country) {
            alert("Please fill in all required fields.");
            return;
        }
        setOpen(false);
        console.log("Adding player:", newPlayer);
        // Here you would add the newPlayer to your data array and update the table.
        // For this example, I'm just logging the player to the console.
    };

    const handleCancelAdd = () => {
        setOpen(false);
        setNewPlayer({ name: "", age: 0, role: "", battingStyle: "", bowlingStyle: undefined, country: "" });
    };

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
                                    />
                                    <span>{stat}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-500 text-white tracking-wider w-full sm:w-auto cursor-pointer" variant="outline">Add Player</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Player</DialogTitle>
                            <DialogDescription>
                                Add a new player to the list.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input id="name" name="name" value={newPlayer.name} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="age" className="text-right">
                                    Age
                                </Label>
                                <Input id="age" type="number" name="age" value={newPlayer.age} onChange={handleInputChange} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="country" className="text-right">
                                    Country
                                </Label>
                                <Input id="country" name="country" value={newPlayer.country} onChange={handleCountryChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right ">
                                    Role
                                </Label>
                                <Select onValueChange={handleRoleChange} defaultValue={newPlayer.role}>
                                    <SelectTrigger className="col-span-3 cursor-pointer">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem className="cursor-pointer" key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="battingStyle" className="text-right">
                                    Batting Style
                                </Label>
                                <Select onValueChange={handleBattingStyleChange} defaultValue={newPlayer.battingStyle}>
                                    <SelectTrigger className="col-span-3 cursor-pointer">
                                        <SelectValue placeholder="Select Batting Style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {battingStyles.map(style => (
                                            <SelectItem className="cursor-pointer" key={style} value={style}>{style}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {newPlayer.role === "Bowler" || newPlayer.role === "All-Rounder" ? (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bowlingStyle" className="text-right">
                                        Bowling Style
                                    </Label>
                                    <Select onValueChange={handleBowlingStyleChange} defaultValue={newPlayer.bowlingStyle}>
                                        <SelectTrigger className="col-span-3 cursor-pointer">
                                            <SelectValue placeholder="Select Bowling Style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bowlingStyles.map(style => (
                                                <SelectItem className="cursor-pointer" key={style} value={style}>{style}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : null}
                        </div>
                        <DialogFooter>
                            <Button className="cursor-pointer" type="button" variant="secondary" onClick={handleCancelAdd}>
                                Cancel
                            </Button>
                            <Button className="cursor-pointer" type="submit" onClick={handleAddPlayer}>Add</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-md border overflow-x-auto">
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
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
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