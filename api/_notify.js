// Sends a push notification through ntfy.sh. The topic name acts like a password: keep NTFY_TOPIC secret.
// Messages never contain personal data. Failures are ignored so they can never break a request.
export async function notify(title, message, click) {
  const topic = process.env.NTFY_TOPIC
  if (!topic) return
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: { Title: title, ...(click ? { Click: click } : {}) },
      body: message,
      signal: AbortSignal.timeout(3000)
    })
  } catch { /* ignore */ }
}
