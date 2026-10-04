// 主题：一套色 = 纸底色 + 主色 + 点缀色 + 墨色。
// 只换主色不换纸底会串味，所以这里把整套一起派生出来写进 CSS 变量。

const KEY = 'delu-mengyu-theme-v1'

export const THEMES = [
  {
    id: 'xuan',
    name: '宣纸墨绿',
    paper: '#f7f1e6',
    primary: '#3e6b54',
    accent: '#c4703a',
    ink: '#3a342b',
  },
  {
    id: 'dai',
    name: '雨过黛青',
    paper: '#eff3f2',
    primary: '#2c4a5e',
    accent: '#a8763e',
    ink: '#2e3a38',
  },
  {
    id: 'feng',
    name: '霜叶枫红',
    paper: '#f7ede6',
    primary: '#8c4a32',
    accent: '#b8863b',
    ink: '#3d2e28',
  },
  {
    id: 'teng',
    name: '紫藤垂露',
    paper: '#f2eff5',
    primary: '#5b4b7a',
    accent: '#b0705a',
    ink: '#332e3b',
  },
  {
    id: 'song',
    name: '松烟入墨',
    paper: '#f1efea',
    primary: '#3a3a38',
    accent: '#8a7a5c',
    ink: '#2f2e2b',
  },
  {
    id: 'dian',
    name: '靛缸染布',
    paper: '#edf1f5',
    primary: '#2f4f7a',
    accent: '#c08a4e',
    ink: '#2c333b',
  },
]

export const DEFAULT_THEME = THEMES[0]

function toRgb(hex) {
  let h = String(hex || '').replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function toHex(r, g, b) {
  const c = (v) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function isValidHex(hex) {
  return !!toRgb(hex)
}

// ratio=0 返回 a，ratio=1 返回 b
export function mix(a, b, ratio) {
  const x = toRgb(a)
  const y = toRgb(b)
  if (!x || !y) return a
  return toHex(
    x.r + (y.r - x.r) * ratio,
    x.g + (y.g - x.g) * ratio,
    x.b + (y.b - x.b) * ratio
  )
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_THEME }
    const p = JSON.parse(raw)
    if (!isValidHex(p.paper) || !isValidHex(p.primary) || !isValidHex(p.accent)) {
      return { ...DEFAULT_THEME }
    }
    return {
      id: p.id || 'custom',
      name: p.name || '自定义',
      paper: p.paper,
      primary: p.primary,
      accent: p.accent,
      ink: isValidHex(p.ink) ? p.ink : DEFAULT_THEME.ink,
    }
  } catch (e) {
    return { ...DEFAULT_THEME }
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(KEY, JSON.stringify(theme))
  } catch (e) {
    console.error('主题保存失败', e)
  }
}

export function applyTheme(t) {
  const root = document.documentElement
  const { paper, primary, accent, ink } = t
  root.style.setProperty('--paper', paper)
  root.style.setProperty('--card', mix(paper, '#ffffff', 0.75))
  root.style.setProperty('--outside', mix(paper, ink, 0.14))
  root.style.setProperty('--ink', ink)
  root.style.setProperty('--ink-2', mix(ink, paper, 0.55))
  root.style.setProperty('--ink-3', mix(ink, paper, 0.74))
  root.style.setProperty('--line', mix(ink, paper, 0.88))
  root.style.setProperty('--green', primary)
  root.style.setProperty('--green-soft', mix(primary, paper, 0.85))
  root.style.setProperty('--clay', accent)
  root.style.setProperty('--clay-soft', mix(accent, paper, 0.88))
  root.style.setProperty('--danger', mix('#b84a3e', ink, 0.12))
}
