// Google Analytics utility
let gaInitialized = false

/**
 * Initialize Google Analytics
 */
export const initAnalytics = (measurementId) => {
  if (gaInitialized || !measurementId) return

  // Load gtag script
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script1)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', measurementId, {
    page_path: window.location.pathname
  })

  gaInitialized = true
  console.log('✅ Google Analytics initialized')
}

/**
 * Track page view
 */
export const trackPageView = (path) => {
  if (!window.gtag) return

  window.gtag('config', process.env.VITE_GA_MEASUREMENT_ID, {
    page_path: path || window.location.pathname
  })
}

/**
 * Track event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (!window.gtag) return

  window.gtag('event', eventName, eventParams)
}

/**
 * Track conversion (e.g., order completion)
 */
export const trackConversion = (orderId, value, currency = 'TRY') => {
  if (!window.gtag) return

  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    value: value,
    currency: currency,
    items: []
  })
}

/**
 * Track add to cart
 */
export const trackAddToCart = (productId, productName, price, quantity) => {
  if (!window.gtag) return

  window.gtag('event', 'add_to_cart', {
    currency: 'TRY',
    value: price * quantity,
    items: [{
      item_id: productId,
      item_name: productName,
      price: price,
      quantity: quantity
    }]
  })
}

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (value) => {
  if (!window.gtag) return

  window.gtag('event', 'begin_checkout', {
    currency: 'TRY',
    value: value
  })
}
