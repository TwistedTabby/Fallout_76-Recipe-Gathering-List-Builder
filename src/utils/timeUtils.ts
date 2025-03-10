/**
 * Utility functions for time-related operations
 */

/**
 * Formats elapsed time in milliseconds to HH:MM:SS format
 * @param elapsedMs Elapsed time in milliseconds
 * @returns Formatted time string in HH:MM:SS format
 */
export const formatElapsedTime = (elapsedMs: number): string => {
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}; 