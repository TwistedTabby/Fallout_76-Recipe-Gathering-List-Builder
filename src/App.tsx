import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import ImportRecipe from './pages/ImportRecipe';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {/* Other routes will be added here */}
        </Route>
        <Route path="/import" element={<ImportRecipe />} />
      </Routes>
    </Router>
  );
}

export default App; 