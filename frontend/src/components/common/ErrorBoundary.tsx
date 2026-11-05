import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FAF8F5] text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-base font-bold text-[#262320] mb-2">表单渲染遇到问题</h2>
          <p className="text-xs text-[#7C7670] max-w-md mb-4 font-mono break-all">
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 bg-[#E25C1D] text-white text-xs font-bold rounded-lg hover:bg-[#c94e16] transition shadow-sm"
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
