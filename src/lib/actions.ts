import axios from 'axios'
import { type TLogin, type TAuthResponse, type TRegister } from '@/schemas/auth-schema'
import { type Player } from '@/schemas/players'
import { type Team } from '@/schemas/team'

export function getBackendUrl() {
    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8080'
    return backendUrl
}
export const loginAction = async (data: TLogin): Promise<TAuthResponse> => {
    const response = await axios.post(`${getBackendUrl()}/api/auth/login`, data)
    return response.data
}

export const registerAction = async (data: TRegister): Promise<TLogin> => {
    const response = await axios.post(`${getBackendUrl()}/api/auth/register`, data)
    return response.data
}

export async function listPlayersAction(): Promise<Player[]> {
    const response = await axios.get(`${getBackendUrl()}/api/players/list`)
    return response.data;
}

export async function getTeamById(id: string): Promise<Team> {
    const response = await axios.get(`${getBackendUrl()}/api/team/get/${id}`)
    return response.data;
}