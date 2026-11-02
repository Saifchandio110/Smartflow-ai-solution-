// POST /api/client  { token, action: 'get' | 'send', body? }
// Server-side check of the private token. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { notify } from './_notify.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'server', code: 'config' })

  const { token, action, body } = req.body || {}
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return res.status(404).json({ error: 'not_found' })

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  try {
    const hash = createHash('sha256').update(token).digest('hex')
    const { data: conv, error: e0 } = await db.from('conversations')
      .select('id, leads(full_name, service, status, description, created_at)').eq('token_hash', hash).maybeSingle()
    if (e0) throw e0
    if (!conv) return res.status(404).json({ error: 'not_found' })

    if (action === 'send') {
      const text = typeof body === 'string' ? body.trim().slice(0, 2000) : ''
      if (!text) return res.status(400).json({ error: 'empty' })
      const since = new Date(Date.now() - 60_000).toISOString()
      const { count } = await db.from('messages').select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id).eq('sender', 'client').gte('created_at', since)
      if (count >= 8) return res.status(429).json({ error: 'slow_down' })
      const quiet = new Date(Date.now() - 120_000).toISOString()
      const { count: recent } = await db.from('messages').select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id).eq('sender', 'client').gte('created_at', quiet)
      const { error: e1 } = await db.from('messages').insert({ conversation_id: conv.id, sender: 'client', body: text })
      if (e1) throw e1
      if (recent === 0) await notify('New client message', 'A client sent a message. Open admin to reply.', `https://${req.headers.host}/admin`)
    }

    const { data: msgs, error: e2 } = await db.from('messages')
      .select('id, sender, body, created_at, read_at').eq('conversation_id', conv.id).order('created_at').limit(500)
    if (e2) throw e2
    const unread = msgs.filter((m) => m.sender === 'admin' && !m.read_at).map((m) => m.id)
    if (unread.length) await db.from('messages').update({ read_at: new Date().toISOString() }).in('id', unread)

    const lead = conv.leads
    return res.status(200).json({
      lead: { name: lead.full_name, service: lead.service, status: lead.status, request: lead.description, created_at: lead.created_at },
      messages: msgs.map((m) => ({ id: m.id, sender: m.sender, body: m.body, created_at: m.created_at, isNew: unread.includes(m.id) }))
    })
  } catch (e) {
    return res.status(500).json({ error: 'server', code: String(e?.code || 'unknown').slice(0, 40) })
  }
}
