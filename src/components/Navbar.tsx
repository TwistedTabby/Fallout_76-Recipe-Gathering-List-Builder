import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/recipes" className="hover:text-gray-300">
            Recipes
          </Link>
          <Link to="/gathering-list" className="hover:text-gray-300">
            Gathering List
          </Link>
          <Link to="/import" className="hover:text-gray-300">
            Import Recipe
          </Link>
        </div>
      </div>
    </nav>
  );
} 