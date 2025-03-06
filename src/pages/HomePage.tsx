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
              Optimize your Fallout 76 gameplay with our specialized tools for trading and resource gathering.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="card shadow-xl" style={{ 
                backgroundColor: 'var(--light-contrast)',
                border: '1px solid var(--main-accent)'
              }}>
                <div className="card-body">
                  <h2 className="card-title" style={{ color: 'var(--main-accent)' }}>
                    Charisma Price Tool
                  </h2>
                  <p>Calculate optimal selling prices based on your Charisma and perks</p>
                  <ul className="list-disc list-inside text-left">
                    <li>Dynamic price calculations</li>
                    <li>Perk card combinations</li>
                    <li>Maximize your caps earnings</li>
                  </ul>
                </div>
              </div>
              
              <div className="card shadow-xl" style={{ 
                backgroundColor: 'var(--light-contrast)',
                border: '1px solid var(--secondary-accent)'
              }}>
                <div className="card-body">
                  <h2 className="card-title" style={{ color: 'var(--secondary-accent)' }}>
                    Farming Route Tracker
                  </h2>
                  <p>Plan and optimize your resource gathering routes</p>
                  <ul className="list-disc list-inside text-left">
                    <li>Custom route creation</li>
                    <li>Resource respawn timers</li>
                    <li>Map integration</li>
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