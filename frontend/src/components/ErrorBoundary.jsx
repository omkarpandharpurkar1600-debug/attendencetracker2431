import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-primary, #0f172a)',
          color: 'var(--text-primary, #f1f5f9)',
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 16,
            padding: '48px 32px',
            maxWidth: 480,
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem' }}>Something went wrong</h2>
            <p style={{ color: 'rgba(241, 245, 249, 0.6)', marginBottom: 24, fontSize: '0.95rem' }}>
              An unexpected error occurred. Please reload the page to continue.
            </p>
            <p style={{ color: 'rgba(241, 245, 249, 0.4)', fontSize: '0.8rem', marginBottom: 24, fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 32px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
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
