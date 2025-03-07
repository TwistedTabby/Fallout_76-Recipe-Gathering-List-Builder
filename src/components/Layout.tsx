import { Link, Outlet } from 'react-router-dom';
import { strings } from '../constants/strings';
import { useState, useEffect } from 'react';
import * as colorSchemes from '../constants/colors';
import { ColorScheme } from '../constants/colors';
import logo from '../assets/TwistedTabby_FalloutLogo.PNG';
import Cookies from 'js-cookie';

interface LayoutProps {
  title?: string;
  children?: React.ReactNode;
}

// Helper function to check if a value is a ColorScheme
const isColorScheme = (value: unknown): value is ColorScheme => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'mainAccent' in value &&
    'secondaryAccent' in value &&
    'darkContrast' in value &&
    'lightContrast' in value &&
    'extraPop' in value &&
    'background' in value &&
    'themeName' in value
  );
};

// Get all color schemes except the interface definition
const availableSchemes = Object.entries(colorSchemes)
  .filter(([_, value]) => isColorScheme(value))
  .reduce((acc, [key, value]) => ({
    ...acc,
    [key.replace(/Colors$/, '').toLowerCase()]: value as ColorScheme
  }), {} as Record<string, ColorScheme>);

// Ensure we have at least one color scheme
if (Object.keys(availableSchemes).length === 0) {
  console.error('No valid color schemes found in:', Object.keys(colorSchemes));
  throw new Error('No color schemes found - check color scheme definitions');
}

type ColorSchemeName = keyof typeof availableSchemes;

// Set default scheme to 'vault standard' or fall back to first scheme if not found
const defaultSchemeName = ('vaultstandard' in availableSchemes 
  ? 'vaultstandard' 
  : Object.keys(availableSchemes)[0]) as ColorSchemeName;

const COOKIE_NAME = 'preferred-color-scheme';

const NavLinks = () => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <>
      <Link 
        to="/" 
        className="block px-4 py-2 hover:bg-opacity-10 font-medium flex items-center" 
        style={{ 
          color: 'var(--dark-contrast)',
          textDecoration: 'none',
          borderBottom: '2px solid transparent',
          transition: 'border-color 0.2s ease-in-out',
          height: '100%'
        }}
      >
        {strings.general.home}
      </Link>
      
      {/* Tools Dropdown */}
      <div 
        className="relative h-full flex items-center"
        onMouseEnter={() => setIsToolsOpen(true)}
        onMouseLeave={() => setIsToolsOpen(false)}
      >
        <div
          className="block px-4 py-2 hover:bg-opacity-10 font-medium flex items-center cursor-pointer"
          style={{ 
            color: 'var(--dark-contrast)',
            textDecoration: 'none',
            borderBottom: '2px solid transparent',
            transition: 'border-color 0.2s ease-in-out',
            height: '100%'
          }}
        >
          Tools
          <span className="ml-1">▼</span>
        </div>
        
        {isToolsOpen && (
          <>
            {/* Invisible gap to maintain hover */}
            <div 
              className="absolute left-0 w-48 h-4"
              style={{ 
                top: '100%'
              }}
            />
            <div 
              className="absolute left-0 w-48 rounded-md shadow-lg"
              style={{ 
                backgroundColor: 'var(--light-contrast)',
                border: '1px solid var(--secondary-accent)',
                zIndex: 50,
                top: 'calc(100% + 0.5rem)'
              }}
            >
              <Link 
                to="/charisma-price-calc" 
                className="block px-4 py-2 hover:bg-opacity-10 font-medium hover:bg-secondary-accent/10 first:rounded-t-md"
                style={{ 
                  color: 'var(--dark-contrast)',
                  textDecoration: 'none'
                }}
              >
                Charisma Pricing
              </Link>
              <Link 
                to="/farming-tracker" 
                className="block px-4 py-2 hover:bg-opacity-10 font-medium hover:bg-secondary-accent/10 last:rounded-b-md"
                style={{ 
                  color: 'var(--dark-contrast)',
                  textDecoration: 'none'
                }}
              >
                Farming Tracker
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const Layout = ({ children, title }: LayoutProps) => {
  const [currentScheme, setCurrentScheme] = useState<ColorSchemeName>(() => {
    // Try to get the color scheme from cookie, fallback to default
    const savedScheme = Cookies.get(COOKIE_NAME) as ColorSchemeName;
    return savedScheme && availableSchemes[savedScheme] ? savedScheme : defaultSchemeName;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Set document title based on the current page
  useEffect(() => {
    document.title = title || strings.appTitle;
  }, [title]);

  // Use the selected color scheme
  const colors = availableSchemes[currentScheme];

  // Save color scheme to cookie whenever it changes
  useEffect(() => {
    Cookies.set(COOKIE_NAME, currentScheme, { expires: 365 }); // Cookie expires in 1 year
  }, [currentScheme]);

  return (
    <div
      style={{
        // Define CSS variables using the selected color scheme
        '--main-accent': colors.mainAccent,
        '--secondary-accent': colors.secondaryAccent,
        '--dark-contrast': colors.darkContrast,
        '--light-contrast': colors.lightContrast,
        '--extra-pop': colors.extraPop,
        '--background': colors.background,
        // Action button colors
        '--actionPositive': colors.actionPositive,
        '--actionNegative': colors.actionNegative,
        '--actionText': colors.actionText,
        // Active state colors
        '--activeHighlight': colors.activeHighlight,
        '--activeButtonBg': colors.activeButtonBg,
        '--activeButtonText': colors.activeButtonText,
        
        // Apply some basic styling using our colors
        backgroundColor: 'var(--background)',
        color: 'var(--dark-contrast)',
        minHeight: '100vh',
      } as React.CSSProperties}
    >
      <nav style={{ 
        backgroundColor: 'var(--light-contrast)',
        borderBottom: '1px solid var(--secondary-accent)',
      }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center font-bold gap-2"
                style={{ color: 'var(--main-accent)' }}
              >
                <img src={logo} alt="Twisted Tabby Logo" className="h-16 w-16" />
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center h-full">
                <NavLinks />
              </div>
            </div>

            {/* Right side content */}
            <div className="hidden sm:flex items-center">
              <span className="mr-2" style={{ color: 'var(--dark-contrast)' }}>Color Scheme</span>
              <select
                value={currentScheme}
                onChange={(e) => setCurrentScheme(e.target.value as ColorSchemeName)}
                className="rounded py-1 px-2"
                style={{
                  backgroundColor: 'var(--light-contrast)',
                  color: 'var(--dark-contrast)',
                  border: '2px solid var(--secondary-accent)',
                  fontWeight: 'medium'
                }}
                aria-label="Select color theme"
              >
                {Object.entries(availableSchemes).map(([schemeName, scheme]) => (
                  <option key={schemeName} value={schemeName}>
                    {scheme.themeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:hidden flex flex-col items-center">
              <span className="mb-1" style={{ color: 'var(--dark-contrast)' }}>Color Scheme</span>
              <select
                value={currentScheme}
                onChange={(e) => setCurrentScheme(e.target.value as ColorSchemeName)}
                className="rounded py-1 px-2"
                style={{
                  backgroundColor: 'var(--light-contrast)',
                  color: 'var(--dark-contrast)',
                  border: '2px solid var(--secondary-accent)',
                  fontWeight: 'medium'
                }}
                aria-label="Select color theme"
              >
                {Object.entries(availableSchemes).map(([schemeName, scheme]) => (
                  <option key={schemeName} value={schemeName}>
                    {scheme.themeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-opacity-10"
                style={{ color: 'var(--dark-contrast)' }}
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
        <div 
          className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          style={{ 
            backgroundColor: 'var(--light-contrast)',
            borderTop: '1px solid var(--secondary-accent)'
          }}
        >
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-4 py-2 hover:bg-opacity-10 font-medium"
              style={{ color: 'var(--dark-contrast)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {strings.general.home}
            </Link>
            
            {/* Tools Section */}
            <div className="px-4 py-2">
              <div className="font-medium" style={{ color: 'var(--dark-contrast)' }}>
                Tools
              </div>
              <div className="pl-4 mt-2 space-y-1">
                <Link 
                  to="/charisma-price-calc" 
                  className="block px-4 py-2 hover:bg-opacity-10"
                  style={{ color: 'var(--dark-contrast)' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Charisma Pricing
                </Link>
                <Link 
                  to="/farming-tracker" 
                  className="block px-4 py-2 hover:bg-opacity-10"
                  style={{ color: 'var(--dark-contrast)' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Farming Tracker
                </Link>
              </div>
            </div>

            <div className="px-4 py-2">
              <select
                value={currentScheme}
                onChange={(e) => setCurrentScheme(e.target.value as ColorSchemeName)}
                className="w-full rounded py-1 px-2"
                style={{
                  backgroundColor: 'var(--light-contrast)',
                  color: 'var(--dark-contrast)',
                  border: '2px solid var(--secondary-accent)',
                  fontWeight: 'medium'
                }}
                aria-label="Select color theme"
              >
                {Object.entries(availableSchemes).map(([schemeName, scheme]) => (
                  <option key={schemeName} value={schemeName}>
                    {scheme.themeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto p-4">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout; 