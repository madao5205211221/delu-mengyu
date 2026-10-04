import React, { useState } from 'react'
import Sheet from '../components/Sheet.jsx'
import { uid } from '../lib/storage.js'

// 灵感分两类：
// - spark 闪念：一句话，看一眼就懂（原来是唯一的形态）
// - note  笔记本：成篇的想法，比如「想写一本小说」，能一直往下写
const KINDS = [
  { id: 'spark', label: '闪念', hint: '一句话，想到就记' },
  { id: 'note', label: '笔记本', hint: '成篇的想法，能慢慢写' },
]

function fmtDay(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function preview(text, n = 60) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

export default function Idea({ state, update, toast }) {
  const [tab, setTab] = useState('spark')
  const [text, setText] = useState('')
  const [openId, setOpenId] = useState(null)

  const items = state.ideas.filter((i) => (i.kind || 'spark') === tab)
  const open = openId ? state.ideas.find((i) => i.id === openId) : null

  const add = () => {
    const t = text.trim()
    if (!t) return
    if (tab === 'note') {
      const id = uid()
      update((s) => ({
        ...s,
        ideas: [
          {
            id,
            kind: 'note',
            title: t.split('\n')[0].slice(0, 30),
            text: t,
            done: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...s.ideas,
        ],
      }))
      setText('')
      setOpenId(id)
      toast('开了一本')
      return
    }
    update((s) => ({
      ...s,
      ideas: [
        {
          id: uid(),
          kind: 'spark',
          text: t,
          done: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...s.ideas,
      ],
    }))
    setText('')
  }

  const toggle = (id) =>
    update((s) => ({
      ...s,
      ideas: s.ideas.map((i) =>
        i.id === id ? { ...i, done: !i.done, updatedAt: Date.now() } : i
      ),
    }))

  const del = (id) => {
    update((s) => ({ ...s, ideas: s.ideas.filter((i) => i.id !== id) }))
    if (openId === id) setOpenId(null)
  }

  const saveNote = (id, patch) =>
    update((s) => ({
      ...s,
      ideas: s.ideas.map((i) =>
        i.id === id
          ? {
              ...i,
              ...patch,
              title:
                patch.text !== undefined
                  ? patch.text.split('\n')[0].slice(0, 30) || '无题'
                  : i.title,
              updatedAt: Date.now(),
            }
          : i
      ),
    }))

  const active = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)
  const kindInfo = KINDS.find((k) => k.id === tab)

  return (
    <div className="page">
      <div className="seg">
        {KINDS.map((k) => (
          <button
            key={k.id}
            className={'seg-btn' + (tab === k.id ? ' on' : '')}
            onClick={() => setTab(k.id)}
          >
            {k.label}
            <span className="seg-cnt">
              {state.ideas.filter((i) => (i.kind || 'spark') === k.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            tab === 'spark' ? '突然想到的，先扔进来…' : '想写的东西，第一行当标题…'
          }
          style={{
            width: '100%',
            minHeight: tab === 'spark' ? 60 : 110,
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.7,
          }}
        />
        <div className="quick-foot">
          <span className="hint">{kindInfo.hint}</span>
          <button className="btn" onClick={add} disabled={!text.trim()}>
            {tab === 'spark' ? '扔进来' : '开写'}
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="card">
          <div className="empty">
            {tab === 'spark'
              ? '闪念是空的。想到什么就扔一个进来'
              : '还没有笔记本。想写小说、攒点子，都从这儿开'}
          </div>
        </div>
      )}

      {tab === 'spark' ? (
        <>
          {active.map((i) => (
            <div className="idea" key={i.id}>
              <button className="check" onClick={() => toggle(i.id)} />
              <div className="txt">
                <div className="text">{i.text}</div>
                <div className="meta">{fmtDay(i.createdAt)}</div>
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
        </>
      ) : (
        <>
          {items.map((i) => (
            <button className="note-card" key={i.id} onClick={() => setOpenId(i.id)}>
              <div className="note-title">
                {i.title || '无题'}
                {i.done && <span className="note-done">已完</span>}
              </div>
              <div className="note-prev">{preview(i.text) || '（空的）'}</div>
              <div className="meta">
                {i.text.trim().length} 字 · 改于 {fmtDay(i.updatedAt || i.createdAt)}
              </div>
            </button>
          ))}
        </>
      )}

      <div className="hint" style={{ textAlign: 'center', marginTop: 18 }}>
        灵感不进回忆录，一直留着
      </div>

      {open && (
        <NoteSheet
          note={open}
          onSave={saveNote}
          onDelete={del}
          onClose={() => setOpenId(null)}
          toast={toast}
        />
      )}
    </div>
  )
}

function NoteSheet({ note, onSave, onDelete, onClose, toast }) {
  const [text, setText] = useState(note.text || '')
  const [confirmDel, setConfirmDel] = useState(false)
  const chars = text.trim().length

  return (
    <Sheet title={note.done ? '这本写完了' : '写东西'} onClose={onClose}>
      <div className="field">
        <label>
          内容　<span style={{ color: 'var(--ink-3)' }}>{chars} 字</span>
        </label>
        <textarea
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="第一行当标题，后面随便写…"
          style={{ lineHeight: 1.75 }}
        />
      </div>

      <div className="sheet-foot">
        <button className="btn ghost" onClick={onClose}>
          关掉
        </button>
        <button
          className="btn"
          onClick={() => {
            onSave(note.id, { text })
            toast('存好了')
            onClose()
          }}
        >
          保存
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button
          className="btn ghost"
          style={{ flex: 1 }}
          onClick={() => {
            onSave(note.id, { text, done: !note.done })
            toast(note.done ? '又翻开了' : '标记完成')
            onClose()
          }}
        >
          {note.done ? '重新打开' : '标记写完'}
        </button>
        <button
          className="btn danger"
          style={{ flex: 1 }}
          onClick={() => {
            if (!confirmDel) {
              setConfirmDel(true)
              return
            }
            onDelete(note.id)
            toast('删了')
            onClose()
          }}
        >
          {confirmDel ? '再点一次确认删除' : '删除'}
        </button>
      </div>
    </Sheet>
  )
}
