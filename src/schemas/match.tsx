import { z } from "zod";

export const matchSchema = z.object({
  id: z.string(),
  team1: z.string(),
  team2: z.string(),
  date: z.string(),   // You can use z.string().regex(...) for date validation
  day: z.string(),
  time: z.string(),   // Optionally use z.string().regex(...) for time format
  venue: z.string()
});

// TypeScript type (optional)
export type Match = z.infer<typeof matchSchema>;

export type ListMatchRequest = {
    page: number
    size: number
    search?: string | null
    type?: string | null
}