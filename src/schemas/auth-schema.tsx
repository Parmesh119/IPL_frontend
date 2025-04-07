"use client"

import { z } from "zod"

const roleEnum = z.enum(["ADMIN", "USER"]);

export const register_schema = z.object({
    username: z
        .string({ required_error: "Username is required!!" })
        .trim()
        .min(3, { message: "Username needs to be minimum three letters!" })
        .max(20, { message: "Username needs to be maximum twenty letters!" })
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "The username must contain only letters, numbers and underscore (_)",
        ),

    name: z
        .string({ required_error: "Name is required!!" })
        .min(3, { message: "Name needs to be minimum three letters!" })
        .max(20, { message: "Name needs to be maximum twenty letters!" }),

    password: z
        .string({ required_error: "Password is required." })
        .min(8, "Password must not be lesser than 3 characters")
        .max(16, "Password must not be greater than 16 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one digit")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        
        role: z.array(roleEnum).default(["USER"])
})

export const login_schema = z.object({
    username: z
        .string({ required_error: "Username is required!!" })
        .trim()
        .min(3, { message: "Username needs to be minimum three letters!" })
        .max(20, { message: "Username needs to be maximum twenty letters!" })
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "The username must contain only letters, numbers and underscore (_)",
        ),

    password: z
        .string({ required_error: "Password is required." })
        .min(8, "Password must not be lesser than 3 characters")
        .max(16, "Password must not be greater than 16 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one digit")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export type TLogin = z.infer<typeof login_schema>
export type TRegister = z.infer<typeof register_schema>

export type TAuthResponse = {
    accessToken: string
    refreshToken: string
}

export type TUserJwtInformation = {
    sub: string
    userId: string
    iat: number
    exp: number
}

export type TRefreshTokenRequest = {
    refreshToken: string
  }

