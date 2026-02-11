import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'

const apiBase = API_URL.includes('/api') ? API_URL : `${API_URL}/api`

export function usePageContent(slug) {
  const [pageTitle, setPageTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`${apiBase}/pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.page) {
          setPageTitle(data.page.pageTitle || slug)
          setContent(data.page.content || '')
        } else {
          setError(data.error || 'Yüklenemedi')
        }
      })
      .catch(err => {
        setError(err.message || 'Yüklenemedi')
      })
      .finally(() => setLoading(false))
  }, [slug])

  return { pageTitle, content, loading, error }
}
