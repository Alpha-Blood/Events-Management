import React, { useState } from 'react';

const SearchBar = () => {
  const [dateValue, setDateValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-blue-600 rounded-xl sm:rounded-95 shadow-lg">
      {/* Mobile View - Single Line with Expand Button */}
      <div className="flex sm:hidden items-center p-2">
        <input
          type="text"
          placeholder="Search event, city or venue"
          className="flex-1 px-2 py-1.5 text-sm text-gray-900  focus:outline-none"
          onClick={() => setIsExpanded(true)}
        />
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 p-1.5 text-gray-600 hover:text-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Mobile View - Expanded Search Options */}
      {isExpanded && (
        <div className="sm:hidden border-t px-2 py-2 space-y-2">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full px-2 py-1.5 text-sm text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="w-full bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Search
          </button>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-4 p-4">
        <input
          type="text"
          placeholder="Search event, city or venue"
          className="flex-1 px-4 py-2 border border-blue-600 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-base"
        />
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="flex-1 px-4 py-2 border border-blue-600 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-base"
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition text-base font-medium">
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
