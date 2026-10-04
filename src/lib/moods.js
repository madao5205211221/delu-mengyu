// 固定 10 种心情。不开放系统 emoji 键盘：心情要能统计，散了就没意义了。
export const MOODS = [
  { id: 'happy', emoji: '😄', label: '开心', color: '#E8A33D' },
  { id: 'calm', emoji: '😌', label: '平静', color: '#6E9C7F' },
  { id: 'expect', emoji: '✨', label: '期待', color: '#5B8FB9' },
  { id: 'moved', emoji: '🥹', label: '感动', color: '#D07C7C' },
  { id: 'tired', emoji: '😪', label: '疲惫', color: '#9B9184' },
  { id: 'anxious', emoji: '😖', label: '焦虑', color: '#B98A4B' },
  { id: 'sad', emoji: '😢', label: '难过', color: '#7C8FA3' },
  { id: 'angry', emoji: '😤', label: '生气', color: '#C25B4E' },
  { id: 'crash', emoji: '😫', label: '崩溃', color: '#8A6A9C' },
  { id: 'relief', emoji: '🍃', label: '释然', color: '#4E8E86' },
]

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m]))

export function getMood(id) {
  return MOOD_MAP[id] || null
}
