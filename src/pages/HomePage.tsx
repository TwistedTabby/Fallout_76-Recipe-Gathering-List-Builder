import { Link } from 'react-router-dom';
import { strings } from '../constants/strings';

export const HomePage = () => {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">{strings.appTitle}</h1>
          <p className="py-6">
            Build and manage your Fallout 76 gathering lists for crafting food and chems. 
            Keep track of all the ingredients you need to collect.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/recipes" className="btn btn-primary">
              Browse Recipes
            </Link>
            <Link to="/gathering-list" className="btn btn-secondary">
              View Gathering List
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Recipes</h2>
                <p>Browse and select from various food and chem recipes</p>
                <ul className="list-disc list-inside text-left">
                  <li>Filter by category</li>
                  <li>Search by buff effects</li>
                  <li>Sort by type</li>
                </ul>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Gathering List</h2>
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
  );
}; 