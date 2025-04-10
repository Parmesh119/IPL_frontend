import { z } from 'zod';

// Define the Zod schema for settings
const settingsSchema = z.object({
  maxPlayers: z
    .number()
    .min(1, { message: "Maximum players must be at least 1." })
    .max(50, { message: "Maximum players cannot exceed 50." }),
  minPlayers: z
    .number()
    .min(1, { message: "Minimum players must be at least 1." })
    .max(50, { message: "Minimum players cannot exceed 50." }),
  budgetLimit: z
    .number()
    .min(1, { message: "Budget limit must be greater than 0." }),
});

// Define the TypeScript type based on the schema
export type Settings = z.infer<typeof settingsSchema>;