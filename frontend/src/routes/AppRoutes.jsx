import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Contact from '../pages/Contact';
import HelpCenter from '../pages/HelpCenter';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import OAuthCallback from '../pages/OAuthCallback';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="contact" element={<Contact />} />
        <Route path="help" element={<HelpCenter />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="auth/google/callback" element={<OAuthCallback />} />
        <Route path="auth/facebook/callback" element={<OAuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
