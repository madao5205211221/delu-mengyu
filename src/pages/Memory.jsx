import React, { useState, useMemo } from 'react'
import MoodPicker from '../components/MoodPicker.jsx'
import Sheet from '../components/Sheet.jsx'
import { getMood } from '../lib/moods.js'
import { uid } from '../lib/storage.js'
import { lunarInfo } from '../lib/lunar.js'
import { todayKey, weekdayCN, fmtShort, monthGrid, parseKey } from '../lib/date.js'

function topMood(list) {
  const cnt = {}
  list.forEach((e) => {
    if (e.mood) cnt[e.mood] = (cnt[e.mood] || 0) + 1
  })
  const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]
  return best ? getMood(best[0]) : null
}

export default function Memory({ state, update, toast }) {
  const today = todayKey()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0 起
  const [sel, setSel] = useState(null)
  const [limit, setLimit] = useState(30)
  const [showAdd, setShowAdd] = useState(false)
  const [pickYear, setPickYear] = useState(false)
  const [pickMonth, setPickMonth] = useState(false)

  const byDate = useMemo(() => {
    const map = {}
    state.entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [state.entries])

  const cells = monthGrid(year, month)

  const shiftMonth = (delta) => {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
    setSel(null)
  }

  const delEntry = (id) =>
    update((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }))

  const addPast = (date, text, mood) =>
    update((s) => ({
      ...s,
      entries: [...s.entries, { id: uid(), date, text, mood, createdAt: Date.now() }],
    }))

  // 时间线：选中某天就看那天，否则按日期倒序全部
  const groups = useMemo(() => {
    const keys = sel
      ? [sel]
      : Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1))
    const out = []
    for (const k of keys) {
      const list = byDate[k]
      if (!list) continue
      out.push({ date: k, list: [...list].sort((a, b) => b.createdAt - a.createdAt) })
      if (!sel && out.reduce((n, g) => n + g.list.length, 0) >= limit) break
    }
    return out
  }, [byDate, sel, limit])

  const totalShown = groups.reduce((n, g) => n + g.list.length, 0)

  // 往年今日
  const nowD = parseKey(today)
  const oldToday = state.entries
    .filter((e) => {
      const d = parseKey(e.date)
      return (
        d.getMonth() === nowD.getMonth() &&
        d.getDate() === nowD.getDate() &&
        d.getFullYear() < nowD.getFullYear()
      )
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const monthEntries = Object.keys(byDate).filter((k) => {
    const d = parseKey(k)
    return d.getFullYear() === year && d.getMonth() === month
  })
  const moodStat = {}
  monthEntries.forEach((k) => byDate[k].forEach((e) => e.mood && (moodStat[e.mood] = (moodStat[e.mood] || 0) + 1)))
  const moodStatList = Object.entries(moodStat).sort((a, b) => b[1] - a[1])

  return (
    <div className="page">
      <div className="card">
        <div className="cal-head">
          <button className="icon-btn" onClick={() => shiftMonth(-1)}>
            ‹
          </button>
          <div className="cal-title">
            <button className="cal-part" onClick={() => setPickYear(true)}>
              {year} 年
            </button>
            <button className="cal-part" onClick={() => setPickMonth(true)}>
              {month + 1} 月
            </button>
          </div>
          <button className="icon-btn" onClick={() => shiftMonth(1)}>
            ›
          </button>
        </div>
        <div className="cal-grid">
          {['一', '二', '三', '四', '五', '六', '日'].map((w) => (
            <div className="cal-wd" key={w}>
              {w}
            </div>
          ))}
          {cells.map((k, i) => {
            if (!k) return <div className="cal-cell empty" key={i} />
            const list = byDate[k]
            const m = list ? topMood(list) : null
            const d = parseKey(k)
            const li = lunarInfo(d.getFullYear(), d.getMonth() + 1, d.getDate())
            return (
              <button
                key={k}
                className={
                  'cal-cell' +
                  (k === today ? ' today' : '') +
                  (k === sel ? ' sel' : '') +
                  (list ? ' has' : '') +
                  (m ? ' has-mood' : '') +
                  (li.isFestival ? ' fest' : '')
                }
                onClick={() => setSel(k === sel ? null : k)}
              >
                <span className="num">{d.getDate()}</span>
                <span className={'lunar' + (li.isFestival ? ' red' : '')}>
                  {li.short}
                </span>
                {m && <span className="em">{m.emoji}</span>}
              </button>
            )
          })}
        </div>
        {moodStatList.length > 0 && (
          <div style={{ marginTop: 12, borderTop: '1px dashed var(--line)', paddingTop: 10 }}>
            <div className="hint" style={{ marginBottom: 6 }}>
              这个月的心情
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {moodStatList.map(([id, n]) => {
                const m = getMood(id)
                return (
                  <span
                    key={id}
                    style={{
                      fontSize: 12,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      color: m.color,
                    }}
                  >
                    {m.emoji} {m.label} {n}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {oldToday.length > 0 && (
        <div className="card" style={{ background: 'var(--clay-soft)' }}>
          <div className="card-title">
            <span>往年今日</span>
            <span className="more">{fmtShort(today)}</span>
          </div>
          {oldToday.slice(0, 3).map((e) => {
            const y = parseKey(e.date).getFullYear()
            const gap = nowD.getFullYear() - y
            const m = getMood(e.mood)
            return (
              <div className="row" key={e.id}>
                <div style={{ fontSize: 17 }}>{m ? m.emoji : '·'}</div>
                <div className="body">
                  <div className="text">{e.text}</div>
                  <div className="meta">{gap === 1 ? '去年' : `${gap} 年前`}的今天</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card-title" style={{ padding: '4px 2px' }}>
        <span>{sel ? fmtShort(sel) + ' 那天' : '时间线'}</span>
        <button className="more" onClick={() => setShowAdd(true)}>
          + 补记
        </button>
      </div>

      {sel && (
        <button className="btn" style={{ width: '100%', marginBottom: 10 }} onClick={() => setShowAdd(true)}>
          给 {fmtShort(sel)} 记一笔
        </button>
      )}

      {state.entries.length === 0 && (
        <div className="card">
          <div className="empty">还没有回忆。今天记下第一笔吧</div>
        </div>
      )}

      {groups.map((g) => (
        <div className="day-group" key={g.date}>
          <div className="day-head">
            <span className="d">{fmtShort(g.date)}</span>
            <span>{weekdayCN(g.date)}</span>
            {g.date === today && <span style={{ color: 'var(--green)' }}>· 今天</span>}
          </div>
          {g.list.map((e) => {
            const m = getMood(e.mood)
            return (
              <div className="entry" key={e.id}>
                <span className="em">{m ? m.emoji : '·'}</span>
                <div className="txt">
                  <div className="text">{e.text}</div>
                  {m && (
                    <div className="mood-label" style={{ color: m.color }}>
                      {m.label}
                    </div>
                  )}
                </div>
                <button className="del" onClick={() => delEntry(e.id)}>
                  ×
                </button>
              </div>
            )
          })}
        </div>
      ))}

      {!sel && totalShown >= limit && totalShown < state.entries.length && (
        <button className="btn ghost" style={{ width: '100%' }} onClick={() => setLimit(limit + 30)}>
          看更早的
        </button>
      )}

      {showAdd && (
        <PastSheet
          defaultDate={sel || todayKey()}
          onClose={() => setShowAdd(false)}
          onCreate={addPast}
          toast={toast}
        />
      )}

      {pickYear && (
        <YearSheet
          year={year}
          entries={state.entries}
          onClose={() => setPickYear(false)}
          onPick={(y) => {
            setYear(y)
            setSel(null)
            setPickYear(false)
          }}
        />
      )}

      {pickMonth && (
        <MonthSheet
          year={year}
          month={month}
          byDate={byDate}
          onClose={() => setPickMonth(false)}
          onPick={(m) => {
            setMonth(m)
            setSel(null)
            setPickMonth(false)
          }}
        />
      )}
    </div>
  )
}

function YearSheet({ year, entries, onClose, onPick }) {
  const nowYear = new Date().getFullYear()
  const counts = {}
  entries.forEach((e) => {
    const y = parseKey(e.date).getFullYear()
    counts[y] = (counts[y] || 0) + 1
  })
  const years = Object.keys(counts).map(Number)
  const minYear = years.length ? Math.min(...years) : nowYear
  // 可回溯到 1900（农历表下界），保证能记小时候的事
  const start = Math.min(minYear, year, nowYear, 1990)

  const [decade, setDecade] = useState(() => Math.floor(year / 10) * 10)
  const list = []
  for (let y = decade + 9; y >= decade; y--) {
    if (y > nowYear + 5) continue
    list.push(y)
  }

  return (
    <Sheet title="选年份" onClose={onClose}>
      <div className="decade-row">
        <button className="icon-btn" onClick={() => setDecade(decade - 10)}>
          ‹
        </button>
        <div className="decade-label">{decade} — {decade + 9}</div>
        <button
          className="icon-btn"
          onClick={() => setDecade(decade + 10)}
          disabled={decade + 10 > nowYear + 10}
        >
          ›
        </button>
      </div>

      <div className="pick-grid">
        {list.map((y) => (
          <button
            key={y}
            className={'pick-cell' + (y === year ? ' on' : '')}
            onClick={() => onPick(y)}
          >
            {y}
            <span className="cnt">
              {counts[y] ? counts[y] + ' 条' : '—'}
            </span>
          </button>
        ))}
      </div>

      <div className="pick-jump">
        <button className="btn sm ghost" onClick={() => setDecade(Math.floor(nowYear / 10) * 10)}>
          回到今年
        </button>
        <button
          className="btn sm ghost"
          onClick={() => setDecade(Math.floor(Math.min(start, 1900) / 10) * 10)}
        >
          最早
        </button>
      </div>
      <div className="hint" style={{ marginTop: 8, textAlign: 'center' }}>
        最早可记到 1900 年
      </div>
    </Sheet>
  )
}

// 月份面板：每个月一个迷你月历，能看到哪天记了东西
function MonthSheet({ year, month, byDate, onClose, onPick }) {
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <Sheet title={`${year} 年 · 选月份`} onClose={onClose}>
      <div className="mini-months">
        {months.map((m) => {
          const cells = monthGrid(year, m)
          let count = 0
          cells.forEach((k) => {
            if (k && byDate[k]) count += byDate[k].length
          })
          const moods = {}
          cells.forEach((k) => {
            if (!k || !byDate[k]) return
            const mo = topMood(byDate[k])
            if (mo) moods[mo.id] = true
          })
          const moodList = Object.keys(moods).map(getMood).filter(Boolean)

          return (
            <button
              key={m}
              className={'mini-month' + (m === month ? ' on' : '')}
              onClick={() => onPick(m)}
            >
              <div className="mini-head">
                <span className="mini-name">{m + 1} 月</span>
                {count > 0 && <span className="mini-cnt">{count}</span>}
              </div>
              <div className="mini-grid">
                {cells.map((k, i) => {
                  if (!k) return <i key={i} className="mini-dot blank" />
                  const list = byDate[k]
                  const mo = list ? topMood(list) : null
                  return (
                    <i
                      key={i}
                      className={'mini-dot' + (list ? ' has' : '')}
                      style={mo ? { background: mo.color } : null}
                    />
                  )
                })}
              </div>
              <div className="mini-moods">
                {moodList.slice(0, 4).map((mo) => (
                  <span key={mo.id}>{mo.emoji}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
      <div className="hint" style={{ marginTop: 10, textAlign: 'center' }}>
        色块是有记录的日子，颜色对应那天的心情
      </div>
    </Sheet>
  )
}

function PastSheet({ defaultDate, onClose, onCreate, toast }) {
  const [date, setDate] = useState(defaultDate || todayKey())
  const [text, setText] = useState('')
  const [mood, setMood] = useState(null)

  const d = date ? parseKey(date) : null
  const li = d ? lunarInfo(d.getFullYear(), d.getMonth() + 1, d.getDate()) : null

  return (
    <Sheet title="补记一天" onClose={onClose}>
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
        <label>记了什么</label>
        <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="field">
        <label>当时的心情</label>
        <MoodPicker value={mood} onChange={setMood} />
      </div>
      <div className="sheet-foot">
        <button className="btn ghost" onClick={onClose}>
          算了
        </button>
        <button
          className="btn"
          onClick={() => {
            if (!text.trim() || !date) return
            onCreate(date, text.trim(), mood)
            toast('补上了')
            onClose()
          }}
        >
          记下
        </button>
      </div>
    </Sheet>
  )
}
