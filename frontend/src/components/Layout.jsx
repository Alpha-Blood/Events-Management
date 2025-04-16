import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';
import Footer from './Footer';

const Layout = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default Layout; 