import React, { useState } from 'react'
import { login } from '../services/api'

export default function Login({ onAuth }) {
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const [error, setError] = useState(null)

      async function handleSubmit(e) {
            e.preventDefault()
            setError(null)
            try {
                  const data = await login({ email, password })
                  onAuth(data.user, data.token)
            } catch (err) {
                  setError(err.response?.data?.message || err.message)
            }
      }

      return (
            <div className="card auth-card">
                  <h2 className="text-2xl font-semibold mb-3">Login</h2>
                  <form onSubmit={handleSubmit} className="form">
                        <div className="form-row">
                              <label className="text-sm text-slate-300">Email</label>
                              <input className="input-dark" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="form-row">
                              <label className="text-sm text-slate-300">Password</label>
                              <input className="input-dark" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <button className="btn primary mt-2" type="submit">Login</button>
                  </form>
                  {error && <div className="error">{error}</div>}
            </div>
      )
}
