import React, { useEffect, useState } from 'react'
import { createTransaction, getAccounts, getAllAccounts } from '../services/api'

export default function NewTransaction() {
      const [fromAccount, setFromAccount] = useState('')
      const [toAccount, setToAccount] = useState('')
      const [amount, setAmount] = useState('')
      const [message, setMessage] = useState(null)
      const [accounts, setAccounts] = useState([])
      const [recipients, setRecipients] = useState([])
      const [loading, setLoading] = useState(false)
      const [countdown, setCountdown] = useState(0)

      async function handleSubmit(e) {
            e.preventDefault()
            setMessage(null)
            try {
                  const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
                  setCountdown(15)
                  await createTransaction({ fromAccount, toAccount, amount: Number(amount), idempotencyKey })
                  setMessage('Transaction created')
                  // clear inputs
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
                        const res = await getAccounts()
                        const list = Array.isArray(res) ? res : (res.accounts || [])
                        if (mounted) {
                              setAccounts(list)
                              if (list.length && !fromAccount) setFromAccount(list[0]._id || list[0].id)
                        }
                        // load recipients (all accounts)
                        try {
                              const r = await getAllAccounts()
                              const rec = r.accounts || []
                              if (mounted) setRecipients(rec.filter(a => !(list.find(la => String(la._id || la.id) === String(a._id)))))
                        } catch (e) {/* ignore */ }
                  } catch (e) {/* ignore */ }
            }
            load()
            return () => mounted = false
      }, [])

      // countdown timer for the 15 second delay
      useEffect(() => {
            if (countdown <= 0) return
            const t = setInterval(() => {
                  setCountdown(c => {
                        if (c <= 1) { clearInterval(t); return 0 }
                        return c - 1
                  })
            }, 1000)
            return () => clearInterval(t)
      }, [countdown])

      return (
            <div className="card form-card">
                  <h2 className="text-2xl font-semibold mb-3">New Transaction</h2>
                  <form onSubmit={handleSubmit} className="form">
                        {accounts.length > 0 && (
                              <div className="form-row">
                                    <label className="text-sm text-slate-300">From Account</label>
                                    <select className="input-dark" value={fromAccount} onChange={e => setFromAccount(e.target.value)}>
                                          {accounts.map(a => (
                                                <option key={a._id || a.id} value={a._id || a.id}>{a.name || a.accountNumber || (a._id || a.id)}</option>
                                          ))}
                                    </select>
                              </div>)}

                        <div className="form-row">
                              <label className="text-sm text-slate-300">To (select recipient)</label>
                              {recipients.length > 0 ? (
                                    <select className="input-dark" value={toAccount} onChange={e => setToAccount(e.target.value)}>
                                          <option value="">-- select recipient account --</option>
                                          {recipients
                                                .filter(r => !r.user?.systemUser)
                                                .map(r => (
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
                        <button className="btn primary mt-2" type="submit">Send</button>
                        {countdown > 0 && <div className="text-sm text-slate-400 mt-2">Processing — completes in {countdown}s</div>}
                  </form>
                  {message && <div className="message mt-3">{message}</div>}
            </div>
      )
}

