import React from 'react'
import { MOODS } from '../lib/moods.js'

export default function MoodPicker({ value, onChange }) {
  return (
    <div className="mood-row">
      {MOODS.map((m) => {
        const on = value === m.id
        return (
          <button
            key={m.id}
            className={'mood-chip' + (on ? ' on' : '')}
            style={on ? { color: m.color, borderColor: m.color } : null}
            onClick={() => onChange(on ? null : m.id)}
          >
            <span className="em">{m.emoji}</span>
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
