import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F2EA] flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full">
            <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-lg p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full border border-[#A9812E]/60 flex items-center justify-center mx-auto mb-5 bg-[#121113] shadow-lg shadow-[#A9812E]/10">
                <AlertTriangle className="h-7 w-7 text-[#C9A860]" />
              </div>
              <h2 className="font-serif text-2xl text-[#1C1A16] mb-2">
                Algo salió mal
              </h2>
              <p className="text-sm text-[#6B6459] mb-6">
                Ocurrió un error inesperado. Por favor intenta nuevamente o vuelve al inicio.
              </p>
              {this.state.error && (
                <details className="text-left mb-6">
                  <summary className="text-xs text-[#9A9488] cursor-pointer hover:text-[#8B6A22] transition-colors">
                    Detalles del error
                  </summary>
                  <pre className="mt-2 p-3 bg-[#F6F2EA] border border-[#E4DCC9] rounded-lg text-xs text-[#8B2E2E] overflow-x-auto whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 btn-press shadow-sm w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </button>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#E4DCC9] rounded-lg text-sm font-medium text-[#6B6459] hover:text-[#8B6A22] hover:border-[#A9812E]/60 transition-all w-full sm:w-auto"
                >
                  Volver al Inicio
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
