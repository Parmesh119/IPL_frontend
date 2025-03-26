import axios from 'axios'
import { getBackendUrl } from './actions'
import { type TUserJwtInformation } from '@/schemas/auth-schema'

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'app-accessToken',
    REFRESH_TOKEN: 'app-refreshToken',
    USER_ID: 'app-userId',
    EXP: 'app-exp',
    IAT: 'app-iat',
}

export const api = axios.create({
    baseURL: getBackendUrl(),
})

export const authService = {

    async isLoggedIn(): Promise<boolean> {
        try {
            const token = await this.getAccessToken()
            return !!token
        } catch (error) {
            console.error('Error checking if logged in:', error)
            return false
        }
    },

    decodeToken(token: string): TUserJwtInformation | null {
        if (!token) return null

        try {
            return JSON.parse(atob(token.split('.')[1]))
        } catch (error) {
            console.error('Error decoding token:', error)
            return null
        }
    },

    isTokenExpired(token: string): boolean {
        if (!token) return true // If no token is provided, consider it expired

        try {
            const payload = this.decodeToken(token) // Decode the token to extract its payload
            if (!payload || !payload.exp) return true // If no expiration (`exp`) field, consider it expired

            const expiry = payload.exp * 1000 // Convert expiration time to milliseconds
            return Date.now() > expiry // Check if the current time is past the expiration time
        } catch (error) {
            console.error('Error checking token expiration:', error)
            return true // If an error occurs, consider the token expired
        }
    },

    async getAccessToken(): Promise<string | null> {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

        // If no token or token is expired, return null
        if (!accessToken || this.isTokenExpired(accessToken)) {
            console.error('Access token is missing or expired')
            this.clearTokens() // Clear any stored tokens
            return null
        }

        return accessToken
    },

    clearTokens(): void {
        Object.values(STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key)
        })
    },

    async setTokens(tokens: { accessToken: string }): Promise<void> {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)

        // Decode access token and extract user info
        try {
            const payload = this.decodeToken(tokens.accessToken) as TUserJwtInformation
            if (!payload) throw new Error('Failed to decode token')

            // Extract and set user info
            localStorage.setItem(STORAGE_KEYS.USER_ID, payload.userId)
            localStorage.setItem(STORAGE_KEYS.EXP, payload.exp.toString())
            if (payload.iat) {
                localStorage.setItem(STORAGE_KEYS.IAT, payload.iat.toString())
            }
        } catch (error) {
            console.error('Error decoding token:', error)
        }
    }
}