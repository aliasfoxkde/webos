import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  appName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`ErrorBoundary [${this.props.appName ?? 'unknown'}]:`, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--os-bg-primary)] p-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: 'var(--os-error)' }}
          >
            !
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--os-text-primary)]">
              {this.props.appName ?? 'App'} encountered an error
            </p>
            <p className="mt-1 max-w-md text-xs text-[var(--os-text-muted)]">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
          </div>
          <button
            className="rounded-lg px-4 py-2 text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--os-accent)' }}
            onClick={this.handleRetry}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
