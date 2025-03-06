import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ImportRecipe from './pages/ImportRecipe';
import CharismaPriceCalc from './pages/CharismaPriceCalc';
import FarmingTracker from './pages/FarmingTracker';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/import" element={<ImportRecipe />} />
          <Route path="/charisma-price-calc" element={<CharismaPriceCalc />} />
          <Route path="/farming-tracker" element={<FarmingTracker />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 