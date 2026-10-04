import React, { useState } from 'react'
import MoodPicker from '../components/MoodPicker.jsx'
import Sheet from '../components/Sheet.jsx'
import { todayKey, fmtFull, fmtShort, toKey } from '../lib/date.js'
import { uid } from '../lib/storage.js'

function streakOf(records) {
  const set = new Set(records)
  const d = new Date()
  if (!set.has(toKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(toKey(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export default function Today({ state, update, toast }) {
  const today = todayKey()
  const [text, setText] = useState('')
  const [mood, setMood] = useState(null)
  const [todoText, setTodoText] = useState('')
  const [showGoal, setShowGoal] = useState(false)

  const addEntry = () => {
    const t = text.trim()
    if (!t) return
    update((s) => ({
      ...s,
      entries: [...s.entries, { id: uid(), date: today, text: t, mood, createdAt: Date.now() }],
    }))
    setText('')
    setMood(null)
    toast('记下了')
  }

  const addTodo = () => {
    const t = todoText.trim()
    if (!t) return
    update((s) => ({
      ...s,
      todos: [...s.todos, { id: uid(), date: today, text: t, done: false, createdAt: Date.now() }],
    }))
    setTodoText('')
  }

  const toggleTodo = (id) =>
    update((s) => ({
      ...s,
      todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))

  const delTodo = (id) =>
    update((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) }))

  const moveToToday = (id) =>
    update((s) => ({
      ...s,
      todos: s.todos.map((t) => (t.id === id ? { ...t, date: today } : t)),
    }))

  const addGoal = (name, days) =>
    update((s) => ({
      ...s,
      goals: [
        ...s.goals,
        { id: uid(), name, targetDays: Number(days) || 30, records: [], createdAt: Date.now() },
      ],
    }))

  const punch = (goal) => {
    const has = goal.records.includes(today)
    update((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === goal.id
          ? {
              ...g,
              records: has ? g.records.filter((d) => d !== today) : [...g.records, today],
            }
          : g
      ),
    }))
    if (!has) toast('今天也做到了')
  }

  const delGoal = (id) =>
    update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }))

  const todayTodos = state.todos.filter((t) => t.date === today)
  const undone = todayTodos.filter((t) => !t.done)
  const doneTodos = todayTodos.filter((t) => t.done)
  const overdue = state.todos.filter((t) => !t.done && t.date < today)

  return (
    <div className="page">
      <div className="card quick">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="今天想记点什么…"
        />
        <MoodPicker value={mood} onChange={setMood} />
        <div className="quick-foot">
          <span className="hint">{mood ? '已选心情' : '选个心情，将来好翻'}</span>
          <button className="btn" onClick={addEntry} disabled={!text.trim()}>
            记下
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>今天的待办</span>
          <span className="more">
            {undone.length ? `${undone.length} 件没做` : '都做完了'}
          </span>
        </div>
        {undone.length === 0 && doneTodos.length === 0 && (
          <div className="empty">还没有待办，想到什么就写下来</div>
        )}
        {undone.map((t) => (
          <div className="row" key={t.id}>
            <button className="check" onClick={() => toggleTodo(t.id)} />
            <div className="body">
              <div className="text">{t.text}</div>
            </div>
            <button className="del" onClick={() => delTodo(t.id)}>
              ×
            </button>
          </div>
        ))}
        {doneTodos.map((t) => (
          <div className="row done" key={t.id}>
            <button className="check on" onClick={() => toggleTodo(t.id)}>
              ✓
            </button>
            <div className="body">
              <div className="text">{t.text}</div>
            </div>
            <button className="del" onClick={() => delTodo(t.id)}>
              ×
            </button>
          </div>
        ))}
        <div className="line-input">
          <input
            value={todoText}
            onChange={(e) => setTodoText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="加一件要做的事"
          />
          <button className="btn sm" onClick={addTodo}>
            加
          </button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="card">
          <div className="card-title">
            <span>之前没做完</span>
            <span className="more">可以挪到今天</span>
          </div>
          {overdue.map((t) => (
            <div className="row" key={t.id}>
              <button className="check" onClick={() => toggleTodo(t.id)} />
              <div className="body">
                <div className="text">{t.text}</div>
                <div className="meta">{fmtShort(t.date)} 留下来的</div>
              </div>
              <button className="btn sm ghost" onClick={() => moveToToday(t.id)}>
                挪今天
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-title">
          <span>在坚持的事</span>
          <button className="more" onClick={() => setShowGoal(true)}>
            + 立一个
          </button>
        </div>
        {state.goals.length === 0 && (
          <div className="empty">目标是打卡型的，比如连续跑步 30 天</div>
        )}
        {state.goals.map((g) => {
          const punchToday = g.records.includes(today)
          const streak = streakOf(g.records)
          const pct = Math.min(100, Math.round((g.records.length / g.targetDays) * 100))
          return (
            <div className="goal" key={g.id}>
              <div className="goal-head">
                <div>
                  <div className="goal-name">{g.name}</div>
                  <div className="meta">
                    已打卡 {g.records.length} 天 / 目标 {g.targetDays} 天
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="streak">连续 {streak} 天</span>
                  <button className="btn sm" onClick={() => punch(g)} disabled={punchToday}>
                    {punchToday ? '今日已打' : '打卡'}
                  </button>
                </div>
              </div>
              <div className="bar">
                <i style={{ width: pct + '%' }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button className="del" onClick={() => delGoal(g.id)}>
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hint" style={{ textAlign: 'center', marginTop: 18 }}>
        {fmtFull(today)}
      </div>

      {showGoal && <GoalSheet onClose={() => setShowGoal(false)} onCreate={addGoal} />}
    </div>
  )
}

function GoalSheet({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [days, setDays] = useState('30')
  return (
    <Sheet title="立一个目标" onClose={onClose}>
      <div className="field">
        <label>想坚持做的事</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="比如：每天走一万步"
        />
      </div>
      <div className="field">
        <label>打算坚持多少天</label>
        <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" />
      </div>
      <div className="sheet-foot">
        <button className="btn ghost" onClick={onClose}>
          算了
        </button>
        <button
          className="btn"
          onClick={() => {
            if (!name.trim()) return
            onCreate(name.trim(), days)
            onClose()
          }}
        >
          立下
        </button>
      </div>
    </Sheet>
  )
}
