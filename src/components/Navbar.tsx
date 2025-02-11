import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/recipes" className="hover:text-gray-300">
            Recipes
          </Link>
          <Link href="/gathering-list" className="hover:text-gray-300">
            Gathering List
          </Link>
          <Link href="/import" className="hover:text-gray-300">
            Import Recipe
          </Link>
        </div>
      </div>
    </nav>
  );
} 