import React, { useState } from 'react'
import Sheet from '../components/Sheet.jsx'
import { uid } from '../lib/storage.js'
import {
  daysFromToday,
  fmtShort,
  nextAnniversary,
  todayKey,
  toKey,
  yearsPassed,
} from '../lib/date.js'

export default function Anniversary({ state, update, toast }) {
  const [showAdd, setShowAdd] = useState(false)

  const add = (name, date, repeatYearly, note) =>
    update((s) => ({
      ...s,
      anniversaries: [
        ...s.anniversaries,
        { id: uid(), name, date, repeatYearly, note, createdAt: Date.now() },
      ],
    }))

  const del = (id) =>
    update((s) => ({ ...s, anniversaries: s.anniversaries.filter((a) => a.id !== id) }))

  const items = state.anniversaries
    .map((a) => {
      const next = nextAnniversary(a.date, a.repeatYearly)
      const days = daysFromToday(toKey(next))
      return { ...a, days }
    })
    .sort((x, y) => {
      if (x.days >= 0 && y.days >= 0) return x.days - y.days
      if (x.days < 0 && y.days < 0) return y.days - x.days
      return x.days >= 0 ? -1 : 1
    })

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">
          <span>要记住的日子</span>
          <button className="more" onClick={() => setShowAdd(true)}>
            + 加一个
          </button>
        </div>
        {items.length === 0 && (
          <div className="empty">
            生日、纪念日、第一次去某地的日子
            <br />
            都值得在这儿留个位置
          </div>
        )}
        {items.map((a) => {
          const future = a.days >= 0
          return (
            <div className="anni" key={a.id}>
              <div className="big">
                {a.days === 0 ? '就是今天' : Math.abs(a.days)}
                {a.days !== 0 && <span>{future ? '天后' : '天前'}</span>}
              </div>
              <div className="body" style={{ flex: 1, minWidth: 0 }}>
                <div className="name">{a.name}</div>
                <div className="meta">
                  {fmtShort(a.date)}
                  {a.repeatYearly ? ` · 每年 · 第 ${yearsPassed(a.date) + 1} 个年头` : ''}
                </div>
                {a.note && <div className="meta">{a.note}</div>}
              </div>
              <button className="del" onClick={() => del(a.id)}>
                ×
              </button>
            </div>
          )
        })}
      </div>

      <div className="hint" style={{ textAlign: 'center' }}>
        过去的显示已经走了多少天，将来的显示还有多少天
      </div>

      {showAdd && <AddSheet onClose={() => setShowAdd(false)} onCreate={add} toast={toast} />}
    </div>
  )
}

function AddSheet({ onClose, onCreate, toast }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(todayKey())
  const [repeat, setRepeat] = useState(true)
  const [note, setNote] = useState('')

  return (
    <Sheet title="加一个日子" onClose={onClose}>
      <div className="field">
        <label>叫什么</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="比如：结婚纪念日"
        />
      </div>
      <div className="field">
        <label>哪一天</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>每年都过吗</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={'btn sm' + (repeat ? '' : ' ghost')}
            onClick={() => setRepeat(true)}
          >
            每年
          </button>
          <button
            className={'btn sm' + (repeat ? ' ghost' : '')}
            onClick={() => setRepeat(false)}
          >
            只此一次
          </button>
        </div>
      </div>
      <div className="field">
        <label>备注（可留空）</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="sheet-foot">
        <button className="btn ghost" onClick={onClose}>
          算了
        </button>
        <button
          className="btn"
          onClick={() => {
            if (!name.trim() || !date) return
            onCreate(name.trim(), date, repeat, note.trim())
            toast('记住了')
            onClose()
          }}
        >
          加上
        </button>
      </div>
    </Sheet>
  )
}
