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
    <div className="tracking-info mb-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="tracking-stat p-2 sm:p-3 rounded-lg">
          <div className="flex items-center mb-0.5 sm:mb-1">
            <FontAwesomeIcon icon={faStopwatch} className="mr-1 sm:mr-2 text-sm sm:text-base" />
            <span className="font-semibold text-sm sm:text-base">Elapsed Time</span>
          </div>
          <div className="text-lg sm:text-xl font-mono">{elapsedTime}</div>
        </div>
        
        <div className="tracking-stat p-2 sm:p-3 rounded-lg">
          <div className="flex items-center mb-0.5 sm:mb-1">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 sm:mr-2 text-sm sm:text-base" />
            <span className="font-semibold text-sm sm:text-base">Location</span>
          </div>
          <div className="text-lg sm:text-xl">
            Stop {currentStopIndex + 1} of {totalStops}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingStats; 