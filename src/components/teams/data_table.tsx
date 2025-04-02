"use client"

import { useState } from "react"
import { Link } from "@tanstack/react-router"

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type ColumnFiltersState,
    getFilteredRowModel
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddTeamDialog } from "./AddTeamDialog"
import { useTheme } from "@/components/theme-provider"

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters
        }
    })

    return (
        <div className="w-full px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-center py-4 tracking-wider justify-between gap-4">
                <Input
                    placeholder="Filter By Team Name ..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    autoFocus
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="w-full sm:max-w-sm"
                />
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className={`border cursor-pointer ${theme === "dark" ? "border-white" : "bg-blue-500 hover:bg-white hover:text-black"}`}
                >
                    Add Team
                </Button>
            </div>
            <AddTeamDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
            
            {/* Responsive Table */}
            <div className="rounded-md border tracking-wider mt-4 overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-gray-100 dark:bg-gray-800">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-4 py-2 text-left text-xs sm:text-sm md:text-base"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                                            className="px-2 py-2 text-xs sm:text-sm md:text-base"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    <Link
                                        to={`/app/team/${row.original?.id as string}`}
                                        className="absolute inset-0"
                                    ></Link>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-xs sm:text-sm md:text-base"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                <span className="text-xs sm:text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
