import React, { useEffect, useState } from 'react'
import { getTransactionHistory } from '../services/api'

export default function TransactionHistory() {
      const [txs, setTxs] = useState([])
      const [loading, setLoading] = useState(true)

      useEffect(() => {
            let mounted = true
            async function load() {
                  try {
                        const res = await getTransactionHistory()
                        if (mounted) setTxs(res.transactions || [])
                  } catch (e) {/* ignore */ }
                  finally { if (mounted) setLoading(false) }
            }
            load()
            return () => mounted = false
      }, [])

      if (loading) return <div className="card">Loading transactions...</div>

      return (
            <div className="card">
                  <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
                  {txs.length === 0 && <div className="text-sm text-slate-400">No transactions yet</div>}
                  <ul className="space-y-3">
                        {txs.map(t => {
                              const isCredit = Number(t.amount) > 0
                              return (
                                    <li key={t._id} className="p-3 rounded-md bg-slate-800/50 flex justify-between items-center">
                                          <div>
                                                <div className="text-sm">{t.fromAccount?.user?.name || t.fromAccount?._id} → {t.toAccount?.user?.name || t.toAccount?._id}</div>
                                                <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
                                          </div>
                                          <div className="text-right">
                                                <div className={`${isCredit ? 'text-emerald-400' : 'text-rose-400'} font-semibold`}>₹ {t.amount}</div>
                                                <div className="text-xs text-slate-400"><span className="badge">{t.status}</span></div>
                                          </div>
                                    </li>
                              )
                        })}
                  </ul>
            </div>
      )
}
