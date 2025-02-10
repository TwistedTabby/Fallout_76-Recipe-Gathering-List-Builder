import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Recipe Manager</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600">
          Welcome to your recipe management system.
        </p>
      </div>
    </div>
  );
};

export default Home; 