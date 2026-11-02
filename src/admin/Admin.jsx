import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['in_discussion', 'In discussion'], ['accepted', 'Accepted'], ['rejected', 'Rejected'], ['completed', 'Completed']]
const label = (s) => (STATUSES.find((x) => x[0] === s) || [s, s])[1]
const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
const box = 'border border-white/15 bg-[#14171d]'
const inp = 'w-full border border-white/20 bg-transparent px-3 py-2 text-base outline-none focus:border-[#3D6BFF]'

function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr('Sign-in failed. Check your email and password.')
    setBusy(false)
  }
  return (
    <form onSubmit={go} className={`mx-auto mt-24 max-w-sm space-y-4 p-6 ${box}`}>
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <label className="block text-sm">Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 ${inp}`} /></label>
      <label className="block text-sm">Password<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`mt-1 ${inp}`} /></label>
      {err && <p role="alert" className="text-sm text-[#ff8a8a]">{err}</p>}
      <button disabled={busy} className="w-full bg-[#3D6BFF] py-2 font-medium disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

function Dashboard() {
  const [leads, setLeads] = useState([]); const [convs, setConvs] = useState([]); const [unread, setUnread] = useState([])
  const [sel, setSel] = useState(null); const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const [err, setErr] = useState('')
  const end = useRef(null)
  const conv = sel && convs.find((c) => c.lead_id === sel)

  const loadAll = useCallback(async () => {
    const [l, c, u] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('conversations').select('id, lead_id'),
      supabase.from('messages').select('id, conversation_id').eq('sender', 'client').is('read_at', null)
    ])
    if (l.data) setLeads(l.data); if (c.data) setConvs(c.data); if (u.data) setUnread(u.data)
  }, [])

  const loadMsgs = useCallback(async () => {
    if (!conv) { setMsgs([]); return }
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at')
    if (data) setMsgs(data)
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conv.id).eq('sender', 'client').is('read_at', null)
  }, [conv?.id])

  useEffect(() => { loadAll(); const t = setInterval(() => !document.hidden && loadAll(), 5000); return () => clearInterval(t) }, [loadAll])
  useEffect(() => { loadMsgs(); const t = setInterval(() => !document.hidden && loadMsgs(), 5000); return () => clearInterval(t) }, [loadMsgs])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs.length])

  async function send(e) {
    e.preventDefault()
    const body = text.trim(); if (!body || !conv) return
    setErr('')
    const { error } = await supabase.from('messages').insert({ conversation_id: conv.id, sender: 'admin', body })
    if (error) { setErr('Message not sent.'); return }
    setText(''); loadMsgs()
  }
  async function setStatus(id, status) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id)
    if (error) setErr('Status not saved.'); else loadAll()
  }

  const count = (s) => leads.filter((x) => x.status === s).length
  const stats = [['Total leads', leads.length], ['New', count('new')], ['Pending', count('contacted') + count('in_discussion')], ['Active', count('accepted')], ['Completed', count('completed')], ['Unread', unread.length]]
  const unreadFor = (leadId) => { const c = convs.find((x) => x.lead_id === leadId); return c ? unread.filter((u) => u.conversation_id === c.id).length : 0 }
  const lead = leads.find((l) => l.id === sel)

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <header className="flex items-center justify-between border-b border-white/15 pb-3">
        <h1 className="font-semibold">Asher admin</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm underline">Sign out</button>
      </header>
      <section className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6" aria-label="Overview">
        {stats.map(([k, v]) => <div key={k} className={`p-3 ${box}`}><p className="text-2xl font-semibold">{v}</p><p className="text-xs text-white/60">{k}</p></div>)}
      </section>
      {err && <p role="alert" className="mt-3 text-sm text-[#ff8a8a]">{err}</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-12">
        <ul className={`md:col-span-4 ${sel ? 'hidden md:block' : ''}`} aria-label="Leads">
          {leads.length === 0 && <li className="p-3 text-sm text-white/60">No leads yet.</li>}
          {leads.map((l) => (
            <li key={l.id}>
              <button onClick={() => setSel(l.id)} className={`mb-2 block w-full p-3 text-left ${box} ${l.id === sel ? 'border-[#3D6BFF]' : ''}`}>
                <span className="flex justify-between"><span className="font-medium">{l.full_name}</span>{unreadFor(l.id) > 0 && <span className="bg-[#3D6BFF] px-2 text-xs">{unreadFor(l.id)} new</span>}</span>
                <span className="block text-sm text-white/60">{l.service} · {label(l.status)}</span>
                <span className="block text-xs text-white/40">{fmt(l.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>
        <section className={`md:col-span-8 ${!sel ? 'hidden md:block' : ''}`} aria-label="Lead detail">
          {!lead ? <p className="p-3 text-sm text-white/60">Select a lead.</p> : (
            <div className="space-y-3">
              <button onClick={() => setSel(null)} className="text-sm underline md:hidden">Back to leads</button>
              <div className={`p-4 text-sm ${box}`}>
                <p className="text-lg font-semibold">{lead.full_name}{lead.business_name ? `, ${lead.business_name}` : ''}</p>
                <p className="mt-1"><a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a>
                  {lead.whatsapp && <> · <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}>{lead.whatsapp}</a></>}</p>
                <p className="mt-1 text-white/60">Prefers {lead.contact_method} · {lead.service} · Budget: {lead.budget || 'not given'} · Timeline: {lead.timeline || 'not given'}</p>
                <p className="mt-3 whitespace-pre-wrap">{lead.description}</p>
                <label className="mt-3 block">Status
                  <select value={lead.status} onChange={(e) => setStatus(lead.id, e.target.value)} className={`mt-1 ${inp}`}>
                    {STATUSES.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
                  </select>
                </label>
              </div>
              <div className={`max-h-96 space-y-2 overflow-y-auto p-3 ${box}`} aria-live="polite">
                {msgs.length === 0 && <p className="text-sm text-white/60">No messages yet.</p>}
                {msgs.map((m) => (
                  <div key={m.id} className={m.sender === 'admin' ? 'ml-8' : 'mr-8'}>
                    <p className={`whitespace-pre-wrap p-2 text-sm ${m.sender === 'admin' ? 'bg-[#3D6BFF]' : 'bg-white/10'}`}>{m.body}</p>
                    <p className="text-xs text-white/40">{m.sender === 'admin' ? 'You' : lead.full_name} · {fmt(m.created_at)}{m.sender === 'admin' && m.read_at ? ' · read' : ''}</p>
                  </div>
                ))}
                <div ref={end} />
              </div>
              <form onSubmit={send} className="flex gap-2">
                <label htmlFor="reply" className="sr-only">Reply</label>
                <textarea id="reply" rows="2" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} className={inp} placeholder="Write a reply" />
                <button className="bg-[#3D6BFF] px-4 font-medium">Send</button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(undefined); const [ok, setOk] = useState(null)
  useEffect(() => {
    document.title = 'Admin'
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m)
    if (!supabase) return () => m.remove()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => { sub.subscription.unsubscribe(); m.remove() }
  }, [])
  useEffect(() => {
    setOk(null)
    if (session) supabase.from('admin_profiles').select('user_id').then(({ data }) => setOk(!!data?.length))
  }, [session?.user?.id])

  return (
    <div className="min-h-screen bg-[#0d0f13] font-body text-white">
      {!supabase ? <p className="p-6">Admin is not configured yet (missing public Supabase settings).</p>
        : session === undefined ? <p className="p-6">Loading…</p>
        : !session ? <Login />
        : ok === null ? <p className="p-6">Checking access…</p>
        : !ok ? <div className="p-6"><p>This account is not an admin.</p><button onClick={() => supabase.auth.signOut()} className="mt-3 underline">Sign out</button></div>
        : <Dashboard />}
    </div>
  )
}
