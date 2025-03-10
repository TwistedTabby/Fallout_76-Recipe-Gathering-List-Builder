import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopwatch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

interface TrackingStatsProps {
  elapsedTime: string;
  currentStopIndex: number;
  totalStops: number;
}

/**
 * Component for displaying tracking statistics
 */
const TrackingStats: React.FC<TrackingStatsProps> = ({
  elapsedTime,
  currentStopIndex,
  totalStops
}) => {
  return (
    <div className="tracking-info mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tracking-stat p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <FontAwesomeIcon icon={faStopwatch} className="mr-2" />
            <span className="font-semibold">Elapsed Time</span>
          </div>
          <div className="text-xl font-mono">{elapsedTime}</div>
        </div>
        
        <div className="tracking-stat p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
            <span className="font-semibold">Location</span>
          </div>
          <div className="text-xl">
            Stop {currentStopIndex + 1} of {totalStops}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingStats; 