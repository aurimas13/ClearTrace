import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  ttl: number; // ms
}

interface ToastContextValue {
  push: (kind: ToastKind, title: string, message?: string, ttlMs?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Fallback: log to console so callers don't crash if rendered outside provider.
    return {
      push: (k: ToastKind, t: string, m?: string) => console.log(`[toast/${k}]`, t, m),
      success: (t: string, m?: string) => console.log('[toast/success]', t, m),
      error: (t: string, m?: string) => console.error('[toast/error]', t, m),
      info: (t: string, m?: string) => console.log('[toast/info]', t, m),
      warning: (t: string, m?: string) => console.warn('[toast/warning]', t, m),
    } as ToastContextValue;
  }
  return ctx;
}

const KIND_META: Record<
  ToastKind,
  { Icon: typeof CheckCircle2; ring: string; bar: string; iconColor: string; bg: string }
> = {
  success: {
    Icon: CheckCircle2,
    ring: 'ring-emerald-200',
    bar: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    bg: 'bg-white',
  },
  error: {
    Icon: AlertCircle,
    ring: 'ring-red-200',
    bar: 'bg-red-500',
    iconColor: 'text-red-600',
    bg: 'bg-white',
  },
  warning: {
    Icon: AlertTriangle,
    ring: 'ring-amber-200',
    bar: 'bg-amber-500',
    iconColor: 'text-amber-600',
    bg: 'bg-white',
  },
  info: {
    Icon: Info,
    ring: 'ring-blue-200',
    bar: 'bg-blue-500',
    iconColor: 'text-blue-600',
    bg: 'bg-white',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback<ToastContextValue['push']>((kind, title, message, ttlMs = 4500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, kind, title, message, ttl: ttlMs }]);
  }, []);

  const value: ToastContextValue = {
    push,
    success: (t, m) => push('success', t, m),
    error: (t, m) => push('error', t, m, 7000),
    info: (t, m) => push('info', t, m),
    warning: (t, m) => push('warning', t, m, 6000),
  };

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const meta = KIND_META[toast.kind];
  const Icon = meta.Icon;
  useEffect(() => {
    const t = window.setTimeout(onDismiss, toast.ttl);
    return () => window.clearTimeout(t);
  }, [toast.ttl, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto relative overflow-hidden ${meta.bg} border border-slate-200 ring-1 ${meta.ring} rounded-xl shadow-lg flex items-start gap-3 p-3 pr-9 animate-toast-in`}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${meta.bar}`} />
      <Icon className={`w-5 h-5 ${meta.iconColor} shrink-0 mt-0.5`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
