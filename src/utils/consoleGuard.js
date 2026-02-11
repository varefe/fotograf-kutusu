/**
 * Konsol çıktılarını sadece admin kullanıcıya gösterir.
 * Uygulama başında console no-op yapılır; admin giriş yaptığında geri açılır.
 */

const noop = () => {}

let restored = false
let original = {}

export function initConsoleGuard() {
  if (typeof window === 'undefined') return
  original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console)
  }
  console.log = noop
  console.warn = noop
  console.error = noop
  console.info = noop
  console.debug = noop
  window.__restoreConsoleForAdmin = () => {
    if (restored) return
    restored = true
    console.log = original.log
    console.warn = original.warn
    console.error = original.error
    console.info = original.info
    console.debug = original.debug
  }
}

export function restoreConsoleForAdmin() {
  if (typeof window !== 'undefined' && window.__restoreConsoleForAdmin) {
    window.__restoreConsoleForAdmin()
  }
}
