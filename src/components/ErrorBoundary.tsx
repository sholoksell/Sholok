
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-red-50 text-red-900">
                    <div className="max-w-xl w-full bg-white rounded-lg shadow-xl p-8 border border-red-200">
                        <h1 className="text-2xl font-bold mb-4 text-red-700">Something went wrong</h1>
                        <p className="mb-4 text-sm text-red-600">
                            The application encountered an error and could not render.
                        </p>
                        <div className="bg-red-50 p-4 rounded overflow-auto border border-red-100 mb-6">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
