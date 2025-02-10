import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {/* Other routes will be added here */}
        </Route>
      </Routes>
      <div>
        <button className="btn btn-primary">Click me!</button>
      </div>
    </Router>
  );
}

export default App; 