import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmModal, setConfirmModal] = useState(null)

  const show = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const confirm = useCallback((message, title = 'Onay') => {
    return new Promise((resolve) => {
      setConfirmModal({
        title,
        message,
        onConfirm: () => {
          setConfirmModal(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmModal(null)
          resolve(false)
        }
      })
    })
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show, confirm }}>
      {children}
      {/* Toast list */}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: 'min(400px, calc(100vw - 2rem))',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="toast"
            style={{
              pointerEvents: 'auto',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              background: t.type === 'success' ? '#ecfdf5' : t.type === 'error' ? '#fef2f2' : '#f0f9ff',
              color: t.type === 'success' ? '#065f46' : t.type === 'error' ? '#991b1b' : '#0c4a6e',
              borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#0ea5e9'}`,
              animation: 'toastIn 0.3s ease',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => dismissToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  opacity: 0.7,
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Confirm modal */}
      {confirmModal && (
        <div
          className="confirm-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}
          onClick={confirmModal.onCancel}
        >
          <div
            className="confirm-modal"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'toastIn 0.2s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem' }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#475569', whiteSpace: 'pre-wrap' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={confirmModal.onCancel}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      show: (msg) => {},
      confirm: () => Promise.resolve(false)
    }
  }
  return ctx
}
