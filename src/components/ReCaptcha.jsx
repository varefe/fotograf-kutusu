import { useEffect, useRef } from 'react'

// reCAPTCHA v3 hook
export const useReCaptcha = (siteKey) => {
  const recaptchaRef = useRef(null)
  const isReady = useRef(false)

  useEffect(() => {
    if (!siteKey) return

    if (window.grecaptcha) {
      isReady.current = true
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          isReady.current = true
          recaptchaRef.current = true
        })
      }
    }

    return () => {
      // Cleanup if needed
    }
  }, [siteKey])

  const execute = async (action = 'submit') => {
    if (!siteKey) {
      console.warn('reCAPTCHA site key not provided')
      return null
    }

    if (!window.grecaptcha || !isReady.current) {
      console.warn('reCAPTCHA not ready, waiting...')
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 500))
      if (!window.grecaptcha) {
        console.warn('reCAPTCHA still not ready')
        return null
      }
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action })
      return token
    } catch (error) {
      console.error('reCAPTCHA error:', error)
      return null
    }
  }

  return { execute, isReady: isReady.current }
}

export default useReCaptcha
