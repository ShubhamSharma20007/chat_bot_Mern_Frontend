import axios from "axios"

export const Instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
})