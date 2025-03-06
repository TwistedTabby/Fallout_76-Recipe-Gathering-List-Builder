// Define the base color scheme interface
export interface ColorScheme {
  mainAccent: string;
  secondaryAccent: string;
  darkContrast: string;
  lightContrast: string;
  extraPop: string;
  background: string;
  themeName: string;
  // Add new colors for action buttons
  actionPositive: string;
  actionNegative: string;
  actionText: string;
  // New colors for active states
  activeHighlight: string;
  activeButtonBg: string;
  activeButtonText: string;
}

export const vaultStandard: ColorScheme = {
  mainAccent: '#FFCC00',     // Vault-Tec Gold - kept as is for branding
  secondaryAccent: '#005A9C', // Vault-Tec Blue - kept as is for good contrast
  darkContrast: '#22231E',   // Pre-War Terminal Black - kept as is for good contrast
  lightContrast: '#F5F5EB',  // Dusty Concrete - lightened for better contrast with text
  extraPop: '#D42E35',       // Nuka Cola Crimson - brightened for better visibility
  background: '#3A3D33',     // Pip-Boy Screen Green - darkened for better contrast with light elements
  themeName: 'Vault Standard ☢',
  // New action button colors
  actionPositive: '#006F3C', // Dark green for start/positive actions
  actionNegative: '#D42E35', // Red for delete/negative actions
  actionText: '#FFFFFF',     // White text for action buttons
  // Active state colors
  activeHighlight: '#004E8C', // Darker blue for active route highlight
  activeButtonBg: '#0078D7',  // Bright blue for active buttons
  activeButtonText: '#FFFFFF' // White text for active buttons
};

export const wastelandReapers: ColorScheme = {
  mainAccent: '#E03E22',     // Bloodstained Red - brightened for better visibility
  secondaryAccent: '#B87600', // Burned Ember Orange - darkened for better contrast with light text
  darkContrast: '#161616',   // Blackened Steel - kept as is for good contrast
  lightContrast: '#F0EAD9',  // Scavenged Bone White - lightened for better contrast with text
  extraPop: '#1A9178',       // Toxic Turquoise Graffiti - darkened for better contrast
  background: '#3E3429',     // Scrap Metal Brown - darkened for better contrast with light elements
  themeName: 'Wasteland Reapers ☠',
  // New action button colors - using different colors to avoid red/green colorblind issues
  actionPositive: '#0A6EAF', // Blue for start/positive actions
  actionNegative: '#8B4513', // Brown for delete/negative actions
  actionText: '#FFFFFF',     // White text for action buttons
  // Active state colors
  activeHighlight: '#5D4037', // Deep brown for active route highlight
  activeButtonBg: '#795548',  // Medium brown for active buttons
  activeButtonText: '#FFFFFF' // White text for active buttons
};

export const foundationRoots: ColorScheme = {
  mainAccent: '#A06000',     // Harvest Wheat Gold - darkened for better contrast with light text
  secondaryAccent: '#2A5F41', // Verdant Green - darkened for better contrast with light text
  darkContrast: '#2A2A2A',   // Forged Iron - kept as is for good contrast
  lightContrast: '#F5EFE0',  // Settler Sandstone - lightened for better contrast with text
  extraPop: '#0A6EAF',       // Vault-Tec Utility Blue - darkened for better contrast
  background: '#5A4A3D',     // Aged Timber Brown - adjusted for better contrast with light elements
  themeName: 'Foundation Roots 🏡',
  // New action button colors
  actionPositive: '#2A5F41', // Green for start/positive actions
  actionNegative: '#8B4513', // Brown for delete/negative actions
  actionText: '#FFFFFF',     // White text for action buttons
  // Active state colors
  activeHighlight: '#3E6B56', // Brighter green for active route highlight
  activeButtonBg: '#4CAF50',  // Medium green for active buttons
  activeButtonText: '#FFFFFF' // White text for active buttons
};
