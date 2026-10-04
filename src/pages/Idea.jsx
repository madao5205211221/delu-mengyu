import React, { useState, useRef, useEffect } from 'react'
import { uid } from '../lib/storage.js'

// 灵感分两类：
// - spark 闪念：一句话，看一眼就懂
// - note  笔记本：成篇的想法，点开就地写，不在弹窗里写
const KINDS = [
  { id: 'spark', label: '闪念', hint: '一句话，想到就记' },
  { id: 'note', label: '笔记本', hint: '想写的东西，慢慢写' },
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

function titleOf(text) {
  const first = String(text || '').split('\n')[0].trim()
  return first ? first.slice(0, 30) : '无题'
}

export default function Idea({ state, update, toast }) {
  const [tab, setTab] = useState('spark')
  const [draft, setDraft] = useState('')
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)

  const items = state.ideas.filter((i) => (i.kind || 'spark') === tab)
  const kindInfo = KINDS.find((k) => k.id === tab)

  const add = () => {
    const t = draft.trim()
    if (!t) return
    const id = uid()
    update((s) => ({
      ...s,
      ideas: [
        {
          id,
          kind: tab,
          title: tab === 'note' ? titleOf(t) : '',
          text: t,
          done: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...s.ideas,
      ],
    }))
    setDraft('')
    if (tab === 'spark') {
      toast('记下了')
    } else {
      setOpenId(id)
      setEditId(id)
      toast('记下了，接着写')
    }
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
    if (editId === id) setEditId(null)
    toast('删了')
  }

  const saveNote = (id, patch) =>
    update((s) => ({
      ...s,
      ideas: s.ideas.map((i) =>
        i.id === id
          ? {
              ...i,
              ...patch,
              title: patch.text !== undefined ? titleOf(patch.text) : i.title,
              updatedAt: Date.now(),
            }
          : i
      ),
    }))

  const active = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)

  return (
    <div className="page">
      <div className="seg">
        {KINDS.map((k) => (
          <button
            key={k.id}
            className={'seg-btn' + (tab === k.id ? ' on' : '')}
            onClick={() => {
              setTab(k.id)
              setDraft('')
              setEditId(null)
              setOpenId(null)
            }}
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
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            tab === 'spark'
              ? '突然想到的，先扔进来…'
              : openId || editId
              ? '继续写…'
              : '想写点什么，第一行当标题…'
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
          <button className="btn" onClick={add} disabled={!draft.trim()}>
            记下
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
            <NoteCard
              key={i.id}
              note={i}
              open={openId === i.id}
              editing={editId === i.id}
              onToggleOpen={() => {
                const next = openId === i.id ? null : i.id
                setOpenId(next)
                setEditId(next)
              }}
              onStartEdit={() => {
                setOpenId(i.id)
                setEditId(i.id)
              }}
              onStopEdit={() => setEditId(null)}
              onSave={(text) => saveNote(i.id, { text })}
              onToggleDone={() => {
                saveNote(i.id, {})
                toggle(i.id)
              }}
              onDelete={() => del(i.id)}
              toast={toast}
            />
          ))}
        </>
      )}

      <div className="hint" style={{ textAlign: 'center', marginTop: 18 }}>
        灵感不进回忆录，一直留着
      </div>
    </div>
  )
}

// 卡片：收起时看摘要，点开就地变输入框直接写
function NoteCard({ note, open, editing, onToggleOpen, onStartEdit, onStopEdit, onSave, onToggleDone, onDelete, toast }) {
  const [text, setText] = useState(note.text || '')
  const [confirmDel, setConfirmDel] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setText(note.text || '')
  }, [note.id])

  useEffect(() => {
    if (editing && ref.current) {
      const el = ref.current
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editing])

  const save = () => {
    if (text.trim() !== (note.text || '').trim()) {
      onSave(text)
      toast('存好了')
    }
    onStopEdit()
  }

  const chars = text.trim().length

  return (
    <div className={'note-card' + (open ? ' open' : '')}>
      <button className="note-head" onClick={onToggleOpen}>
        <div className="note-title">
          {note.title || '无题'}
          {note.done && <span className="note-done">已完</span>}
        </div>
        <span className={'note-arrow' + (open ? ' up' : '')}>⌄</span>
      </button>

      {open ? (
        <>
          <textarea
            ref={ref}
            className="note-edit"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={onStartEdit}
            rows={Math.min(24, Math.max(8, text.split('\n').length + 2))}
            placeholder="想写什么就写…"
          />
          <div className="note-foot">
            <span className="hint">
              {chars} 字 · 改于 {fmtDay(note.updatedAt || note.createdAt)}
            </span>
            <button className="btn sm" onClick={save}>
              记下
            </button>
          </div>
          <div className="note-actions">
            <button className="btn sm ghost" onClick={onToggleDone}>
              {note.done ? '重新打开' : '标记写完'}
            </button>
            <button
              className="btn sm danger"
              onClick={() => {
                if (!confirmDel) {
                  setConfirmDel(true)
                  setTimeout(() => setConfirmDel(false), 3000)
                  return
                }
                onDelete()
              }}
            >
              {confirmDel ? '再点一次确认' : '删除'}
            </button>
          </div>
        </>
      ) : (
        <div className="note-body" onClick={onToggleOpen}>
          <div className="note-prev">{preview(note.text) || '（空的）'}</div>
          <div className="meta">
            {chars} 字 · 改于 {fmtDay(note.updatedAt || note.createdAt)}
          </div>
        </div>
      )}
    </div>
  )
}
