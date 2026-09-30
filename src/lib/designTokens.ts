/**
 * ROAD SAHAYAK — DESIGN TOKEN SYSTEM (STAGE 4 FOUNDATION)
 * Centralized design tokens for Dark, Tactical, Operational Road Safety interface.
 */

export const TOKENS = {
  colors: {
    // Canvas & Surface Hierarchy
    canvas: '#0B0E14',        // Deep Carbon Root background
    surface1: '#141822',      // Level 1 Dark Slate (Cards, Bottom Sheets, Top Bars)
    surface2: '#1C2230',      // Level 2 Elevated Slate (Inputs, nested items, sub-cards)
    surface3: '#252D3D',      // Level 3 Highlight / Active hover surface
    
    // Borders & Structural Dividers
    border: '#262E40',        // Standard tactical 1px border
    borderSubtle: '#1E2533',  // Low-contrast inner divider
    borderStrong: '#3B455E',  // Focused or highlighted element border

    // Semantic Signals
    emergency: {
      base: '#EF4444',        // Critical red
      dark: '#991B1B',        // Deep crimson backing
      surface: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      glow: 'rgba(239, 68, 68, 0.30)',
      text: '#FCA5A5'
    },
    amber: {
      base: '#F59E0B',        // Highway Vigilance Amber
      dark: '#B45309',
      surface: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      glow: 'rgba(245, 158, 11, 0.25)',
      text: '#FCD34D'
    },
    live: {
      base: '#10B981',        // Emerald Live / Verified / Active
      dark: '#047857',
      surface: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      glow: 'rgba(16, 185, 129, 0.25)',
      text: '#6EE7B7'
    },
    info: {
      base: '#3B82F6',        // Tactical Blue / Utility
      dark: '#1D4ED8',
      surface: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.35)',
      glow: 'rgba(59, 130, 246, 0.20)',
      text: '#93C5FD'
    },
    warning: {
      base: '#F97316',        // Caution Orange
      dark: '#C2410C',
      surface: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.35)',
      glow: 'rgba(249, 115, 22, 0.20)',
      text: '#FDBA74'
    },

    // Typography Text Levels
    text: {
      primary: '#F8FAFC',     // Slate 50 - High contrast white
      secondary: '#94A3B8',   // Slate 400 - Readable muted text (WCAG AAA compliant)
      tertiary: '#64748B',    // Slate 500 - Auxiliary micro labels
      inverse: '#0B0E14'      // Deep Carbon for high contrast text on bright buttons
    }
  },

  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      micro: '11px',
      xs: '12px',
      sm: '13px',
      base: '15px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      display: '28px'
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  radius: {
    micro: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    sheet: '24px',
    full: '9999px'
  },

  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
    cardHover: '0 8px 28px -4px rgba(0, 0, 0, 0.6)',
    sheet: '0 -8px 36px rgba(0, 0, 0, 0.75)',
    emergencyGlow: '0 0 25px rgba(239, 68, 68, 0.35)',
    amberGlow: '0 0 20px rgba(245, 158, 11, 0.25)',
    liveGlow: '0 0 16px rgba(16, 185, 129, 0.25)'
  },

  zIndex: {
    base: 0,
    mapControls: 400,
    floatingRibbon: 500,
    activeMissionHud: 600,
    bottomNav: 700,
    modalBackdrop: 800,
    bottomSheet: 900,
    toast: 1000,
    statusBar: 1100
  }
} as const;

export type SemanticState = 
  | 'emergency' 
  | 'assistance' 
  | 'hazard' 
  | 'live' 
  | 'verified' 
  | 'warning' 
  | 'resolved' 
  | 'normal';
