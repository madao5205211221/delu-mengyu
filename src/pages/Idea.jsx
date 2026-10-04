import React, { useState } from 'react'
import { uid } from '../lib/storage.js'
import { fmtShort, parseKey } from '../lib/date.js'

export default function Idea({ state, update }) {
  const [text, setText] = useState('')

  const add = () => {
    const t = text.trim()
    if (!t) return
    update((s) => ({
      ...s,
      ideas: [{ id: uid(), text: t, done: false, createdAt: Date.now() }, ...s.ideas],
    }))
    setText('')
  }

  const toggle = (id) =>
    update((s) => ({
      ...s,
      ideas: s.ideas.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    }))

  const del = (id) => update((s) => ({ ...s, ideas: s.ideas.filter((i) => i.id !== id) }))

  const active = state.ideas.filter((i) => !i.done)
  const done = state.ideas.filter((i) => i.done)

  return (
    <div className="page">
      <div className="card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="突然想到的，先扔进来…"
          style={{
            width: '100%',
            minHeight: 60,
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.7,
          }}
        />
        <div className="quick-foot">
          <span className="hint">想到就记，别管成不成</span>
          <button className="btn" onClick={add} disabled={!text.trim()}>
            扔进来
          </button>
        </div>
      </div>

      <div className="card-title" style={{ padding: '4px 2px' }}>
        <span>还没做的</span>
        <span className="more">{active.length} 个</span>
      </div>

      {state.ideas.length === 0 && (
        <div className="card">
          <div className="empty">灵感池是空的。想到什么就扔一个进来</div>
        </div>
      )}

      {active.map((i) => (
        <div className="idea" key={i.id}>
          <button className="check" onClick={() => toggle(i.id)} />
          <div className="txt">
            <div className="text">{i.text}</div>
            <div className="meta">{fmtShort(fmtDate(i.createdAt))}</div>
          </div>
          <button className="del" onClick={() => del(i.id)}>
            ×
          </button>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <div className="card-title" style={{ padding: '14px 2px 4px' }}>
            <span>已经做了</span>
            <span className="more">{done.length} 个</span>
          </div>
          {done.map((i) => (
            <div className="idea done" key={i.id}>
              <button className="check on" onClick={() => toggle(i.id)}>
                ✓
              </button>
              <div className="txt">
                <div className="text">{i.text}</div>
              </div>
              <button className="del" onClick={() => del(i.id)}>
                ×
              </button>
            </div>
          ))}
        </>
      )}

      <div className="hint" style={{ textAlign: 'center', marginTop: 18 }}>
        灵感不进回忆录，做过的也留着，回头看挺有意思
      </div>
    </div>
  )
}

function fmtDate(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
