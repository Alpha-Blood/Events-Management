import React, { useState } from 'react';

const SearchBar = () => {
  const [dateValue, setDateValue] = useState('');

  return (
    <div className="border border-blue-600 rounded-2xl sm:rounded-25 shadow-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-4xl mx-auto">
      <div className="flex-1 w-full">
        <input
          type="text"
          placeholder="Search event, city or venue"
          className="w-full px-4  py-3 rounded-xl sm:rounded-15 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
        />
      </div>
      <div className="flex-1 w-full relative">
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="w-full px-4 py-3 rounded-xl sm:rounded-15 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-900 text-sm sm:text-base"
        />
        {!dateValue && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm sm:text-base">
          
          </span>
        )}
      </div>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl sm:rounded-full hover:bg-blue-900 transition w-full sm:w-auto text-sm sm:text-base font-medium">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
