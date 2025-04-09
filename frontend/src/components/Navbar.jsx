import React, { useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex items-center justify-between  px-4 sm:px-16 py-3 bg-white shadow-md fixed top-0 left-0 z-50">
        {/* Desktop Nav Links - Hidden on Mobile */}
        <ul className="hidden md:flex items-center gap-8 text-gray-600 text-sm font-medium">
          <li className="cursor-pointer hover:text-blue-500 transition">Home</li>
          <li className="cursor-pointer hover:text-blue-500 transition">Events</li>
          <li className="cursor-pointer hover:text-blue-500 transition">Explore</li>
          <li className="cursor-pointer hover:text-blue-500 transition">About</li>
        </ul>

        {/* Desktop Logo - Hidden on Mobile */}
        <div className="hidden md:block text-2xl font-bold text-blue-600 pr-24">
          Eventico
        </div>

        {/* Desktop Auth Buttons - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-gray-600 hover:text-blue-500 transition text-sm font-medium">
            Log in
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition">
            Sign Up
          </button>
        </div>

        {/* Mobile Layout */}
        <div className="w-full md:hidden flex items-center justify-between">
          {/* Left Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-blue-500 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile Logo - Hidden on Desktop */}
          <div className="text-xl font-bold text-blue-600">
            Eventico
          </div>

          {/* Right Profile Button */}
          <button className="text-gray-600 hover:text-blue-500 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden pt-16">
          <div className="p-4 space-y-4">
            <ul className="space-y-4">
              <li className="text-gray-600 hover:text-blue-500 transition cursor-pointer">Home</li>
              <li className="text-gray-600 hover:text-blue-500 transition cursor-pointer">Events</li>
              <li className="text-gray-600 hover:text-blue-500 transition cursor-pointer">Explore</li>
              <li className="text-gray-600 hover:text-blue-500 transition cursor-pointer">About</li>
            </ul>
      
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
