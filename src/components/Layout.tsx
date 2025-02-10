import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="/">Recipes</Link></li>
            <li><Link to="/gathering-list">Gathering List</Link></li>
            <li><Link to="/import">Import Recipe</Link></li>
          </ul>
        </nav>
      </header>
      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default Layout; 