import { Link, Outlet } from 'react-router-dom';
import { strings } from '../constants/strings';

interface LayoutProps {
  title?: string;
  children?: React.ReactNode;
}

const MenuItems = () => (
  <>
    <li><Link to="/">{strings.general.home}</Link></li>
    <li><Link to="/recipes">{strings.recipes.title}</Link></li>
    <li><Link to="/gathering-list">{strings.gatheringList.title}</Link></li>
    <li><Link to="/import">{strings.importRecipe.title}</Link></li>
  </>
);

export const Layout = ({ title, children }: LayoutProps) => {
  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="w-full navbar bg-base-300">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div> 
          <div className="flex-1 px-2 mx-2">
            <Link to="/" className="text-xl font-bold">
              {title || strings.appTitle}
            </Link>
          </div>
          <div className="flex-none hidden lg:block">
            <ul className="menu menu-horizontal">
              <MenuItems />
            </ul>
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1">
          {children || <Outlet />}
        </main>
      </div> 
      {/* Sidebar for mobile */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-3" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 h-full bg-base-200">
          <MenuItems />
        </ul>
      </div>
    </div>
  );
}; 