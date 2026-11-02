import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ClientChat from './ClientChat.jsx'
import './index.css'

const m = window.location.pathname.match(/^\/c\/([A-Za-z0-9_-]{43})\/?$/)
createRoot(document.getElementById('root')).render(m ? <ClientChat token={m[1]} /> : <App />)
