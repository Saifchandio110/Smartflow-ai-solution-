import { useState, useRef, useEffect } from 'react'

const WA = 'https://wa.me/923273602005?text=Hi%20Asher%2C%20I%27d%20like%20to%20discuss%20a%20project.'
const HELLO = { role: 'assistant', content: 'Hi, I can answer questions about Asher’s AI automation and web development services. What are you working on?' }

export default function Chat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([HELLO])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, open])

  async function send(e) {
    e.preventDefault()
    const q = text.trim()
    if (!q || busy) return
    const next = [...msgs, { role: 'user', content: q }]
    setMsgs(next); setText(''); setBusy(true); setFailed(false)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1) })
      })
      const d = await r.json()
      if (!r.ok || !d.reply) throw new Error()
      setMsgs([...next, { role: 'assistant', content: d.reply }])
    } catch { setFailed(true) }
    setBusy(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-30">
      {open && (
        <div role="dialog" aria-label="Asher assistant" className="mb-3 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col border border-bone/30 bg-coal">
          <div className="flex items-center justify-between border-b border-bone/20 px-4 py-3">
            <span className="font-display text-xl">Ask the assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">Close</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm" aria-live="polite">
            {msgs.map((m, i) => (
              <p key={i} className={m.role === 'user' ? 'ml-8 bg-volt/90 p-3 text-white' : 'mr-8 bg-ink p-3'}>{m.content}</p>
            ))}
            {busy && <p className="text-bone/60">Typing…</p>}
            {failed && <p className="text-bone/80">The assistant isn’t available right now. <a className="text-volt underline" href={WA} target="_blank" rel="noopener noreferrer">Message Asher on WhatsApp</a>.</p>}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex border-t border-bone/20">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} aria-label="Your message" placeholder="Type your question" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-bone/40" />
            <button disabled={busy} className="bg-volt px-4 font-medium text-white disabled:opacity-50">Send</button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="ml-auto block bg-volt px-5 py-3 font-medium text-white shadow-lg hover:bg-white hover:text-ink">
        {open ? 'Hide assistant' : 'Ask the assistant'}
      </button>
    </div>
  )
}
