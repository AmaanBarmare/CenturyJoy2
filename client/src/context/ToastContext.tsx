import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'error';
interface Toast { id: number; message: string; type: ToastType; }

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="ic">{t.type === 'success' ? '✓' : t.type === 'error' ? '!' : '✉'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
