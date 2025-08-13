import process from 'node:process'

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('OPENAI_API_KEY is not set')
  process.exit(1)
}

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-5-nano',
    messages: [
      { role: 'system', content: 'You are a terse assistant.' },
      { role: 'user', content: 'ping' }
    ],
    max_tokens: 1
  })
})

if (!res.ok) {
  const text = await res.text()
  console.error('OpenAI API error', res.status, text)
  process.exit(2)
}

const data = await res.json()
console.log('OK:', data.choices?.[0]?.message?.content ?? 'ok')