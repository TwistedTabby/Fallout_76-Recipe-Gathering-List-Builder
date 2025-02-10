import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RecipeList from './pages/RecipeList';
import GatheringList from './pages/GatheringList';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/gathering-list" element={<GatheringList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 