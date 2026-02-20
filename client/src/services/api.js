import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const http = axios.create({ baseURL: API_BASE, withCredentials: true })

export async function getAccounts() {
      const res = await http.get('/api/accounts')
      const data = res.data
      // normalize response: backend returns { account } for single account
      if (Array.isArray(data)) return data
      if (data.accounts) return data.accounts
      if (data.account) return [data.account]
      return data
}

export async function me() {
      const res = await http.get('/api/auth/me')
      return res.data
}

export async function getAllAccounts() {
      const res = await http.get('/api/accounts/all')
      return res.data
}

export async function createInitialFunds(toAccount, amount, idempotencyKey) {
      const res = await http.post('/api/transactions/system/initial-funds', { toAccount, amount, idempotencyKey })
      return res.data
}

export async function register(user) {
      const res = await http.post('/api/auth/register', user)
      return res.data
}

export async function login(credentials) {
      const res = await http.post('/api/auth/login', credentials)
      return res.data
}

export async function logout() {
      const res = await http.post('/api/auth/logout')
      return res.data
}

export async function createTransaction(tx) {
      const res = await http.post('/api/transactions', tx)
      return res.data
}

export async function getTransactionHistory() {
      const res = await http.get('/api/transactions/history')
      return res.data
}

export async function createAccount() {
      const res = await http.post('/api/accounts')
      return res.data
}

export function setAuthToken(token) {
      if (token) {
            http.defaults.headers.common['Authorization'] = `Bearer ${token}`
            // optionally persist for page reloads
            localStorage.setItem('auth_token', token)
      } else {
            delete http.defaults.headers.common['Authorization']
            localStorage.removeItem('auth_token')
      }
}

// restore token from localStorage on load
const saved = localStorage.getItem('auth_token')
if (saved) setAuthToken(saved)

export default http
