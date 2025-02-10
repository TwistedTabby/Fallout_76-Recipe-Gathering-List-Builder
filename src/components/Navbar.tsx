import React from 'react';
import { strings } from '../constants/strings';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">{strings.appTitle}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <a href="#" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </a>
              <a href="#" className="text-indigo-200 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Recipes
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 