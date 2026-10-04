import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UNIVERSE UI RUNTIME ERROR', error, info);
  }

  render() {
    if (this.state.error) {
      return React.createElement('main', { style: { minHeight: '100vh', padding: '32px', background: '#020d1c', color: '#e6f7ff', fontFamily: 'system-ui, sans-serif' } },
        React.createElement('section', { style: { maxWidth: '900px', margin: '0 auto', border: '1px solid #185b88', padding: '24px', background: '#061c1c' } },
          React.createElement('h1', { style: { marginTop: 0 } }, 'Universe Civilization — UI Error'),
          React.createElement('p', null, 'The client encountered a runtime error instead of showing a blank page.'),
          React.createElement('pre', { style: { whiteSpace: 'pre-wrap', overflow: 'auto', background: '#000', padding: '16px' } }, this.state.error.message),
          React.createElement('button', { onClick: () => window.location.reload(), style: { padding: '10px 16px', cursor: 'pointer' } }, 'Reload Application')
        )
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('Application root element #root was not found.');
createRoot(root).render(<AppErrorBoundary><App /></AppErrorBoundary>);
