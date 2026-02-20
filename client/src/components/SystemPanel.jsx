import React, { useEffect, useState } from 'react'
import { getAllAccounts, createInitialFunds } from '../services/api'

export default function SystemPanel() {
      const [toAccount, setToAccount] = useState('')
      const [amount, setAmount] = useState('')
      const [message, setMessage] = useState(null)
      const [recipients, setRecipients] = useState([])

      async function handleSubmit(e) {
            e.preventDefault()
            setMessage(null)
            try {
                  const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
                  const res = await createInitialFunds(toAccount, Number(amount), idempotencyKey)
                  setMessage(res?.message || 'Initial funds created')
                  // clear inputs after submit
                  setAmount('')
                  setToAccount('')
            } catch (err) {
                  setMessage(err.response?.data?.message || err.message)
            }
      }

      useEffect(() => {
            let mounted = true
            async function load() {
                  try {
                        const res = await getAllAccounts()
                        const rec = res.accounts || []
                        if (mounted) setRecipients(rec.filter(a => !a.user?.systemUser))
                  } catch (e) {/* ignore */ }
            }
            load()
            return () => mounted = false
      }, [])

      return (
            <div className="card form-card mt-4">
                  <h3 className="text-lg font-semibold mb-2">System: Create Initial Funds</h3>
                  <form className="form" onSubmit={handleSubmit}>
                        <div className="form-row">
                              <label className="text-sm text-slate-300">To (select recipient)</label>
                              {recipients.length > 0 ? (
                                    <select className="input-dark" value={toAccount} onChange={e => setToAccount(e.target.value)}>
                                          <option value="">-- select recipient account --</option>
                                          {recipients.map(r => (
                                                <option key={r._id} value={r._id}>{r.user?.name || r.user?.email || r._id} — {r._id}</option>
                                          ))}
                                    </select>
                              ) : (
                                    <input className="input-dark" placeholder="To Account ID" value={toAccount} onChange={e => setToAccount(e.target.value)} />
                              )}
                        </div>
                        <div className="form-row">
                              <label className="text-sm text-slate-300">Amount</label>
                              <input className="input-dark" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <button className="btn primary mt-2" type="submit">Create</button>
                  </form>
                  {message && <div className="message mt-2">{message}</div>}
            </div>
      )
}
