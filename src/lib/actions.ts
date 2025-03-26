import  axios from 'axios'
import { type TLogin, type TAuthResponse } from '@/schemas/auth-schema'

export function getBackendUrl() {
    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8080'
    return backendUrl
}
export const loginAction = async (data: TLogin): Promise<TAuthResponse> => {
    const response = await axios.post(`${getBackendUrl()}/api/auth/login`, data)
    return response.data
}