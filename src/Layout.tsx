import { Link } from 'react-router-dom';
import logo from './assets/TwistedTabby_FalloutLogo.PNG';

const Layout = () => {
  const pageTitle = "Fallout 76 Tools";
  
  return (
    <div>
      <Link 
        to="/" 
        className="flex-shrink-0 flex items-center font-bold gap-2"
        style={{ color: 'var(--main-accent)' }}
      >
        <img src={logo} alt="Twisted Tabby Logo" className="h-8 w-8" />
        {pageTitle}
      </Link>
    </div>
  );
};

export default Layout; 