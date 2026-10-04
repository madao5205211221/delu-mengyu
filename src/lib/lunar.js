// 农历 + 节气 + 传统节日 + 公历节日
// 农历算法用经典的 1900-2100 年压缩数据表，纯本地无依赖，体积约 1KB。
// 只覆盖 1900-2100，超出范围返回 null，调用方要能容错。

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
]

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const MONTH_CN = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const DAY_CN = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]

// 节气：以 1900 年小寒为起点的分钟偏移
const TERM_INFO = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693,
  263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532,
  504758,
]
const TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
]

// 农历节日（农历月, 农历日）→ 名称
const LUNAR_FESTIVAL = {
  '1-1': '春节',
  '1-15': '元宵',
  '2-2': '龙抬头',
  '5-5': '端午',
  '7-7': '七夕',
  '7-15': '中元',
  '8-15': '中秋',
  '9-9': '重阳',
  '12-8': '腊八',
  '12-23': '小年',
}

// 公历节日（月, 日）→ 名称
const SOLAR_FESTIVAL = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节',
}

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function leapMonth(y) {
  return LUNAR_INFO[y - 1900] & 0xf
}

function leapDays(y) {
  if (!leapMonth(y)) return 0
  return LUNAR_INFO[y - 1900] & 0x10000 ? 30 : 29
}

function monthDays(y, m) {
  return LUNAR_INFO[y - 1900] & (0x10000 >> m) ? 30 : 29
}

// 某年正月初一对应的公历日期距 1900-01-31 的天数
function lunarYearDays(y) {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += LUNAR_INFO[y - 1900] & i ? 1 : 0
  }
  return sum + leapDays(y)
}

function daysBetween(y) {
  let offset = 0
  for (let i = 1900; i < y; i++) offset += lunarYearDays(i)
  return offset
}

// 公历 → 农历。返回 { year, month, day, isLeap, monthCN, dayCN, ganZhi, animal }
export function solarToLunar(y, m, d) {
  if (y < 1900 || y > 2100) return null
  const baseDate = Date.UTC(1900, 0, 31)
  const objDate = Date.UTC(y, m - 1, d)
  let offset = Math.floor((objDate - baseDate) / 86400000)

  let lunarYear = 1900
  let daysInYear = 0
  while (lunarYear <= 2100) {
    daysInYear = lunarYearDays(lunarYear)
    if (offset < daysInYear) break
    offset -= daysInYear
    lunarYear++
  }
  if (lunarYear > 2100) return null

  const leap = leapMonth(lunarYear)
  let isLeap = false
  let lunarMonth = 1
  while (lunarMonth <= 12) {
    let days
    if (leap > 0 && lunarMonth === leap + 1 && !isLeap) {
      isLeap = true
      days = leapDays(lunarYear)
    } else {
      days = monthDays(lunarYear, lunarMonth)
    }
    if (isLeap && lunarMonth === leap + 1) isLeap = false
    if (offset < days) break
    offset -= days
    lunarMonth++
  }

  const lunarDay = offset + 1
  const monthIdx = lunarMonth - 1
  const gzIdx = (lunarYear - 1900 + 36) % 60

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap,
    monthCN: (isLeap ? '闰' : '') + MONTH_CN[monthIdx],
    dayCN: DAY_CN[lunarDay - 1],
    ganZhi: GAN[gzIdx % 10] + ZHI[gzIdx % 12],
    animal: ANIMALS[(lunarYear - 1900 + 36) % 12],
  }
}

// 节气查询。注意不能用 getUTCDate()：基准时刻是 UTC，取 UTC 日会因时区偏移差一天。
// 这里统一按"基准 + 偏移后得到的那个日历日"来判定。
function termDay(y, n) {
  const minutes = 525948.76 * (y - 1900) + TERM_INFO[n]
  const t = new Date(Date.UTC(1900, 0, 6, 2, 5) + minutes * 60000)
  return { month: t.getUTCMonth() + 1, day: t.getUTCDate(), raw: t }
}

export function getTerm(y, m, d) {
  const idx = (m - 1) * 2
  for (const n of [idx, idx + 1]) {
    const t = termDay(y, n)
    if (t.month === m && t.day === d) return TERM_NAMES[n]
    // 容差：若算出的日期落在相邻一天（时区/浮点误差），也认
    const alt = new Date(t.raw.getTime() - 86400000)
    if (alt.getUTCMonth() + 1 === m && alt.getUTCDate() === d) return TERM_NAMES[n]
  }
  return null
}

// 汇总某天的农历信息
export function lunarInfo(y, m, d) {
  const l = solarToLunar(y, m, d)
  const term = getTerm(y, m, d)
  const festivals = []

  const solarKey = `${m}-${d}`
  if (SOLAR_FESTIVAL[solarKey]) festivals.push(SOLAR_FESTIVAL[solarKey])

  if (l) {
    const lunarKey = `${l.month}-${l.day}`
    if (!l.isLeap && LUNAR_FESTIVAL[lunarKey]) festivals.push(LUNAR_FESTIVAL[lunarKey])
    // 除夕：腊月最后一天
    if (l.month === 12 && !l.isLeap) {
      const last = monthDays(l.year, 12)
      if (l.day === last) festivals.push('除夕')
    }
  }

  if (term) festivals.push(term)

  let text = ''
  if (l) {
    if (l.day === 1) text = l.monthCN + '月'
    else text = l.dayCN
    if (lunarInfo._firstOfYear) text = l.monthCN + '月'
  }

  return {
    lunar: l,
    term,
    festivals,
    short: festivals.length ? festivals[0] : text,
    full: l ? `${l.ganZhi}年 ${l.monthCN}月${l.dayCN}` : '',
    isFestival: festivals.length > 0,
  }
}

// 农历某日 → 该年在公历中的日期（用于农历生日）
export function lunarToSolar(lunarMonth, lunarDay, solarYear) {
  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(solarYear, m, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const l = solarToLunar(solarYear, m, d)
      if (l && !l.isLeap && l.month === lunarMonth && l.day === lunarDay) {
        return { year: solarYear, month: m, day: d }
      }
    }
  }
  return null
}
