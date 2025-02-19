import React, { useState } from 'react';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      <button 
        className="p-3 text-white focus:outline-none w-full text-left hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      
      <nav className="mt-4 space-y-2">
        <div className={`p-3 cursor-pointer hover:bg-gray-700 transition-all ${isExpanded ? '' : 'text-center'}`}>
          {isExpanded ? 'Dashboard' : 'D'}
        </div>
        <div className={`p-3 cursor-pointer hover:bg-gray-700 transition-all ${isExpanded ? '' : 'text-center'}`}>
          {isExpanded ? 'Tasks' : 'T'}
        </div>
        <div className={`p-3 cursor-pointer hover:bg-gray-700 transition-all ${isExpanded ? '' : 'text-center'}`}>
          {isExpanded ? 'Calendar' : 'C'}
        </div>
        <div className={`p-3 cursor-pointer hover:bg-gray-700 transition-all ${isExpanded ? '' : 'text-center'}`}>
          {isExpanded ? 'Progress Tracker' : 'P'}
        </div>
        <div className={`p-3 cursor-pointer hover:bg-gray-700 transition-all ${isExpanded ? '' : 'text-center'}`}>
          {isExpanded ? 'Settings' : 'S'}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;