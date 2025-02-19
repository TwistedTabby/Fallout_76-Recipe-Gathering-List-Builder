import { Link, Outlet } from 'react-router-dom';
import { strings } from '../constants/strings';
import { useState } from 'react';

interface LayoutProps {
  title?: string;
  children?: React.ReactNode;
}

const NavLinks = () => (
  <>
    <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {strings.general.home}
    </Link>
    <Link to="/recipes" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {strings.recipes.title}
    </Link>
    <Link to="/gathering-list" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {strings.gatheringList.title}
    </Link>
    <Link to="/import" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {strings.importRecipe.title}
    </Link>
    <Link to="/charisma-price-calc" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
      {strings.charismaPriceCalc.shortTitle}
    </Link>
  </>
);

export function Layout({ children, title }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pageTitle = title || strings.appTitle;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center font-bold">
                {pageTitle}
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLinks />
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">Open main menu</span>
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <NavLinks />
          </div>
        </div>
      </nav>
      
      <main>
        {children || <Outlet />}
      </main>
    </div>
  );
} 