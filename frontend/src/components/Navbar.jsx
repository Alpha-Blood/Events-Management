import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, we should still clear local state
      logout();
      navigate('/');
    }
  };

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
              to="/my-tickets" 
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
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink 
                to="/login" 
                className={({ isActive }) => 
                  `text-gray-600 hover:text-blue-500 transition text-sm font-medium ${isActive ? 'text-blue-600 font-semibold' : ''}`
                }
              >
                Log in
              </NavLink>
              <NavLink 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
              >
                Sign Up
              </NavLink>
            </>
          )}
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
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          ) : (
            <NavLink to="/login" className="text-gray-600 hover:text-blue-500 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </NavLink>
          )}
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
                    to="/my-tickets" 
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
                {isAuthenticated && (
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-red-600 hover:text-red-700 transition cursor-pointer text-lg"
                    >
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
