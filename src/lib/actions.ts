import axios from 'axios'
import { type TLogin, type TAuthResponse, type TRegister, type TRefreshTokenRequest } from '@/schemas/auth-schema'
import { type Player } from '@/schemas/players'
import { type Team, type TeamDTO } from '@/schemas/team'
import { type User } from '@/schemas/users'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import { type Auction } from '@/schemas/auction'

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

export async function getUserDetails(): Promise<User> {
    const token = await authService.getAccessToken()
    if (!token) {
        toast.error('User is not authenticated')
        throw new Error('User is not authenticated')
    }

    const bearerToken = `Bearer ${token}`

    const response = await axios.post(
        `${getBackendUrl()}/api/auth/get/user`,
        {},
        { headers: { Authorization: bearerToken } }
    )
    return response.data;
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
export async function getAllTeams(): Promise<Team[]> {
    const response = await axios.get(`${getBackendUrl()}/api/team/list`)
    return response.data;
}

export async function getTeamById(id: string): Promise<TeamDTO> {
    const response = await axios.get(`${getBackendUrl()}/api/team/get/${id}`)
    return response.data;
}

export async function addTeamAction(team: Team): Promise<Team> {
    const response = await axios.post(`${getBackendUrl()}/api/team/create`, team)
    return response.data;
}

export async function updateTeamAction(team: Team): Promise<Team> {
    const response = await axios.post(`${getBackendUrl()}/api/team/update`, team)
    return response.data;
}

export async function deleteTeamAction(id: string): Promise<string> {
    const response = await axios.delete(`${getBackendUrl()}/api/team/delete/${id}`)
    return response.data;
}

// IPL Auction
export async function getPlayersForAuction(): Promise<Auction[]> {
    const response = await axios.post(`${getBackendUrl()}/api/auction/get/players`)
    return response.data;
}

export async function markPlayerSold(player: Auction): Promise<string> {
    const response = await axios.post(`${getBackendUrl()}/api/auction/mark/sold`, player)
    return response.data;
}

export async function markPlayerUnsold(player: Auction): Promise<string> {
    const response = await axios.post(`${getBackendUrl()}/api/auction/mark/unsold`, player)
    return response.data;
}