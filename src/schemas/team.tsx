import { z } from "zod";

export const TeamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Team name is required" }),
  owner: z.string().min(1, { message: "Owner's name is required" }),
  coach: z.string().min(1, { message: "Coach's name is required" }),
  captain: z.string().min(1, { message: "Captain's name is required" }),
  viceCaptain: z.string().min(1, { message: "Vice-captain's name is required" }),
  spent: z.number().optional(),
  players: z.number().optional()
});

export type Team = z.infer<typeof TeamSchema>;