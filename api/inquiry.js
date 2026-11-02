// POST /api/inquiry  saves a lead + private conversation in Supabase.
// Needs env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (set in Vercel only).
import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'node:crypto'

const OPTIONS = {
  contact_method: ['WhatsApp', 'Email'],
  service: ['AI Automation', 'Web Development', 'Both'],
  budget: ['Under $500', '$500 to $1,500', '$1,500 to $5,000', '$5,000+', 'Not sure yet'],
  timeline: ['As soon as possible', '1 to 2 months', '3 months or more', 'Flexible']
}
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'not_configured' })

  const b = req.body || {}
  if (b.website) return res.status(200).json({ token: randomBytes(32).toString('base64url') }) // honeypot: pretend success

  const lead = {
    full_name: clean(b.full_name, 120),
    business_name: clean(b.business_name, 160) || null,
    email: clean(b.email, 254).toLowerCase(),
    whatsapp: clean(b.whatsapp, 40) || null,
    contact_method: clean(b.contact_method, 20),
    service: clean(b.service, 40),
    budget: clean(b.budget, 40) || null,
    description: clean(b.description, 4000),
    timeline: clean(b.timeline, 40) || null
  }
  const errors = {}
  if (lead.full_name.length < 2) errors.full_name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.email = 'Please enter a valid email.'
  if (lead.whatsapp && !/^\+?[0-9\s-]{7,20}$/.test(lead.whatsapp)) errors.whatsapp = 'Use digits with country code, like +1 555 123 4567.'
  if (!OPTIONS.contact_method.includes(lead.contact_method)) errors.contact_method = 'Choose how to reach you.'
  if (lead.contact_method === 'WhatsApp' && !lead.whatsapp) errors.whatsapp = 'Add your WhatsApp number or choose Email.'
  if (!OPTIONS.service.includes(lead.service)) errors.service = 'Choose a service.'
  if (lead.budget && !OPTIONS.budget.includes(lead.budget)) errors.budget = 'Choose a budget option.'
  if (lead.timeline && !OPTIONS.timeline.includes(lead.timeline)) errors.timeline = 'Choose a timeline option.'
  if (lead.description.length < 20) errors.description = 'Please describe your project in at least 20 characters.'
  if (Object.keys(errors).length) return res.status(400).json({ error: 'validation', fields: errors })

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  try {
    const since = new Date(Date.now() - 3600_000).toISOString()
    const { count } = await db.from('leads').select('id', { count: 'exact', head: true }).eq('email', lead.email).gte('created_at', since)
    if (count >= 3) return res.status(429).json({ error: 'too_many' })

    const { data: row, error: e1 } = await db.from('leads').insert(lead).select('id').single()
    if (e1) throw e1
    const token = randomBytes(32).toString('base64url')
    const token_hash = createHash('sha256').update(token).digest('hex')
    const { error: e2 } = await db.from('conversations').insert({ lead_id: row.id, token_hash })
    if (e2) throw e2
    return res.status(200).json({ token })
  } catch {
    return res.status(500).json({ error: 'server' })
  }
}
