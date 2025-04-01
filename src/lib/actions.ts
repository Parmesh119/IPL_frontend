import axios from 'axios'
import { type TLogin, type TAuthResponse, type TRegister, type TRefreshTokenRequest } from '@/schemas/auth-schema'
import { type Player } from '@/schemas/players'
import { type Team } from '@/schemas/team'
import { type User } from '@/schemas/users'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'

export function getBackendUrl() {
    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8080'
    return backendUrl
}

// Authentication actions
export const loginAction = async (data: TLogin): Promise<TAuthResponse> => {
    const response = await axios.post(`${getBackendUrl()}/api/auth/login`, data)
    return response.data
}

export const registerAction = async (data: TRegister): Promise<TLogin> => {
    const response = await axios.post(`${getBackendUrl()}/api/auth/register`, data)
    return response.data
}

export const refreshTokenAction = async (data: TRefreshTokenRequest): Promise<TAuthResponse> => {
    const response = await axios.post(`${getBackendUrl()}/api/auth/refresh-token`, data)
    return response.data
  }

// Player actions
export async function listPlayersAction(): Promise<Player[]> {
    const response = await axios.get(`${getBackendUrl()}/api/players/list`)
    return response.data;
}

export async function getPlayerById(id: string): Promise<Player> {
    const response = await axios.get(`${getBackendUrl()}/api/players/get/${id}`)
    return response.data;
}

export async function addPlayerAction(player: Player): Promise<Player> {
    const response = await axios.post(`${getBackendUrl()}/api/players/create`, player)
    return response.data;
}

export async function updatePlayerAction(player: Player): Promise<Player> {
    const response = await axios.post(`${getBackendUrl()}/api/players/update`, player)
    return response.data;
}

export async function deletePlayerAction(id: string): Promise<string> {
    const response = await axios.delete(`${getBackendUrl()}/api/players/delete/${id}`)
    return response.data;
}

// Team actions
export async function getTeamById(id: string): Promise<Team> {
    const response = await axios.get(`${getBackendUrl()}/api/team/get/${id}`)
    return response.data;
}

export async function getAllTeams(): Promise<Team[]> {
    const response = await axios.get(`${getBackendUrl()}/api/team/list`)
    return response.data;
}

export async function getUserDetails(): Promise<User> {
    const token = await authService.getAccessToken()
    if (!token) {
        toast.error('User is not authenticated')
        throw new Error('User is not authenticated')
    }

    const bearerToken = `Bearer ${token}`
    
    // Fix: Pass headers as a separate configuration object, not in the request body
    const response = await axios.post(
        `${getBackendUrl()}/api/auth/get/user`, 
        {}, // Empty request body (or add any data you need to send here)
        { headers: { Authorization: bearerToken } } // Headers as the third parameter
    )
    return response.data;
}