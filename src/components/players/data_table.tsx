// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
//   useReactTable,
//   type ColumnFiltersState,
//   getFilteredRowModel,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useQuery } from "@tanstack/react-query";
// import { getAllTeams } from "@/lib/actions";
// import { type Player } from "@/schemas/players";
// import { Link } from "@tanstack/react-router";
// import AddPlayerDialog from "@/components/players/AddPlayerDialog";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { addPlayerAction } from "@/lib/actions";
// import { toast } from "sonner";

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
// }

// export function DataTable<TData extends { id: string }, TValue>({
//   columns,
//   data,
// }: DataTableProps<TData, TValue>) {

//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [open, setOpen] = useState(false); // State for AddPlayerDialog visibility
//   const [newPlayer, setNewPlayer] = useState<Player>({
//     name: "",
//     country: "",
//     age: undefined,
//     role: "",
//     battingStyle: "",
//     bowlingStyle: "",
//     teamId: "",
//     basePrice: 0.0,
//     sellPrice: 0.0,
//     iplTeam: "",
//     status: "Pending",
//   });

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     state: {
//       columnFilters,
//     },

//     filterFns: {
//       arrIncludesSome: (row, columnId, filterValue) => {
//         if (!filterValue || filterValue.length === 0) return true;
//         const value = row.getValue(columnId);

//         return Array.isArray(filterValue) && filterValue.includes(value);
//       },
//     },
//   });

//   const roles = ["Batsman", "Bowler", "Wicketkeeper", "All-rounder"];
//   const battingStyles = ["Right-handed", "Left-handed"];
//   const bowlingStyles = ["Fast", "Spin", "Medium"];
//   const IPL_TEAMS = [
//     "Chennai Super Kings",
//     "Mumbai Indians",
//     "Royal Challengers Bangalore",
//     "Kolkata Knight Riders",
//     "Rajasthan Royals",
//     "Delhi Capitals",
//     "Sunrisers Hyderabad",
//     "Punjab Kings",
//     "Lucknow Super Giants",
//     "Gujarat Titans",
//   ];

//   const { data: teams, isLoading: isLoadingTeams, error: errorTeams } = useQuery({
//     queryKey: ["teams"],
//     queryFn: async () => {
//       const teamsData = await getAllTeams();

//       return Array.isArray(teamsData) ? teamsData : [];
//     },
//   });

//   const queryClient = useQueryClient(); // Get query client instance

//   const { mutate: addPlayer } = useMutation({
//     mutationFn: async (player: Player) => {
//       const data = await addPlayerAction(player);

//       if (!data) {
//         throw new Error("Failed to add player");
//       }
//       return data;
//     },
//     onSuccess: () => {
//       toast.success("Player added successfully");
//       queryClient.invalidateQueries({ queryKey: ["players"] });

//       setOpen(false);

//       handleCancelAdd();
//     },
//     onError: (error) => {
//       console.error("Error adding player:", error);

//       toast.error(`Error adding player: ${error.message || "Unknown error"}`);
//     },
//   });

//   const handleAddPlayerSubmit = () => {
//     addPlayer(newPlayer);
//   };

//   const handleCancelAdd = () => {
//     setOpen(false);
//     setNewPlayer({
//       name: "",
//       country: "",
//       age: undefined,
//       role: "",
//       battingStyle: "",
//       bowlingStyle: "",
//       teamId: "",
//       basePrice: 0.0,
//       sellPrice: 0.0,
//       iplTeam: "",
//       status: "Pending",
//     });
//   };

//   if (isLoadingTeams) {
//     return <div className="flex items-center justify-center m-auto">Loading team data...</div>;
//   }
//   if (errorTeams) {
//     console.error("Error fetching teams:", errorTeams);
//     return (
//       <div className="flex items-center justify-center m-auto text-red-600">
//         Error fetching teams data. Please try again later.
//       </div>
//     );
//   }

//   const safeTeams = Array.isArray(teams) ? teams : [];

//   return (
//     <div className="w-full px-2 sm:px-4 tracking-wider">
//       <div className="flex flex-col sm:flex-row items-center py-4 justify-between gap-4">
//         <AddPlayerDialog
//           open={open}
//           setOpen={setOpen}
//           newPlayer={newPlayer}
//           setNewPlayer={setNewPlayer}
//           teams={safeTeams ?? []}
//           roles={roles}
//           IPL_TEAMS={IPL_TEAMS}
//           battingStyles={battingStyles}
//           bowlingStyles={bowlingStyles}
//           handleAddPlayer={handleAddPlayerSubmit}
//           handleCancelAdd={handleCancelAdd}
//         />
//       </div>

//       <div className="rounded-md border mt-4 overflow-x-auto">
//         <Table className="min-w-full">
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id} className="bg-gray-100 dark:bg-gray-800">
//                 {headerGroup.headers.map((header) => (
//                   <TableHead
//                     key={header.id}
//                     className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-muted-foreground"
//                     style={{ whiteSpace: "nowrap" }}
//                   >
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(header.column.columnDef.header, header.getContext())}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                   className="cursor-pointer relative hover:bg-gray-100 dark:hover:bg-gray-700 transition"
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell
//                       key={cell.id}
//                       className="px-4 py-3 text-xs sm:text-sm md:text-base"
//                       style={{ whiteSpace: "nowrap" }}
//                     >
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </TableCell>
//                   ))}
//                   <Link
//                     to={`/app/players/$playerId`}
//                     params={{ playerId: row.original.id as string }}
//                     className="absolute inset-0 z-10"
//                     aria-label={`View player ${row.original.name}`}
//                   ></Link>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center text-xs sm:text-sm md:text-base"
//                 >
//                   No results found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
//         <span className="text-xs sm:text-sm text-muted-foreground">
//           Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
//         </span>
//         <div className="flex space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="cursor-pointer"
//           >
//             Previous
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="cursor-pointer"
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }