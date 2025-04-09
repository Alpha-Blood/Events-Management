import React from 'react';

const CallToAction = () => {
  return (
    <section className="relative py-16 sm:py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to Create Unforgettable Events?
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Join thousands of event organizers who are already using Eventico to create amazing experiences.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
            >
              Get Started
            </a>
            <a
              href="#"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="text-3xl font-bold text-blue-600">10K+</div>
            <div className="mt-2 text-sm text-gray-600">Active Events</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="text-3xl font-bold text-blue-600">50K+</div>
            <div className="mt-2 text-sm text-gray-600">Happy Attendees</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="text-3xl font-bold text-blue-600">100+</div>
            <div className="mt-2 text-sm text-gray-600">Event Categories</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-lg font-semibold text-gray-900">Trusted by Event Organizers Worldwide</h3>
            <div className="mt-6 flex items-center justify-center gap-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src={`https://i.pravatar.cc/150?img=${i}`}
                    alt={`User ${i}`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">500+</span> organizers trust us
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 