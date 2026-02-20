import React, { useEffect, useState } from 'react'
import { getAccounts, createAccount } from '../services/api'

export default function Accounts() {
      const [accounts, setAccounts] = useState([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)

      useEffect(() => {
            let mounted = true
            async function load() {
                  try {
                        const res = await getAccounts()
                        if (mounted) setAccounts(Array.isArray(res) ? res : (res.accounts || []))
                  } catch (err) {
                        setError(err.response?.data?.message || err.message)
                  } finally {
                        if (mounted) setLoading(false)
                  }
            }
            load()
            return () => mounted = false
      }, [])

      async function handleCreate() {
            setLoading(true)
            try {
                  await createAccount()
                  const res = await getAccounts()
                  setAccounts(Array.isArray(res) ? res : (res.accounts || []))
            } catch (err) {
                  setError(err.response?.data?.message || err.message)
            } finally {
                  setLoading(false)
            }
      }

      if (loading) return <div>Loading accounts...</div>
      if (error) return <div className="error">{error}</div>

      return (
            <div>
                  <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-3">Your Accounts</h2>
                        <div>
                              <button className="btn primary" onClick={handleCreate}>Create Account</button>
                        </div>
                  </div>

                  <div className="cards">
                        {accounts.map(a => (
                              <div key={a._id || a.id} className="card flex items-stretch">
                                    <div className="accent-strip" />
                                    <div className="p-4 flex-1">
                                          <div className="flex items-center justify-between">
                                                <div>
                                                      <div className="account-title">{a.name || a.accountNumber}</div>
                                                      <div className="text-sm text-slate-400">Account ID: {(a._id || a.id).slice ? (a._id || a.id).slice(0, 8) : (a._id || a.id)}</div>
                                                </div>
                                                <div className="text-right">
                                                      <div className="account-balance">₹ {a.balance ?? '0.00'}</div>
                                                      <div className="text-xs text-slate-400">{a.currency || 'INR'}</div>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        ))}
                  </div>
            </div>
      )
}
