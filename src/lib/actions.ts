import axios from 'axios'
import { type TLogin, type TAuthResponse, type TRegister } from '@/schemas/auth-schema'
import { type Payment } from '@/components/players/columns'

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

export async function listPlayersAction(): Promise<Payment[]> {
    alert("sending")
    const response = await axios.get("/api/players/list") // Ensure this endpoint matches your backend
    return response.data
}