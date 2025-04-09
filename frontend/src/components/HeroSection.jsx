import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
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
        <div className="relative h-[500px] sm:h-[550px] md:h-[600px]">
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
            <div className="w-full mt-6 sm:mt-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
