const KEY = 'delu-mengyu-v1'

export const EMPTY = {
  entries: [], // 回忆录：{ id, date, text, mood, createdAt }
  ideas: [], // 灵感：{ id, text, done, createdAt }
  todos: [], // 待办：{ id, date, text, done, createdAt }
  goals: [], // 目标：{ id, name, targetDays, records: [], createdAt, archived }
  anniversaries: [], // 纪念日：{ id, name, date, repeatYearly, note, createdAt }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    return { ...EMPTY, ...parsed }
  } catch (e) {
    console.error('读取本地数据失败', e)
    return { ...EMPTY }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.error('保存失败，可能空间已满', e)
  }
}

export function exportText(state) {
  return JSON.stringify({ app: '得鹿梦鱼', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2)
}

export function parseImport(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object') throw new Error('文件格式不对')
  const next = { ...EMPTY }
  for (const k of Object.keys(EMPTY)) {
    if (Array.isArray(data[k])) next[k] = data[k]
  }
  return next
}

export function countAll(state) {
  return (
    state.entries.length +
    state.ideas.length +
    state.todos.length +
    state.goals.length +
    state.anniversaries.length
  )
}
