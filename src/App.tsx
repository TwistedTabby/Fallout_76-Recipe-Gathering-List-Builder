import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import ImportRecipe from './pages/ImportRecipe';
import CharismaPriceCalc from './pages/CharismaPriceCalc';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/import" element={<ImportRecipe />} />
          <Route path="/charisma-price-calc" element={<CharismaPriceCalc />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 