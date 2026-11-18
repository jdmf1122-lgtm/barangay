import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

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
        <div className="min-h-screen bg-paper flex items-center justify-center p-4 selection:bg-accent selection:text-accent-ink">
          <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-card space-y-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-error/10 border border-error/20 text-error flex items-center justify-center mx-auto" aria-hidden="true">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-ink">May naganap na error sa pag-load</h2>
              <p className="text-xs text-muted">
                A system error occurred while rendering the page. You can recover immediately using the buttons below.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-paper-3 border border-rule rounded-lg text-left text-xs font-mono text-error break-all max-h-36 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                id="btn-error-reload"
                onClick={() => {
                  (this as any).setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-accent hover:opacity-90 active:scale-[0.98] text-accent-ink rounded-lg text-xs font-medium transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reload system</span>
              </button>
              <button
                type="button"
                id="btn-error-signout"
                onClick={() => {
                  localStorage.removeItem('bconnect_roxas_auth_status_v11');
                  localStorage.removeItem('bconnect_roxas_user_v11');
                  window.location.reload();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-paper-3 hover:bg-paper-3/80 active:scale-[0.98] text-ink border border-rule rounded-lg text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign out and re-login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
