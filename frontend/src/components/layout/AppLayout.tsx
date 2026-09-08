import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NoticeTicker } from '../common/NoticeTicker';
import { PwaInstallBanner } from '../common/PwaInstallBanner';

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
        
        <main className="portal-content">
          <div className="container-fluid p-3 p-lg-4">
            <Outlet />
          </div>
        </main>
      </div>

      <PwaInstallBanner />
    </div>
  );
};