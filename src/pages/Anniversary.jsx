import React, { useState } from 'react'
import Sheet from '../components/Sheet.jsx'
import { uid } from '../lib/storage.js'
import { lunarInfo, solarToLunar, lunarToSolar } from '../lib/lunar.js'
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

  const add = (name, date, repeatYearly, note, lunar) =>
    update((s) => ({
      ...s,
      anniversaries: [
        ...s.anniversaries,
        { id: uid(), name, date, repeatYearly, note, lunar, createdAt: Date.now() },
      ],
    }))

  const del = (id) =>
    update((s) => ({ ...s, anniversaries: s.anniversaries.filter((a) => a.id !== id) }))

  const items = state.anniversaries
    .map((a) => {
      let targetDate = a.date
      let lunarText = ''

      // 农历生日：每年对应的公历日期都在变，要重新算
      if (a.lunar && a.repeatYearly) {
        const lu = solarToLunar(...a.date.split('-').map(Number))
        if (lu) {
          lunarText = `${lu.monthCN}月${lu.dayCN}`
          const thisYear = new Date().getFullYear()
          let found = lunarToSolar(lu.month, lu.day, thisYear)
          // 今年的已经过了就找明年
          if (found && new Date(found.year, found.month - 1, found.day) < new Date(new Date().toDateString())) {
            found = lunarToSolar(lu.month, lu.day, thisYear + 1) || found
          }
          if (found) {
            targetDate = toKey(new Date(found.year, found.month - 1, found.day))
          }
        }
      }

      const next = nextAnniversary(targetDate, a.repeatYearly)
      const days = daysFromToday(toKey(next))
      return { ...a, days, lunarText, targetDate }
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
                <div className="name">
                  {a.name}
                  {a.lunar && <span className="lunar-tag">农历</span>}
                </div>
                <div className="meta">
                  {fmtShort(a.date)}
                  {a.repeatYearly ? ` · 每年 · 第 ${yearsPassed(a.date) + 1} 个年头` : ''}
                </div>
                {a.lunar && a.lunarText && a.repeatYearly && (
                  <div className="meta">
                    农历 {a.lunarText} · 今年在 {fmtShort(a.targetDate)}
                  </div>
                )}
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
  const [lunar, setLunar] = useState(true)

  const d = date ? date.split('-').map(Number) : null
  const li = d ? lunarInfo(d[0], d[1], d[2]) : null

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
        <input
          type="date"
          value={date}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {li && (
        <div className="lunar-note">
          <span className="ln-main">{li.full}</span>
          {li.isFestival && <span className="ln-fest">{li.festivals.join(' · ')}</span>}
        </div>
      )}

      <div className="field">
        <label>按农历算吗</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={'btn sm' + (lunar ? '' : ' ghost')}
            onClick={() => setLunar(true)}
          >
            农历
          </button>
          <button
            className={'btn sm' + (lunar ? ' ghost' : '')}
            onClick={() => setLunar(false)}
          >
            公历
          </button>
        </div>
        {lunar && (
          <div className="hint" style={{ marginTop: 6 }}>
            上面先填你出生那年的公历日期，之后每年的农历生日会自动换算
          </div>
        )}
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
            onCreate(name.trim(), date, repeat, note.trim(), lunar)
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
