// Constants for collectible items in Fallout 76

// Magazine titles with their issue counts
export const MAGAZINES = {
  'Astoundingly Awesome Tales': 13,
  'Backwoodsman': 10,
  'Grognak the Barbarian': 10,
  'Guns and Bullets': 10,
  'Live & Love': 9,
  'Scouts\' Life': 10,
  'Tales from the West Virginia Hills': 5,
  'Tesla Science Magazine': 9,
  'Tumbers Today': 5,
  'U.S. Covert Operations Manual': 10,
  'Unstoppables': 5,
  'Holotape': 0 // Special case, no issue number
};

// List of all magazine titles
export const MAGAZINE_TITLES = Object.keys(MAGAZINES);

// Generate all magazine issues
export const generateMagazineIssues = (magazineTitle: string): number[] => {
  const issueCount = MAGAZINES[magazineTitle as keyof typeof MAGAZINES] || 0;
  if (issueCount === 0) return []; // For holotapes
  return Array.from({ length: issueCount }, (_, i) => i + 1);
};

// Complete list of bobbleheads
export const BOBBLEHEADS = [
  'Bobblehead: Agility',
  'Bobblehead: Big Guns',
  'Bobblehead: Caps',
  'Bobblehead: Charisma',
  'Bobblehead: Endurance',
  'Bobblehead: Energy Weapons',
  'Bobblehead: Explosive',
  'Bobblehead: Intelligence',
  'Bobblehead: Leader',
  'Bobblehead: Lock Picking',
  'Bobblehead: Luck',
  'Bobblehead: Medicine',
  'Bobblehead: Melee',
  'Bobblehead: Perception',
  'Bobblehead: Repair',
  'Bobblehead: Science',
  'Bobblehead: Small Guns',
  'Bobblehead: Sneak',
  'Bobblehead: Strength',
  'Bobblehead: Unarmed'
]; 