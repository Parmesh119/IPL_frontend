import { type Team } from "@/schemas/team"
import { type ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: "srNo",
    header: "Sr No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "captain",
    header: "Captain",
  },
  {
    accessorKey: "coach",
    header: "Coach",
  },
  {
    accessorKey: "players",
    header: "Players"
  },
  {
    accessorKey: "spent",
    header: "Spent",
  }
]