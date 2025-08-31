// Minimalist Todo App Design System
// Japanese/Scandinavian inspired with light and dark themes

const baseColors = {
  // Muted sage/concrete accent color - Japanese/Scandinavian inspired
  jade: {
    light: '#a1a1aa',  // Light concrete gray
    main: '#71717a',   // Muted sage concrete
    dark: '#52525b',   // Deep concrete
  },
  
  // System colors
  success: '#71717a',
  warning: '#f59e0b',
  error: '#dc2626',
  
  // Pure values
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const lightTheme = {
  colors: {
    ...baseColors,
    
    // Backgrounds
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
    },
    
    // Text
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      disabled: '#cbd5e1',
      inverse: '#ffffff',
    },
    
    // Borders
    border: {
      light: '#f1f5f9',
      default: '#e2e8f0',
      strong: '#cbd5e1',
    },
    
    // Todo specific
    todo: {
      background: '#ffffff',
      hover: '#f8fafc',
      completed: '#f0fdf5',
      priority: {
        low: '#eff6ff',
        medium: '#fffbeb',
        high: '#fef2f2',
      },
    },
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
};

const darkTheme = {
  colors: {
    ...baseColors,
    
    // Backgrounds
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      elevated: '#1e293b',
    },
    
    // Text
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      disabled: '#475569',
      inverse: '#0f172a',
    },
    
    // Borders
    border: {
      light: '#1e293b',
      default: '#334155',
      strong: '#475569',
    },
    
    // Todo specific
    todo: {
      background: '#1e293b',
      hover: '#334155',
      completed: '#134032',
      priority: {
        low: '#172554',
        medium: '#422006',
        high: '#450a0a',
      },
    },
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
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
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
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
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
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

// Default to light theme
export const theme = themes.light;

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