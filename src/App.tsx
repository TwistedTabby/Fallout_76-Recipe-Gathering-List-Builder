import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RecipeList from './pages/RecipeList';
import GatheringList from './pages/GatheringList';
import { ImportRecipe } from './pages/ImportRecipe';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe-list" element={<RecipeList />} />
            <Route path="/gathering-list" element={<GatheringList />} />
            <Route 
              path="/import" 
              element={
                <ProtectedRoute requiresCollaborator>
                  <ImportRecipe />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App; 