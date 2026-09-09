import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NoticeTicker } from '../common/NoticeTicker';
import { PwaInstallBanner } from '../common/PwaInstallBanner';

import { ErrorBoundary } from '../feedback/ErrorBoundary';

import { LiveSystemBadge } from '../common/LiveSystemBadge';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="portal-wrapper">
      <NoticeTicker />
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="portal-body">
        <Sidebar isOpen={sidebarOpen} onCloseMobile={closeSidebar} />
        
        <main className="portal-content d-flex flex-column justify-content-between min-vh-100">
          <div className="container-fluid p-3 p-lg-4">
            {/* Mobile Top Live Info Strip */}
            <div className="d-md-none mb-2.5">
              <LiveSystemBadge variant="login" showDate={false} className="shadow-xs py-1 px-2 border-0 bg-light" />
            </div>

            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>

          {/* Institutional Global Footer with Live Time & IP */}
          <footer className="mt-auto border-top bg-white py-2 px-3 shadow-xs">
            <div className="container-fluid px-0">
              <LiveSystemBadge variant="footer" />
            </div>
          </footer>
        </main>
      </div>

      <PwaInstallBanner />
    </div>
  );
};