import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('B-CONNECT Runtime Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5fbf7] flex items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
              ⚠️
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">May naganap na error sa pag-load</h2>
              <p className="text-xs text-slate-600">
                A system error occurred while rendering the page. You can recover immediately using the buttons below.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-left text-xs font-mono text-rose-800 break-all max-h-36 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  (this as any).setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Reload System
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('bconnect_roxas_auth_status_v11');
                  localStorage.removeItem('bconnect_roxas_user_v11');
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Sign Out & Re-login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
