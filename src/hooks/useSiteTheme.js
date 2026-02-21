import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'

const apiBase = API_URL.includes('/api') ? API_URL : `${API_URL}/api`

const KEY_TO_CSS_VAR = {
  primaryColor: '--primary-color',
  primaryDark: '--primary-dark',
  primaryLight: '--primary-light',
  secondaryColor: '--secondary-color',
  textColor: '--text-color',
  textLight: '--text-light',
  bgColor: '--bg-color',
  bgLight: '--bg-light',
  bgGray: '--bg-gray',
  borderColor: '--border-color'
}

export function applyTheme(theme) {
  if (!theme || typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(KEY_TO_CSS_VAR).forEach(([key, cssVar]) => {
    const value = theme[key]
    if (value && typeof value === 'string') {
      root.style.setProperty(cssVar, value.trim(), 'important')
    }
  })
}

export function useSiteTheme() {
  const [theme, setTheme] = useState(null)

  useEffect(() => {
    fetch(`${apiBase}/theme`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.theme) {
          setTheme(data.theme)
          applyTheme(data.theme)
          // CSS yüklendikten sonra tekrar uygula (önceliği garantilemek için)
          requestAnimationFrame(() => applyTheme(data.theme))
        }
      })
      .catch(() => {})
  }, [])

  return { theme, setTheme, applyTheme }
}
