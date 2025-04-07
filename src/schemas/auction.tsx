import { z } from "zod";

export const AuctionSchema = z.object({
    playerId: z.string().min(1),
    name: z.string().min(1),
    basePrice: z.number().min(0),
    status: z.string().min(1),
    country: z.string().min(1),
    role: z.string().min(1),
    iplTeam: z.string().min(1).optional(),
    sellPrice: z.string().optional(),
    teamId: z.string().optional(),
});

export type Auction = z.infer<typeof AuctionSchema>;
