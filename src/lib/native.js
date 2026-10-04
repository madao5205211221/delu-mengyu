// 原生能力封装。
// 关键点：网页（浏览器里跑）没有原生插件，所有调用都要能安全降级，
// 否则 dev 调试时直接白屏。

import { Capacitor } from '@capacitor/core'

/**
 * 处理状态栏 / 安全区。
 *
 * 背景：Android 15（API 35）起系统强制 edge-to-edge，应用内容默认铺到
 * 状态栏和导航栏下面。如果不给顶栏让出高度，标题就会被时间、电量那一条压住。
 *
 * 注意：StatusBar 插件的 setOverlaysWebView / setBackgroundColor 在
 * Android 15+ 上已失效（系统接管），能指望的只有 setStyle（图标明暗）。
 * 所以安全区高度优先靠 CSS env()，插件只作为拿不到 env() 时的补充。
 */
export async function setupStatusBar() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')

    // 图标用深色，配合浅色纸底（这是 Android 15+ 上仍有效的少数设置）
    await StatusBar.setStyle({ style: Style.Light })

    // 查高度写进 CSS 变量，供顶栏 padding 使用。
    // Android 15+ 上 getInfo().height 可能返回 0，那就交给 CSS env() 兜底。
    const info = await StatusBar.getInfo()
    const h = info && typeof info.height === 'number' ? info.height : 0
    if (h > 0) {
      document.documentElement.style.setProperty('--safe-top', h + 'px')
    }
  } catch (e) {
    // 浏览器环境 / 插件不可用：交给 CSS 的 env(safe-area-inset-top) 兜底
    console.warn('[native] status bar setup skipped:', e && e.message)
  }

  // 底部导航栏：CSS env() 大多数 WebView 能拿到，拿不到时按屏幕与视口差值估算
  try {
    const bottom = probeBottomInset()
    if (bottom > 0) {
      document.documentElement.style.setProperty('--safe-bottom', bottom + 'px')
    }
  } catch (e) {
    /* 忽略，CSS env() 兜底 */
  }
}

/**
 * 估算底部安全区高度。
 * 优先信任 CSS env(safe-area-inset-bottom)；如果那是 0，
 * 试试 visualViewport 计算（键盘/导航栏会体现在差值里）。
 */
function probeBottomInset() {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden;'
  document.body.appendChild(probe)
  const fromEnv = probe.getBoundingClientRect().height
  document.body.removeChild(probe)
  return Math.round(fromEnv) || 0
}

/** 是否跑在原生壳里（可用于决定要不要显示「导出到文件」等原生专属入口） */
export const isNative = () => Capacitor.isNativePlatform()
