import React, { useState } from 'react'
import { THEMES, DEFAULT_THEME, isValidHex } from '../lib/theme.js'

export default function ThemePicker({ theme, onChange, toast }) {
  const [customPrimary, setCustomPrimary] = useState('')
  const [customAccent, setCustomAccent] = useState('')
  const [customPaper, setCustomPaper] = useState('')
  const [msg, setMsg] = useState('')

  const pickTheme = (t) => {
    onChange({ ...t })
    setMsg('')
  }

  const applyCustom = (key, raw, reset) => {
    const hex = String(raw || '').trim()
    if (!hex.startsWith('#')) {
      setMsg('色值要以 # 开头，比如 #3e6b54')
      return
    }
    if (!isValidHex(hex)) {
      setMsg('这个色值看不懂，格式应像 #3e6b54')
      return
    }
    onChange({ ...theme, id: 'custom', name: '自定义', [key]: hex.toLowerCase() })
    reset('')
    setMsg('已应用')
    if (toast) toast('换好了')
  }

  const swatches = [
    { key: 'paper', title: '纸底色', hint: '整页的底，最影响纸感', value: customPaper, set: setCustomPaper },
    { key: 'primary', title: '主色', hint: '按钮、标题、选中的日子', value: customPrimary, set: setCustomPrimary },
    { key: 'accent', title: '点缀色', hint: '纪念日天数、灵感的边', value: customAccent, set: setCustomAccent },
  ]

  return (
    <div>
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>得鹿梦鱼</span>
          <span style={{ color: 'var(--green)', fontSize: 20 }}>☀</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 10 }}>
          今天想记点什么…
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ background: 'var(--green)', color: '#fff', padding: '5px 14px', borderRadius: 999, fontSize: 13 }}>
            记下
          </span>
          <span style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '5px 12px', borderRadius: 999, fontSize: 13 }}>
            开心
          </span>
          <span style={{ color: 'var(--clay)', fontSize: 13, marginLeft: 'auto' }}>连续 7 天</span>
        </div>
      </div>

      <div className="field">
        <label>整套配色</label>
        <div className="theme-row">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={'theme-dot' + (theme.id === t.id ? ' on' : '')}
              onClick={() => pickTheme(t)}
              title={t.name}
            >
              <span className="dot" style={{ background: t.primary }} />
              <span className="nm">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {swatches.map((s) => (
        <div className="field" key={s.key}>
          <label>
            {s.title}　<span style={{ color: 'var(--ink-3)' }}>当前 {theme[s.key]}</span>
          </label>
          <div className="cat-row">
            <input
              className="flex-input"
              placeholder="#3e6b54"
              value={s.value}
              onChange={(e) => s.set(e.target.value)}
            />
            <button className="btn sm" onClick={() => applyCustom(s.key, s.value, s.set)}>
              应用
            </button>
          </div>
          <div className="hint">{s.hint}</div>
        </div>
      ))}

      <button className="btn ghost" style={{ width: '100%' }} onClick={() => onChange({ ...DEFAULT_THEME })}>
        恢复默认（宣纸墨绿）
      </button>

      {msg && (
        <div className="hint" style={{ marginTop: 10, color: 'var(--green)' }}>
          {msg}
        </div>
      )}
    </div>
  )
}
