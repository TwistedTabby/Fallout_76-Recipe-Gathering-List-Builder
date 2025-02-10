import React from 'react';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Recipe Manager
            </h1>
            <p className="text-gray-600">
              Your personal space for managing and organizing recipes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 