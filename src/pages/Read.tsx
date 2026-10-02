import { useEffect } from 'react'
import { Icon } from '../components/Icon'
import { shareCard } from '../components/Overlays'
import { postBySlug, posts, type Post } from '../data/posts'
import { log } from '../lib/progress'
import { toolById } from '../tools/registry'

export function PostCard({ p, big = false }: { p: Post; big?: boolean }) {
  return (
    <a href={`#/read/${p.slug}`} className={`post-card a-${p.accent}${big ? ' big' : ''}`}>
      <span className="post-cover">
        <Icon name={p.cover} size={big ? 44 : 30} />
      </span>
      <span className="post-meta">
        <b>{p.title}</b>
        <small>{p.hook}</small>
        <em>{p.minutes} min read</em>
      </span>
    </a>
  )
}

function Article({ p }: { p: Post }) {
  useEffect(() => {
    document.title = `${p.title} — perfucktionist`
    window.scrollTo(0, 0)
    const t = setTimeout(() => log('verse', { silent: true }), 60_000)
    return () => clearTimeout(t)
  }, [p])
  const others = posts.filter((x) => x.slug !== p.slug).slice(0, 3)
  return (
    <article className={`page article a-${p.accent}`}>
      <a className="icon-btn" href="#/read" aria-label="All posts">
        ←
      </a>
      <header className="art-head">
        <span className="post-cover big">
          <Icon name={p.cover} size={44} />
        </span>
        <p className="kicker">
          {p.tags.join(' · ')} · {p.minutes} min
        </p>
        <h1>{p.title}</h1>
        <p className="art-hook">{p.hook}</p>
      </header>
      {p.sections.map((s) => (
        <section key={s.heading} className="art-section">
          <h2>{s.heading}</h2>
          {s.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      ))}
      <section className="art-actions">
        <p className="kicker">today, if you can</p>
        <ul>
          {p.actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        {p.tools.length > 0 && (
          <div className="row gap-sm wrap">
            {p.tools.map((id) => {
              const t = toolById(id)
              return t ? (
                <a key={id} className="tool-chip" href={`#/tools/${id}`}>
                  <Icon name={id === 'focus' ? 'focus-timer' : id} size={18} /> {t.name}
                </a>
              ) : null
            })}
          </div>
        )}
      </section>
      <p className="art-help">{p.helplineNote}</p>
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-sm" onClick={() => shareCard({ kicker: 'read on perfucktionist', text: p.title, footer: p.hook })}>
          ↗ share
        </button>
      </div>
      {others.length > 0 && (
        <section className="art-more">
          <p className="kicker">read next</p>
          <div className="post-grid">
            {others.map((o) => (
              <PostCard key={o.slug} p={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default function Read() {
  const slug = window.location.hash.split('/')[2]
  const p = slug ? postBySlug(slug) : null
  if (p) return <Article p={p} />
  return (
    <div className="page read">
      <header className="listen-head">
        <span className="ibub big">
          <Icon name="read" size={30} />
        </span>
        <h1>read</h1>
        <p className="muted">honest pieces on depression, pressure and starting over. no preaching.</p>
      </header>
      {posts.length === 0 ? (
        <p className="muted">posts are on their way.</p>
      ) : (
        <div className="post-grid">
          {posts.map((x, i) => (
            <PostCard key={x.slug} p={x} big={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
