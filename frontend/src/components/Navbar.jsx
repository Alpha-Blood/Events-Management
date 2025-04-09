import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex items-center justify-between px-4 sm:px-16 py-3 bg-white shadow-md fixed top-0 left-0 z-50">
        {/* Desktop Nav Links - Hidden on Mobile */}
        <ul className="hidden md:flex items-center gap-8 text-gray-600 text-sm font-medium">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `hover:text-blue-500 transition ${isActive ? 'text-blue-600 font-semibold' : ''}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/events" 
              className={({ isActive }) => 
                `hover:text-blue-500 transition ${isActive ? 'text-blue-600 font-semibold' : ''}`
              }
            >
              Events
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/mytickets" 
              className={({ isActive }) => 
                `hover:text-blue-500 transition ${isActive ? 'text-blue-600 font-semibold' : ''}`
              }
            >
              My Tickets
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `hover:text-blue-500 transition ${isActive ? 'text-blue-600 font-semibold' : ''}`
              }
            >
            Contact Us
            </NavLink>
          </li>
        </ul>

        {/* Desktop Logo - Hidden on Mobile */}
        <NavLink to="/" className="hidden md:block text-2xl font-bold text-blue-600 pr-24">
          Eventico
        </NavLink>

        {/* Desktop Auth Buttons - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink 
            to="/login" 
            className={({ isActive }) => 
              `text-gray-600 hover:text-blue-500 transition text-sm font-medium ${isActive ? 'text-blue-600 font-semibold' : ''}`
            }
          >
            Log in
          </NavLink>
          <NavLink 
            to="/signup" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
          >
            Sign Up
          </NavLink>
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
          <NavLink to="/" className="text-xl font-bold text-blue-600">
            Eventico
          </NavLink>

          {/* Right Profile Button */}
          <NavLink to="/profile" className="text-gray-600 hover:text-blue-500 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NavLink>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Semi-transparent backdrop */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 right-0 h-[50vh] bg-white/80 backdrop-blur-md z-40 md:hidden pt-16 rounded-b-3xl shadow-lg">
            <div className="h-full p-4 flex items-center justify-center">
              <ul className="space-y-6 text-center">
                <li>
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                      `text-gray-700 hover:text-blue-500 transition cursor-pointer text-lg ${isActive ? 'text-blue-600 font-semibold' : ''}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/events" 
                    className={({ isActive }) => 
                      `text-gray-700 hover:text-blue-500 transition cursor-pointer text-lg ${isActive ? 'text-blue-600 font-semibold' : ''}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Events
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/mytickets" 
                    className={({ isActive }) => 
                      `text-gray-700 hover:text-blue-500 transition cursor-pointer text-lg ${isActive ? 'text-blue-600 font-semibold' : ''}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Tickets
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/contact" 
                    className={({ isActive }) => 
                      `text-gray-700 hover:text-blue-500 transition cursor-pointer text-lg ${isActive ? 'text-blue-600 font-semibold' : ''}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Us
                  </NavLink>
                </li>
                
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
