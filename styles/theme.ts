// Minimalist Todo App Design System
// Japanese/Scandinavian inspired with light and dark themes

const baseColors = {
  // Japanese slate - sophisticated warm grays
  jade: {
    light: '#a1a1aa',  // Light slate
    main: '#71717a',   // Japanese slate
    dark: '#52525b',   // Deep slate
  },
  
  // System colors
  success: '#22c55e', // Green-500
  warning: '#f59e0b', // Amber-500
  error: '#dc2626',   // Red-600
  info: '#3b82f6',    // Blue-500
  edit: '#8b5cf6',    // Violet-500
  copy: '#0ea5e9',    // Sky-500
  
  // Pure values
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const lightTheme = {
  colors: {
    ...baseColors,
    
    // Backgrounds - warm slate tones
    background: {
      primary: '#ffffff',
      secondary: '#fafaf9',
      tertiary: '#f5f5f4',
      elevated: '#ffffff',
    },
    
    // Text - warm slate grays
    text: {
      primary: '#292524',
      secondary: '#57534e',
      tertiary: '#a8a29e',
      disabled: '#d6d3d1',
      inverse: '#ffffff',
    },
    
    // Borders - warm stone grays
    border: {
      light: '#f5f5f4',
      default: '#e7e5e4',
      strong: '#d6d3d1',
    },
    
    // Todo specific - warm stone tones
    todo: {
      background: '#ffffff',
      hover: '#fafaf9',
      completed: '#f5f5f4',  // Warm stone tint
      priority: {
        low: '#fafaf9',    // Light stone
        medium: '#f5f5f4',  // Stone
        high: '#fef2f2',
      },
    },
    
    // Action colors
    actions: {
      delete: '#dc2626',   // Red-600
      edit: '#8b5cf6',     // Violet-500
      copy: '#0ea5e9',     // Sky-500
      complete: '#22c55e', // Green-500
      move: '#f59e0b',     // Amber-500
    },
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
};

const darkTheme = {
  colors: {
    ...baseColors,
    
    // Backgrounds - warm slate, not blue
    background: {
      primary: '#18181b',   // Dark zinc
      secondary: '#27272a', // Zinc-800
      tertiary: '#3f3f46',  // Zinc-700
      elevated: '#27272a',
    },
    
    // Text - warm grays
    text: {
      primary: '#fafafa',   // Zinc-50
      secondary: '#d4d4d8', // Zinc-300
      tertiary: '#a1a1aa',  // Zinc-400
      disabled: '#71717a',  // Zinc-500
      inverse: '#18181b',
    },
    
    // Borders - warm slate
    border: {
      light: '#27272a',     // Zinc-800
      default: '#3f3f46',   // Zinc-700
      strong: '#52525b',    // Zinc-600
    },
    
    // Todo specific - slate tones
    todo: {
      background: '#27272a',
      hover: '#3f3f46',
      completed: '#27272a',
      priority: {
        low: '#27272a',
        medium: '#3f3f46',
        high: '#450a0a',
      },
    },
    
    // Action colors
    actions: {
      delete: '#ef4444',   // Red-500
      edit: '#a78bfa',     // Violet-400
      copy: '#38bdf8',     // Sky-400
      complete: '#4ade80', // Green-400
      move: '#fbbf24',     // Amber-400
    },
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    full: 9999,
  },
  
  borderWidth: {
    none: 0,
    thin: 1,
    medium: 2,
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    // Soft, diffused shadows like "light filtering through concrete"
    sm: {
      shadowColor: '#78716c',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    md: {
      shadowColor: '#78716c',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    lg: {
      shadowColor: '#78716c',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 4,
    },
  },
  
  typography: {
    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Menlo, Monaco, Consolas, monospace',
    },
    
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    
    weights: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    
    easing: {
      linear: 'linear',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
  
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 30,
    toast: 40,
  },
  
  opacity: {
    disabled: 0.5,
    muted: 0.7,
    full: 1,
  },
};

// Combine themes
export const themes = {
  light: {
    ...commonTheme,
    colors: lightTheme.colors,
  },
  dark: {
    ...commonTheme,
    colors: darkTheme.colors,
  },
};

// Default to dark theme
export const theme = themes.dark;

// Type exports
export type Theme = typeof themes.light;
export type ThemeMode = keyof typeof themes;
export type Colors = typeof themes.light.colors;
export type Spacing = keyof typeof commonTheme.spacing;
export type BorderRadius = keyof typeof commonTheme.borderRadius;
export type Shadow = keyof typeof commonTheme.shadows;
export type FontSize = keyof typeof commonTheme.typography.sizes;
export type FontWeight = keyof typeof commonTheme.typography.weights;

// Helper functions
export const getTheme = (mode: ThemeMode) => themes[mode];

// CSS helpers for web
export const getBoxShadow = (shadow: Shadow, isDark = false): string => {
  const s = commonTheme.shadows[shadow];
  if (shadow === 'none') return 'none';
  const opacity = isDark ? s.shadowOpacity * 0.3 : s.shadowOpacity;
  return `${s.shadowOffset.width}px ${s.shadowOffset.height}px ${s.shadowRadius}px rgba(0, 0, 0, ${opacity})`;
};

// Todo priority colors helper
export const getPriorityColor = (
  priority: 'low' | 'medium' | 'high',
  mode: ThemeMode = 'light'
): string => {
  return themes[mode].colors.todo.priority[priority];
};

// Check if dark mode
export const isDarkMode = (theme: Theme): boolean => {
  return theme.colors.background.primary === '#0f172a';
};

export default theme;