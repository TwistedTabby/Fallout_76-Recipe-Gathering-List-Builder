import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">Recipe Manager</h1>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout; 