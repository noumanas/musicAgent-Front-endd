import { useEffect, useRef, useState } from 'react'
import './App.css'

function ResultCard({ result }) {
  const { type, name, data } = result || {}
  if (!type || !name || !data) return null

  if (type === 'track') {
    return (
      <div className="result-card">
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{name}</div>
        <div className="grid cols-2">
          <div>
            <div className="muted">Artist</div>
            <div>{data.artist ?? '—'}</div>
          </div>
          <div>
            <div className="muted">Album</div>
            <div>{data.album ?? '—'}</div>
          </div>
          <div>
            <div className="muted">Release Year</div>
            <div>{data.release_year ?? '—'}</div>
          </div>
          <div>
            <div className="muted">Popularity</div>
            <div>{data.popularity ?? '—'}</div>
          </div>
          <div>
            <div className="muted">Streams</div>
            <div>
              {typeof data.streams === 'number'
                ? data.streams.toLocaleString()
                : (data.streams_millions
                    ? `${data.streams_millions}M`
                    : (data.streams_estimate_millions ? `~${data.streams_estimate_millions}M (est.)` : '—'))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.external_urls?.spotify && (
            <a href={data.external_urls.spotify} target="_blank" rel="noreferrer" className="link">Open in Spotify</a>
          )}
          {data.preview_url && (
            <a href={data.preview_url} target="_blank" rel="noreferrer" className="link">Preview</a>
          )}
        </div>
      </div>
    )
  }

  // artist
  return (
    <div className="result-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        {Array.isArray(data.images) && data.images[0]?.url && (
          <img src={data.images[0].url} alt={name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
        )}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{name}</div>
          <div className="muted">{(data.genres || []).join(', ')}</div>
        </div>
      </div>
      <div className="grid cols-3" style={{ marginBottom: 12 }}>
        <div>
          <div className="muted">Followers</div>
          <div>{data.followers?.toLocaleString?.() ?? '—'}</div>
        </div>
        <div>
          <div className="muted">Popularity</div>
          <div>{data.popularity ?? '—'}</div>
        </div>
        <div>
          <div className="muted">Spotify</div>
          {data.external_urls?.spotify ? (
            <a href={data.external_urls.spotify} target="_blank" rel="noreferrer" className="link">Open</a>
          ) : '—'}
        </div>
      </div>
      {Array.isArray(data.top_tracks) && data.top_tracks.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Top Tracks</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {data.top_tracks.map(t => (
              <div key={t.id} style={{ padding: 12, border: '1px solid #1f2937', borderRadius: 10, display: 'grid', gridTemplateColumns: '1fr 120px 160px', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div className="muted">{t.album}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="muted">Year</div>
                    <div>{t.release_year ?? '—'}</div>
                  </div>
                  <div>
                    <div className="muted">Streams</div>
                    <div>
                      {typeof t.streams === 'number'
                        ? t.streams.toLocaleString()
                        : (t.streams_millions
                            ? `${t.streams_millions}M`
                            : (t.streams_estimate_millions ? `~${t.streams_estimate_millions}M (est.)` : '—'))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {t.external_urls?.spotify && (
                    <a href={t.external_urls.spotify} target="_blank" rel="noreferrer" className="link">Spotify</a>
                  )}
                  {t.preview_url && (
                    <a href={t.preview_url} target="_blank" rel="noreferrer" className="link">Preview</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.kworb_all_tracks) && data.kworb_all_tracks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>All Tracks (Kworb)</div>
          <div style={{ border: '1px solid #1f2937', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px', padding: '10px 12px', background: '#0b1324' }}>
              <div className="muted">Title</div>
              <div className="muted">Streams</div>
              <div className="muted">Daily</div>
            </div>
            <div style={{ maxHeight: 420, overflow: 'auto' }}>
              {data.kworb_all_tracks.map((k, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px', padding: '10px 12px', borderTop: '1px solid #1f2937' }}>
                  <div>{k.name}</div>
                  <div>{typeof k.streams === 'number' ? k.streams.toLocaleString() : '—'}</div>
                  <div>{typeof k.daily === 'number' ? k.daily.toLocaleString() : '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Message({ role, content }) {
  // Try to parse assistant JSON and render a designed card
  if (role === 'assistant') {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      if (parsed && parsed.type && parsed.name && parsed.data) {
        return (
          <div className="bubble-row">
            <div className="avatar" />
            <div style={{ maxWidth: 800 }}>
              <ResultCard result={parsed} />
            </div>
          </div>
        )
      }
    } catch {}
  }

  return (
    <div className={`bubble-row ${role === 'user' ? 'user' : ''}`}>
      {role !== 'user' && <div className="avatar" />}
      <div className={`bubble ${role === 'user' ? 'user' : ''}`}>{content}</div>
      {role === 'user' && <div className="avatar" style={{ visibility: 'hidden' }} />}
    </div>
  )
}

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ask me about an artist or a track.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  async function sendMessage(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text })
      })
      const data = await resp.json()
      const pretty = JSON.stringify(data, null, 2)
      setMessages(m => [...m, { role: 'assistant', content: pretty }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${err?.message || err}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="avatar" />
        <div className="title">Music History Chat</div>
      </header>
      <main ref={listRef} className="chat">
        <div className="stream">
          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} />
          ))}
        </div>
      </main>
      <form onSubmit={sendMessage} className="composer">
        <div className="row">
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={loading ? 'Working…' : 'Ask: Hello (Adele) or The Beatles'}
            disabled={loading}
          />
          <button className="btn" disabled={loading}>
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default App
