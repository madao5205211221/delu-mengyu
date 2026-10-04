import React, { useRef, useState } from 'react'
import Sheet from '../components/Sheet.jsx'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { exportText, parseImport, countAll, EMPTY } from '../lib/storage.js'
import { todayKey } from '../lib/date.js'

export default function Settings({ state, update, onClose, toast }) {
  const fileRef = useRef(null)
  const [confirming, setConfirming] = useState(false)

  const doExport = async () => {
    const text = exportText(state)
    const name = `得鹿梦鱼备份-${todayKey()}.json`
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await Filesystem.writeFile({
          path: name,
          data: text,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        })
        await Share.share({
          title: '得鹿梦鱼备份',
          files: [res.uri],
          dialogTitle: '保存备份到哪',
        })
        return
      }
    } catch (e) {
      console.warn('原生分享失败，改用下载', e)
    }
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast('已导出，看看下载目录')
  }

  const doImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const next = parseImport(text)
      if (!window.confirm('导入会覆盖现在手机上的全部内容，确定吗？')) return
      update(() => next)
      toast('导入好了')
      onClose()
    } catch (err) {
      toast('这个文件读不了：' + err.message)
    }
    e.target.value = ''
  }

  const clearAll = () => {
    if (!window.confirm('真的要清空全部内容吗？这一步没法撤销。')) return
    update(() => ({ ...EMPTY }))
    toast('都清掉了')
    setConfirming(false)
    onClose()
  }

  return (
    <Sheet title="设置与备份" onClose={onClose}>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">
          <span>现在存了这些</span>
        </div>
        <div className="meta">
          回忆 {state.entries.length} 条 · 灵感 {state.ideas.length} 条 · 待办{' '}
          {state.todos.length} 条 · 目标 {state.goals.length} 个 · 纪念日{' '}
          {state.anniversaries.length} 个
        </div>
      </div>

      <div className="hint" style={{ marginBottom: 12 }}>
        内容只存在这台手机里，不联网、不上传。卸载 App 或清理数据会全部丢失，
        所以隔一阵子导一次备份。
      </div>

      <button className="btn" style={{ width: '100%', marginBottom: 10 }} onClick={doExport}>
        导出备份（JSON 文件）
      </button>

      <button
        className="btn ghost"
        style={{ width: '100%', marginBottom: 10 }}
        onClick={() => fileRef.current?.click()}
      >
        从备份导入
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={doImport}
      />

      <button
        className="btn danger"
        style={{ width: '100%' }}
        onClick={clearAll}
      >
        清空全部内容
      </button>
    </Sheet>
  )
}
