import React from 'react';
import SearchBar from './SearchBar';

const SearchSection = () => {
  return (
    <section className="relative -mt-6 mb-12">
      <div className="w-11/12 max-w-sm sm:max-w-5xl mx-auto px-2 sm:px-12">
        <div className="bg-white sm:bg-transparent p-0 sm:p-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default SearchSection; 