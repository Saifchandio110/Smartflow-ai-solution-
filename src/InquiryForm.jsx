import { useState } from 'react'

const OPT = {
  contact_method: ['WhatsApp', 'Email'],
  service: ['AI Automation', 'Web Development', 'Both'],
  budget: ['Under $500', '$500 to $1,500', '$1,500 to $5,000', '$5,000+', 'Not sure yet'],
  timeline: ['As soon as possible', '1 to 2 months', '3 months or more', 'Flexible']
}
const EMPTY = { full_name: '', business_name: '', email: '', whatsapp: '', contact_method: '', service: '', budget: '', timeline: '', description: '', website: '' }
const input = 'mt-2 w-full border border-bone/30 bg-transparent px-4 py-3 text-base outline-none focus:border-volt'

function Field({ label, name, form, set, errors, children, hint }) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}</label>
      {hint && <p className="text-sm text-bone/60">{hint}</p>}
      {children || <input id={name} value={form[name]} onChange={(e) => set(name, e.target.value)} className={input} aria-invalid={!!errors[name]} />}
      {errors[name] && <p role="alert" className="mt-1 text-sm text-[#ff8a8a]">{errors[name]}</p>}
    </div>
  )
}

export default function InquiryForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | done
  const [msg, setMsg] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const select = (name, label, required) => (
    <Field label={label} name={name} form={form} set={set} errors={errors}>
      <select id={name} value={form[name]} onChange={(e) => set(name, e.target.value)} className={input} required={required}>
        <option value="">Choose one</option>
        {OPT[name].map((o) => <option key={o}>{o}</option>)}
      </select>
    </Field>
  )

  async function submit(e) {
    e.preventDefault()
    setState('sending'); setErrors({}); setMsg('')
    try {
      const r = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (r.ok && d.token) { setLink(`${window.location.origin}/c/${d.token}`); setState('done'); return }
      if (d.fields) setErrors(d.fields)
      setMsg(d.error === 'too_many' ? 'Too many requests from this email. Please try again later.' : d.fields ? 'Please fix the highlighted fields.' : `Something went wrong${d.code ? ` (code: ${d.code})` : ''}. Please try again or message us on WhatsApp.`)
    } catch { setMsg('Network problem. Please check your connection and try again.') }
    setState('idle')
  }

  if (state === 'done') return (
    <div className="mt-10 max-w-xl border border-volt p-6" role="status">
      <h3 className="font-display text-3xl">Thank you. Your inquiry is in.</h3>
      <p className="mt-3 text-bone/80">Save your private link. It is the only way back to your conversation, and we cannot recover it for you.</p>
      <p className="mt-4 break-all bg-coal p-3 text-sm">{link}</p>
      <a href={link} className="mr-3 mt-4 inline-block border border-bone/40 px-5 py-3">Open conversation</a>
      <button onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))} className="mt-4 bg-volt px-5 py-3 font-medium text-white">{copied ? 'Copied' : 'Copy link'}</button>
      <p className="mt-4 text-sm text-bone/60">Open it any time to read replies and send messages to Asher.</p>
    </div>
  )

  return (
    <form onSubmit={submit} noValidate className="mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
      <Field label="Full name" name="full_name" form={form} set={set} errors={errors} />
      <Field label="Business name (optional)" name="business_name" form={form} set={set} errors={errors} />
      <Field label="Email" name="email" form={form} set={set} errors={errors} />
      <Field label="WhatsApp number" name="whatsapp" form={form} set={set} errors={errors} hint="Include country code" />
      {select('contact_method', 'Preferred contact method', true)}
      {select('service', 'Service needed', true)}
      {select('budget', 'Project budget (optional)')}
      {select('timeline', 'Expected timeline (optional)')}
      <div className="md:col-span-2">
        <Field label="Project description" name="description" form={form} set={set} errors={errors}>
          <textarea id="description" rows="5" maxLength={4000} value={form.description} onChange={(e) => set('description', e.target.value)} className={input} aria-invalid={!!errors.description} />
        </Field>
      </div>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>Website<input tabIndex="-1" autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} /></label>
      </div>
      <div className="md:col-span-2">
        <button disabled={state === 'sending'} className="bg-volt px-6 py-3 font-medium text-white disabled:opacity-50">{state === 'sending' ? 'Sending…' : 'Send inquiry'}</button>
        {msg && <p role="alert" className="mt-3 text-[#ff8a8a]">{msg}</p>}
      </div>
    </form>
  )
}
