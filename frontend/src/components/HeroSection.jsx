import React, { useState, useEffect } from 'react';
import heroImage1 from '../assets/hero-bg3.jpg';
import heroImage2 from '../assets/hero-bg2.jpg';
import heroImage3 from '../assets/hero-bg.jpg';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [heroImage1, heroImage2, heroImage3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative mt-[80px] sm:mt-[80px] flex justify-center items-center px-4 sm:px-6">
      <div className="w-full md:w-[95%] rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-lg">
        {/* Carousel Container */}
        <div className="relative h-[400px] sm:h-[450px] md:h-[500px]">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Hero ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Overlay content */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center p-4 sm:p-6 md:p-10">
          <div className="max-w-xs sm:max-w-lg md:max-w-3xl space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              Discover Amazing <span className="text-blue-400">Events</span><br className="hidden sm:block" />
              and Unforgettable Experiences
            </h1>
            <p className="text-sm sm:text-base md:text-xl font-light text-gray-200 drop-shadow max-w-lg mx-auto">
              Find and book events that match your vibe — all in one place
            </p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium text-base sm:text-lg transition-colors duration-200 shadow-lg">
              See Events
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
