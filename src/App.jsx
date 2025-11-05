import { useEffect, useRef, useState } from 'react'
import './App.css'

// CSV generation utilities
function convertToCSV(data, headers) {
  const csvRows = []
  // Add headers
  csvRows.push(headers.map(h => `"${h}"`).join(','))
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] ?? ''
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  })
  return csvRows.join('\n')
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function exportSpotifyTracksToCSV(tracks, artistName) {
  const headers = ['Title', 'Streams', 'Daily']
  const data = tracks.map(t => ({
    'Title': t.name || '',
    'Streams': typeof t.streams === 'number' ? t.streams : '',
    'Daily': typeof t.daily === 'number' ? t.daily : ''
  }))
  const csv = convertToCSV(data, headers)
  const filename = `${artistName || 'spotify'}_tracks_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

function exportYouTubeTracksToCSV(tracks, artistName) {
  const headers = ['Title', 'Views', 'Daily']
  const data = tracks.map(t => ({
    'Title': t.name || '',
    'Views': typeof t.views === 'number' ? t.views : '',
    'Daily': typeof t.views_daily === 'number' ? t.views_daily : ''
  }))
  const csv = convertToCSV(data, headers)
  const filename = `${artistName || 'youtube'}_tracks_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

function exportTopTracksToCSV(tracks, artistName) {
  const headers = ['Title', 'Album', 'Release Year', 'Spotify Streams', 'Spotify Daily', 'YouTube Views', 'YouTube Daily', 'Popularity']
  const data = tracks.map(t => ({
    'Title': t.name || '',
    'Album': t.album || '',
    'Release Year': t.release_year || '',
    'Spotify Streams': typeof t.streams === 'number' ? t.streams : (t.streams_millions ? `${t.streams_millions}M` : ''),
    'Spotify Daily': typeof t.streams_daily === 'number' ? t.streams_daily : '',
    'YouTube Views': typeof t.youtube_views === 'number' ? t.youtube_views : (t.youtube_views_millions ? `${t.youtube_views_millions}M` : ''),
    'YouTube Daily': typeof t.youtube_views_daily === 'number' ? t.youtube_views_daily : '',
    'Popularity': t.popularity || ''
  }))
  const csv = convertToCSV(data, headers)
  const filename = `${artistName || 'top'}_tracks_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

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
            <div className="muted">Spotify Streams</div>
            <div>
              {typeof data.streams === 'number'
                ? data.streams.toLocaleString()
                : (data.streams_millions
                    ? `${data.streams_millions}M`
                    : (data.streams_estimate_millions ? `~${data.streams_estimate_millions}M (est.)` : '—'))}
            </div>
          </div>
          {data.streams_daily && (
            <div>
              <div className="muted">Spotify Daily</div>
              <div>{typeof data.streams_daily === 'number' ? data.streams_daily.toLocaleString() : '—'}</div>
            </div>
          )}
          <div>
            <div className="muted">YouTube Views</div>
            <div>
              {typeof data.youtube_views === 'number'
                ? data.youtube_views.toLocaleString()
                : (data.youtube_views_millions
                    ? `${data.youtube_views_millions}M`
                    : '—')}
            </div>
          </div>
          {data.youtube_views_daily && (
            <div>
              <div className="muted">YouTube Daily</div>
              <div>{typeof data.youtube_views_daily === 'number' ? data.youtube_views_daily.toLocaleString() : '—'}</div>
            </div>
          )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>Top Tracks</div>
            <button
              onClick={() => exportTopTracksToCSV(data.top_tracks, name)}
              style={{
                padding: '6px 12px',
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              Download CSV
            </button>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {data.top_tracks.map(t => (
              <div key={t.id} style={{ padding: 12, border: '1px solid #1f2937', borderRadius: 10, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div className="muted">{t.album}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, alignItems: 'start' }}>
                  <div>
                    <div className="muted">Year</div>
                    <div>{t.release_year ?? '—'}</div>
                  </div>
                  <div>
                    <div className="muted">Spotify</div>
                    <div>
                      {typeof t.streams === 'number'
                        ? t.streams.toLocaleString()
                        : (t.streams_millions
                            ? `${t.streams_millions}M`
                            : (t.streams_estimate_millions ? `~${t.streams_estimate_millions}M` : '—'))}
                    </div>
                    {t.streams_daily && (
                      <div style={{ fontSize: '0.85em', color: '#6b7280' }}>
                        {typeof t.streams_daily === 'number' ? `+${t.streams_daily.toLocaleString()}/day` : ''}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="muted">YouTube</div>
                    <div>
                      {typeof t.youtube_views === 'number'
                        ? t.youtube_views.toLocaleString()
                        : (t.youtube_views_millions
                            ? `${t.youtube_views_millions}M`
                            : '—')}
                    </div>
                    {t.youtube_views_daily && (
                      <div style={{ fontSize: '0.85em', color: '#6b7280' }}>
                        {typeof t.youtube_views_daily === 'number' ? `+${t.youtube_views_daily.toLocaleString()}/day` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {t.external_urls?.spotify && (
                      <a href={t.external_urls.spotify} target="_blank" rel="noreferrer" className="link">Spotify</a>
                    )}
                    {t.preview_url && (
                      <a href={t.preview_url} target="_blank" rel="noreferrer" className="link">Preview</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.kworb_all_tracks) && data.kworb_all_tracks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>All Tracks - Spotify (Kworb)</div>
            <button
              onClick={() => exportSpotifyTracksToCSV(data.kworb_all_tracks, name)}
              style={{
                padding: '6px 12px',
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              Download CSV
            </button>
          </div>
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

      {Array.isArray(data.youtube_all_tracks) && data.youtube_all_tracks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>All Tracks - YouTube (Kworb)</div>
            <button
              onClick={() => exportYouTubeTracksToCSV(data.youtube_all_tracks, name)}
              style={{
                padding: '6px 12px',
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              Download CSV
            </button>
          </div>
          <div style={{ border: '1px solid #1f2937', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px', padding: '10px 12px', background: '#0b1324' }}>
              <div className="muted">Title</div>
              <div className="muted">Views</div>
              <div className="muted">Daily</div>
            </div>
            <div style={{ maxHeight: 420, overflow: 'auto' }}>
              {data.youtube_all_tracks.map((y, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px', padding: '10px 12px', borderTop: '1px solid #1f2937' }}>
                  <div>{y.name}</div>
                  <div>{typeof y.views === 'number' ? y.views.toLocaleString() : '—'}</div>
                  <div>{typeof y.views_daily === 'number' ? y.views_daily.toLocaleString() : '—'}</div>
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
