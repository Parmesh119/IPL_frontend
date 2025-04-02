import { z } from "zod";

export const TeamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Team name is required" }),
  owner: z.string().min(1, { message: "Owner's name is required" }),
  coach: z.string().min(1, { message: "Coach's name is required" }),
  captain: z.string().optional(),
  viceCaptain: z.string().optional(),
  spent: z.number().optional(),
  players: z.number().optional()
});

const PlayerDTOSchema = z.object({
  srNo: z.number().default(0),
  player: z.string().default(""),
  iplTeam: z.string().default(""),
  role: z.string().default(""),
  price: z.number().default(0.0)
});


export const TeamDTOSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  owner: z.string(),
  coach: z.string(),
  captain: z.string(),
  viceCaptain: z.string(),
  players: z.number().int(),
  spent: z.number(),
  batsmenCount: z.number().int(),
  bowlersCount: z.number().int(),
  allRoundersCount: z.number().int(),
  createdAt: z.number(),
  updatedAt: z.number(),
  playersBought: z.array(PlayerDTOSchema).optional(),
});



// TypeScript type inference
export type TeamDTO = z.infer<typeof TeamDTOSchema>;

export type Team = z.infer<typeof TeamSchema>;