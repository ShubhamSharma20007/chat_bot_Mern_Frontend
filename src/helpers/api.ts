//   API
const API_PATH = `${import.meta.env.VITE_BACKEND_URL}/${import.meta.env.VITE_API_PREFIX}/${import.meta.env.VITE_API_VERSION}`;



// User API
export const LOGIN = `${API_PATH}/auth/login`
export const REGISTER = `${API_PATH}/auth/register`
export const AUTH_STATUS = `${API_PATH}/auth/auth-status`
export const AUTH_LOGOUT = `${API_PATH}/auth/logout`


// Chat
export const CHATS = `${API_PATH}/chat/new`
export const CHATS_GET = `${API_PATH}/chat/get-chats`
export const CHATS_DELETE = `${API_PATH}/chat/delete-chats`
export const CHAT_TAB_CREATE = `${API_PATH}/chat/new-tab`
export const CHAT_GET_TABS = `${API_PATH}/chat/get-tabs`
export const CHAT_NEW_START = `${API_PATH}/chat/new-chat-start`
export const CHAT_CONVERT_CODE = `${API_PATH}/chat/convert-html`
export const CHAT_DUPLICATE = `${API_PATH}/chat/duplicate-chat`