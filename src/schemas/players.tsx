import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  age: z.number().int().positive({ message: "Age must be a positive integer" }).optional(),
  role: z.string().min(1, { message: "Role is required" }),
  battingStyle: z.string().min(1, { message: "Batting Style is required" }),
  bowlingStyle: z.string().optional(),
  teamId: z.string().optional().default("-"),
  basePrice: z.string().min(1, { message: "Base Price is required" }),
  sellPrice: z.string().nullable().optional(),
  iplTeam: z.string().min(1, { message: "IPL Team is required" }),
  status: z.enum(["Pending", "Sold", "Unsold"]),
});

export type Player = z.infer<typeof PlayerSchema>;

export type ListUserRequest = {
  page: number
  size: number
  search?: string | null
  status?: string[] | null
  roles?: string[] | null
  iplTeam?: string[] | null
  team?: string[] | null
}