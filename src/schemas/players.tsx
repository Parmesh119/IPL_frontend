import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().min(1).default("https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png"),
  name: z.string().min(1, { message: "Name is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  age: z.number().int().positive({ message: "Age must be a positive integer" }).optional(),
  role: z.string().min(1, { message: "Role is required" }),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  teamId: z.string().optional(),
  basePrice: z.number().min(1, { message: "Base Price is required" }),
  sellPrice: z.number().nullable().optional(),
  iplTeam: z.string().min(1, { message: "IPL Team is required" }),
  status: z.enum(["Pending", "Sold", "Unsold", "Current_Bid"]),
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