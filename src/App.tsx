import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { strings } from './constants/strings';

function App() {
  useEffect(() => {
    document.title = strings.appTitle;
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl">{strings.appTitle}</h1>
            <p className="text-base-content/70">
              Your personal space for managing and organizing recipes that you want to make in Fallout 76.
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 