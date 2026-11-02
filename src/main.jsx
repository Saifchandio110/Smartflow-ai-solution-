import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ClientChat from './ClientChat.jsx'
import './index.css'

const Admin = lazy(() => import('./admin/Admin.jsx'))
const path = window.location.pathname
const m = path.match(/^\/c\/([A-Za-z0-9_-]{43})\/?$/)
const isAdmin = /^\/admin\/?$/.test(path)
createRoot(document.getElementById('root')).render(
  isAdmin ? <Suspense fallback={null}><Admin /></Suspense> : m ? <ClientChat token={m[1]} /> : <App />
)
