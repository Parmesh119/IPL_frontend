import { z } from "zod";

export const AuctionSchema = z.object({
    playerId: z.string().min(1),
    name: z.string().min(1),
    image_url: z.string().min(1).default("https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png"),
    basePrice: z.number().min(0),
    status: z.string().min(1),
    country: z.string().min(1),
    role: z.string().min(1),
    iplTeam: z.string().min(1).optional(),
    sellPrice: z.number().optional(),
    player: z.number().optional(),
    teamId: z.string().optional(),
});

export type Auction = z.infer<typeof AuctionSchema>;
