"use client"

import { type ColumnDef } from "@tanstack/react-table"

export type Payment = {
  srNo: number
  name: string
  country: string
  age: number
  role: string
  battingStyle: string
  bowlingStyle: string
  team: string
  basePrice: string
  sellPrice?: string |  null
  status: "Pending" | "Sold" | "Unsold"
}

export const columns: ColumnDef<Payment>[] = [
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
    accessorKey: "team",
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