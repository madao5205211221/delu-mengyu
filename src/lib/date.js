const WEEKDAY_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

export function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey() {
  return toKey(new Date())
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function weekdayCN(key) {
  return WEEKDAY_CN[parseKey(key).getDay()]
}

// 10月4日
export function fmtShort(key) {
  const d = parseKey(key)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 2026年10月4日 周日
export function fmtFull(key) {
  return `${parseKey(key).getFullYear()}年${fmtShort(key)} ${weekdayCN(key)}`
}

// 距离今天还有几天（负数表示已经过去几天）
export function daysFromToday(key) {
  const a = new Date()
  a.setHours(0, 0, 0, 0)
  const b = parseKey(key)
  b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / 86400000)
}

// 把纪念日换算到下一次到达的日期（年度重复）
export function nextAnniversary(key, repeatYearly) {
  const d = parseKey(key)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  if (!repeatYearly) return d
  let next = new Date(now.getFullYear(), d.getMonth(), d.getDate())
  if (next < now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate())
  return next
}

export function yearsPassed(key) {
  const d = parseKey(key)
  const now = new Date()
  let y = now.getFullYear() - d.getFullYear()
  const before =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
  if (before) y -= 1
  return y
}

// 某年某月的日历格：前后补 null 对齐到周一开始
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const total = new Date(year, month + 1, 0).getDate()
  // getDay(): 0 周日，转成周一为 0
  const lead = (first.getDay() + 6) % 7
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(toKey(new Date(year, month, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function sameMonthDay(key, month, day) {
  const d = parseKey(key)
  return d.getMonth() + 1 === month && d.getDate() === day
}
