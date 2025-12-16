import React from 'react';

type Props = {
  children: React.ReactNode;
  label?: string;
};

type State = {
  hasError: boolean;
  error?: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Panel error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="font-semibold text-destructive mb-1">{this.props.label || 'Something went wrong'}</div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {this.state.error?.message || 'Unknown error'}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
