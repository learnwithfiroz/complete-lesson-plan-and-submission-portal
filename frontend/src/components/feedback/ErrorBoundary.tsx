import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
          <Container style={{ maxWidth: '520px' }}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden text-center p-4">
              <div className="mx-auto mb-3 p-3 bg-danger-subtle rounded-circle text-danger d-inline-flex">
                <AlertTriangle size={36} />
              </div>
              <h3 className="fs-5 fw-bold text-dark mb-2">
                একটি অপ্রত্যাশিত ত্রুটি ঘটেছে (Application Error)
              </h3>
              <p className="text-muted fs-7 mb-4">
                পেজটি লোড করার সময় কিছু সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিলোড করুন অথবা ড্যাশবোর্ডে ফিরে যান।
              </p>
              {this.state.error && (
                <div className="bg-light p-3 rounded-3 text-start mb-4 fs-8 font-monospace text-danger border overflow-auto" style={{ maxHeight: '120px' }}>
                  {this.state.error.message}
                </div>
              )}
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  variant="primary"
                  className="d-flex align-items-center gap-2 rounded-3 px-3 py-2 btn-institutional fw-bold"
                  onClick={this.handleReload}
                >
                  <RefreshCw size={16} />
                  <span>পেজ রিলোড করুন</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                  onClick={this.handleGoHome}
                >
                  <Home size={16} />
                  <span>ড্যাশবোর্ড</span>
                </Button>
              </div>
            </Card>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}
