import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 transition-colors duration-200">
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-16 pb-12">
        {children}
      </main>
      <BottomBar />
    </div>
  );
};

export default Layout