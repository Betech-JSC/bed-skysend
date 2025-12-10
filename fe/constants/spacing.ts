// HIG 8pt grid system
// All spacing must be multiples of 8 points
export const Spacing = {
  xs: 4,   // 0.5 × 8
  sm: 8,   // 1 × 8
  md: 16,  // 2 × 8
  lg: 24,  // 3 × 8
  xl: 32,  // 4 × 8
  xxl: 40, // 5 × 8
  xxxl: 48, // 6 × 8
} as const;

// Standard component spacing
export const ComponentSpacing = {
  screenPadding: 16,      // Standard screen padding
  sectionSpacing: 24,     // Space between major sections
  cardPadding: 16,       // Padding inside cards
  elementSpacing: 12,    // Space between form elements (can use 8 or 16)
  groupSpacing: 8,        // Space within groups
} as const;
