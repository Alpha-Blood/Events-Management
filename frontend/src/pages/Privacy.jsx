import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-12">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: March 2024</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our event booking platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Name and contact information</li>
                <li>Email address and phone number</li>
                <li>Billing and payment information</li>
                <li>Account login credentials</li>
                <li>Event preferences and booking history</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mt-6">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Website activity and interactions</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4">
              <p className="text-gray-600">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Process your ticket purchases and payments</li>
                <li>Send booking confirmations and updates</li>
                <li>Provide customer support</li>
                <li>Improve our services and user experience</li>
                <li>Send relevant marketing communications (with your consent)</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Event organizers (for event management)</li>
              <li>Payment processors (for transaction processing)</li>
              <li>Service providers (for platform operations)</li>
              <li>Legal authorities (when required by law)</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information, including 
              encryption, secure servers, and regular security assessments. However, no method of 
              transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain data processing</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar tracking technologies to improve your browsing experience, 
              analyze site traffic, and understand where our visitors come from. You can control 
              cookies through your browser settings.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-800">
                contact us
              </Link>
              . You can also review our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 