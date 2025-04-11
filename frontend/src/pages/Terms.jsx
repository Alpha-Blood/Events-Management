import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-12">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: March 2024</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Event Booking. By accessing or using our website, mobile application, or services, 
              you agree to be bound by these Terms of Service. Please read these terms carefully before 
              using our services.
            </p>
          </section>

          {/* User Agreements */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Agreements</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                By using our services, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* Ticket Purchases */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Ticket Purchases</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                When purchasing tickets through our platform:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>All ticket sales are final unless otherwise stated</li>
                <li>Tickets may not be resold or transferred without authorization</li>
                <li>We reserve the right to cancel tickets obtained in violation of our policies</li>
                <li>Refunds are subject to event organizer policies</li>
              </ul>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
            <p className="text-gray-600 mb-4">
              We accept various payment methods including credit cards, M-Pesa, and PayPal. All payments 
              are processed securely through our platform. Additional fees may apply for certain payment methods.
            </p>
          </section>

          {/* Cancellation Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation Policy</h2>
            <p className="text-gray-600 mb-4">
              Event organizers may have different cancellation policies. Generally, refunds are available 
              up to 48 hours before the event, unless otherwise specified. Processing fees are non-refundable.
            </p>
          </section>

          {/* Privacy and Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data</h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Please review our{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide reliable services but cannot guarantee uninterrupted access. We are not 
              liable for any indirect, incidental, or consequential damages arising from your use of our services.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-800">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms; 