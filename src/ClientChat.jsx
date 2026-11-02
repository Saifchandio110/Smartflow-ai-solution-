import { useState, useEffect, useRef, useCallback } from 'react'

const STATUS = { new: 'Received', contacted: 'Contacted', in_discussion: 'In discussion', accepted: 'Accepted', rejected: 'Closed', completed: 'Completed' }
const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export default function ClientChat({ token }) {
  const [data, setData] = useState(null)
  const [state, setState] = useState('loading') // loading | ok | invalid | error
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const end = useRef(null)
  const count = useRef(0)

  const call = useCallback(async (action, body) => {
    const r = await fetch('/api/client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action, body }) })
    if (r.status === 404) { setState('invalid'); return null }
    const d = await r.json()
    if (!r.ok) throw Object.assign(new Error(d.error), { kind: d.error })
    return d
  }, [token])

  useEffect(() => {
    document.title = 'Your conversation | Asher'
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m)
    let alive = true
    const load = async () => {
      if (document.hidden) return
      try { const d = await call('get'); if (alive && d) { setData(d); setState('ok') } }
      catch { if (alive && !data) setState('error') }
    }
    load()
    const t = setInterval(load, 5000)
    return () => { alive = false; clearInterval(t); m.remove() }
  }, [call])

  useEffect(() => {
    const n = data?.messages.length || 0
    if (n > count.current) end.current?.scrollIntoView({ block: 'end' })
    count.current = n
  }, [data])

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true); setNote('')
    try { const d = await call('send', text); if (d) { setData(d); setText('') } }
    catch (err) { setNote(err.kind === 'slow_down' ? 'Please wait a moment before sending more.' : 'Message not sent. Please try again.') }
    setBusy(false)
  }

  if (state === 'loading') return <p className="p-8">Loading your conversation…</p>
  if (state === 'invalid') return <p className="p-8">This link is not valid. Please check you copied the full link, or message Asher on WhatsApp.</p>
  if (state === 'error') return <p className="p-8">We could not load your conversation. Please refresh in a moment.</p>

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-8">
      <header className="border-b border-bone/20 pb-5">
        <p className="font-display text-2xl">Asher</p>
        <h1 className="mt-4 font-display text-4xl">Hi {data.lead.name.split(' ')[0]}</h1>
        <p className="mt-2 text-bone/70">{data.lead.service} <span aria-hidden="true">·</span> Status: <span className="text-volt">{STATUS[data.lead.status] || data.lead.status}</span></p>
        <p className="mt-3 text-sm text-bone/60">Bookmark this page. This private link is the only way back to your conversation.</p>
      </header>
      <section className="mt-5 border border-bone/20 p-4 text-sm">
        <p className="text-bone/60">Your original request, {fmt(data.lead.created_at)}</p>
        <p className="mt-2 whitespace-pre-wrap">{data.lead.request}</p>
      </section>
      <div className="mt-5 flex-1 space-y-3" aria-live="polite">
        {data.messages.length === 0 && <p className="text-bone/60">No messages yet. Asher will reply here.</p>}
        {data.messages.map((m) => (
          <div key={m.id} className={m.sender === 'client' ? 'ml-10' : 'mr-10'}>
            <p className={`whitespace-pre-wrap p-3 ${m.sender === 'client' ? 'bg-volt/90 text-white' : 'bg-coal'}`}>{m.body}</p>
            <p className="mt-1 text-xs text-bone/50">{m.sender === 'client' ? 'You' : 'Asher'} · {fmt(m.created_at)}{m.isNew && <span className="ml-2 text-volt">New</span>}</p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="sticky bottom-0 mt-5 bg-ink pb-4 pt-2">
        <label htmlFor="msg" className="sr-only">Your message</label>
        <textarea id="msg" rows="3" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-bone/30 bg-transparent p-3 text-base outline-none focus:border-volt" placeholder="Write a message" />
        <div className="mt-2 flex items-center gap-4">
          <button disabled={busy} className="bg-volt px-6 py-3 font-medium text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send'}</button>
          {note && <p role="alert" className="text-[#ff8a8a]">{note}</p>}
        </div>
      </form>
    </main>
  )
}
