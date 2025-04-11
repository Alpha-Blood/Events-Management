import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { FooterWithSocialLinks } from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && <FooterWithSocialLinks />}
    </div>
  );
};

export default Layout; 