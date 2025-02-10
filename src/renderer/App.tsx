import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ImportRecipe } from '../pages/ImportRecipe';
import { Recipe, GatheringList } from '../shared/types';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/recipes" element={<div>Recipes Page</div>} />
            <Route path="/import" element={<ImportRecipe />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 