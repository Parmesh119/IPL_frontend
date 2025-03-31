import { z } from "zod";

export const user = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type User = z.infer<typeof user>;