import React from 'react'

export default function Sheet({ title, onClose, children }) {
  return (
    <div className="mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}
