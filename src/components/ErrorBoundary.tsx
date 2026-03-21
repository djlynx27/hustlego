import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional UI to render instead of the default fallback */
  fallback?: ReactNode;
  /** Called when an error is caught — use for logging/observability */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * ErrorBoundary — ISO 25010 Reliability / Recoverability
 *
 * Catches render-phase errors in the subtree and shows a user-friendly
 * recovery UI instead of crashing the whole app. Fires `onError` for
 * structured observability logging.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    // Forward to structured logger when available
    logger.error('ErrorBoundary caught unhandled render error', {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 500),
      componentStack: info.componentStack?.slice(0, 500),
    });
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          <div>
            <p className="font-display font-bold text-destructive">
              Erreur inattendue
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {this.state.error.message}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import logger lazily to avoid circular deps
import { logger } from '@/lib/logger';
