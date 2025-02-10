import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Home } from '../pages/Home';
import { Recipes } from '../pages/Recipes';
import { ImportRecipe } from '../pages/ImportRecipe';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/import" element={<ImportRecipe />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 