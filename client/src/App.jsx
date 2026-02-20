import React, { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Accounts from './components/Accounts'
import NewTransaction from './components/NewTransaction'
import SystemPanel from './components/SystemPanel'
import TransactionHistory from './components/TransactionHistory'
import { logout, setAuthToken } from './services/api'
import { me } from './services/api'

export default function App() {
      const [view, setView] = useState('accounts')
      const [user, setUser] = useState(null)

      async function handleAuth(u, token) {
            if (token) setAuthToken(token)

            try {
                  const data = await me()
                  if (data?.user) {
                        setUser(data.user)
                        setView(data.user.systemUser ? 'system' : 'accounts')
                  } else {
                        setUser(u)
                        setView(u?.systemUser ? 'system' : 'accounts')
                  }
            } catch (err) {
                  setUser(u)
                  setView(u?.systemUser ? 'system' : 'accounts')
            }
      }


      React.useEffect(() => {
            let mounted = true
            async function loadMe() {
                  try {
                        const data = await me()
                        if (mounted && data?.user) {
                              setUser(data.user)
                              setView(data.user.systemUser ? 'system' : 'accounts')
                        }
                  } catch (e) {/* ignore */ }
            }
            loadMe()
            return () => mounted = false
      }, [])

      async function handleLogout() {
            try { await logout() } catch (e) { /* ignore */ }
            setUser(null)
            setView('login')
            setAuthToken(null)
      }

      return (
            <div className="page-bg">
                  <div className="max-w-6xl mx-auto p-6">
                        <header className="flex items-center gap-4 p-4 rounded-lg shadow-sm header-glass">
                              <div className="flex items-center gap-3">
                                    <div className="brand-mark">BS</div>
                                    <div>
                                          <div className="brand-title">Banking System</div>
                                          <div className="text-xs text-slate-400">Simple demo banking</div>
                                    </div>
                              </div>

                              <nav className="ml-auto flex items-center gap-3">
                                    <span className="text-sm text-slate-300 mr-2 hidden sm:inline">{user ? `Hello, ${user.name}` : ''}</span>
                                    <button className="btn primary" onClick={() => setView('accounts')}>Accounts</button>
                                    {user?.systemUser ? (
                                          <button className="btn ghost" onClick={() => setView('system')}>Create Funds</button>
                                    ) : (
                                          <button className="btn ghost" onClick={() => setView('new')}>New Tx</button>
                                    )}
                                    {user && <button className="btn ghost" onClick={() => setView('history')}>History</button>}
                                    {!user && <button className="btn ghost" onClick={() => setView('login')}>Login</button>}
                                    {!user && <button className="btn ghost" onClick={() => setView('register')}>Register</button>}
                                    {user && <button className="btn ghost" onClick={handleLogout}>Logout</button>}

                                    {user && (
                                          <div className="ml-2 flex items-center gap-2">
                                                <div className="badge">{(user.name || '').split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
                                          </div>
                                    )}
                              </nav>
                        </header>

                        <main className="mt-6">
                              {view === 'login' && <Login onAuth={handleAuth} />}
                              {view === 'register' && <Register onAuth={handleAuth} />}
                              {view === 'accounts' && <Accounts />}
                              {view === 'history' && <TransactionHistory />}
                              {user?.systemUser ? (
                                    view === 'system' && <SystemPanel />
                              ) : (
                                    view === 'new' && <NewTransaction />
                              )}
                        </main>

                        <button className="fab" title="New Transaction" onClick={() => setView('new')}>+</button>
                  </div>
            </div>
      )
}
