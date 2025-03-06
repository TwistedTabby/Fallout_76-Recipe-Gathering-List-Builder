import { Link } from 'react-router-dom';
import { strings } from '../constants/strings';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--main-accent)' }}>
        {strings.appTitle}
      </h1>
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <p className="py-6 text-lg">
              Build and manage your Fallout 76 gathering lists for crafting food and chems. 
              Keep track of all the ingredients you need to collect.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/recipes" 
                className="btn" 
                style={{ 
                  backgroundColor: 'var(--main-accent)',
                  color: 'var(--light-contrast)'
                }}
              >
                Browse Recipes
              </Link>
              <Link 
                to="/gathering-list" 
                className="btn" 
                style={{ 
                  backgroundColor: 'var(--secondary-accent)',
                  color: 'var(--dark-contrast)'
                }}
              >
                View Gathering List
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="card shadow-xl" style={{ 
                backgroundColor: 'var(--light-contrast)',
                border: '1px solid var(--main-accent)'
              }}>
                <div className="card-body">
                  <h2 className="card-title" style={{ color: 'var(--main-accent)' }}>
                    Recipes
                  </h2>
                  <p>Browse and select from various food and chem recipes</p>
                  <ul className="list-disc list-inside text-left">
                    <li>Filter by category</li>
                    <li>Search by buff effects</li>
                    <li>Sort by type</li>
                  </ul>
                </div>
              </div>
              
              <div className="card shadow-xl" style={{ 
                backgroundColor: 'var(--light-contrast)',
                border: '1px solid var(--secondary-accent)'
              }}>
                <div className="card-body">
                  <h2 className="card-title" style={{ color: 'var(--secondary-accent)' }}>
                    Gathering List
                  </h2>
                  <p>Track ingredients needed for selected recipes</p>
                  <ul className="list-disc list-inside text-left">
                    <li>View by category</li>
                    <li>Total ingredients needed</li>
                    <li>Easy to follow checklist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 