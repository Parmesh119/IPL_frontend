"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Player } from "@/schemas/players"

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "srNo",
    header: "Sr No.",
    cell: ({ row }) => row.index + 1, // Dynamically calculate the serial number
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "battingStyle",
    header: "Batting Style",
  },
  {
    accessorKey: "bowlingStyle",
    header: "Bowling Style",
  },
  {
    accessorKey: "teamId",
    header: "Team",
  },
  {
    accessorKey: "basePrice",
    header: "Base Price",
  },
  {
    accessorKey: "sellPrice",
    header: "Sell Price",
  },
  {
    accessorKey: "status",
    header: "Status",
  }
]