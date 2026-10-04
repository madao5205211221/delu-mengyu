import React, { useEffect, useRef, useState } from 'react'
import Today from './pages/Today.jsx'
import Memory from './pages/Memory.jsx'
import Anniversary from './pages/Anniversary.jsx'
import Idea from './pages/Idea.jsx'
import Settings from './pages/Settings.jsx'
import { loadState, saveState } from './lib/storage.js'
import { fmtFull, todayKey } from './lib/date.js'

const TABS = [
  { id: 'today', ic: '☀️', label: '今日' },
  { id: 'memory', ic: '📖', label: '回忆' },
  { id: 'anni', ic: '🎐', label: '纪念日' },
  { id: 'idea', ic: '💡', label: '灵感' },
]

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('today')
  const [showSettings, setShowSettings] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const update = (fn) => setState((prev) => fn(prev))

  const toast = (msg) => {
    setToastMsg(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToastMsg(''), 1800)
  }

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <h1>得鹿梦鱼</h1>
          <div className="sub">{fmtFull(todayKey()).replace(' 周', ' 星期')}</div>
        </div>
        <button className="icon-btn" onClick={() => setShowSettings(true)}>
          ⚙
        </button>
      </div>

      {tab === 'today' && <Today state={state} update={update} toast={toast} />}
      {tab === 'memory' && <Memory state={state} update={update} toast={toast} />}
      {tab === 'anni' && <Anniversary state={state} update={update} toast={toast} />}
      {tab === 'idea' && <Idea state={state} update={update} toast={toast} />}

      <div className="tabbar">
        <div className="tabbar-in">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={'tab' + (tab === t.id ? ' on' : '')}
              onClick={() => setTab(t.id)}
            >
              <span className="ic">{t.ic}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {showSettings && (
        <Settings
          state={state}
          update={update}
          toast={toast}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  )
}
