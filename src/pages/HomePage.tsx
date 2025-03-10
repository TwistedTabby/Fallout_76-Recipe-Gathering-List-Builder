import { strings } from '../constants/strings';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--main-accent)' }}>
        {strings.appTitle}
      </h1>
      <p className="text-lg mb-8">
        Optimize your Fallout 76 gameplay with our specialized tools for trading and resource gathering.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/charisma-price-calc" className="card shadow-xl hover:shadow-2xl transition-shadow" style={{ 
          backgroundColor: 'var(--light-contrast)',
          border: '1px solid var(--main-accent)'
        }}>
          <div className="card-body">
            <h2 className="card-title" style={{ color: 'var(--dark-contrast) !important' }}>
              Charisma Price Tool
            </h2>
            <p>Calculate optimal selling prices based on your Charisma and perks</p>
            <ul className="list-disc list-inside text-left">
              <li>Dynamic price calculations</li>
              <li>Maximize your caps earnings</li>
            </ul>
          </div>
        </Link>
        
        <Link to="/farming-tracker" className="card shadow-xl hover:shadow-2xl transition-shadow" style={{ 
          backgroundColor: 'var(--light-contrast)',
          border: '1px solid var(--secondary-accent)'
        }}>
          <div className="card-body">
            <h2 className="card-title" style={{ color: 'var(--dark-contrast) !important' }}>
              Farming Route Tracker
            </h2>
            <p>Plan and optimize your resource gathering routes</p>
            <ul className="list-disc list-inside text-left">
              <li>Custom route creation</li>
              <li>Track your progress</li>
              <li>View your route history</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 