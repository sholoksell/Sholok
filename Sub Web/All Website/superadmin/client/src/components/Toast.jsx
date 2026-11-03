import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((title, message = '', kind = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, title, message, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200)
  }, [])

  const remove = id => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast${toast.kind === 'error' ? ' error' : ''}`}>
            {toast.kind === 'error'
              ? <AlertCircle size={16} />
              : <CheckCircle size={16} />
            }
            <div>
              <strong>{toast.title}</strong>
              {toast.message && <p>{toast.message}</p>}
            </div>
            <button className="toast-close" onClick={() => remove(toast.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
