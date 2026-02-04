import React, { createContext, useContext, useMemo } from 'react';
import { 
  ThemeContext, 
  BrandingConfig, 
  DEFAULT_COLORS, 
  DEFAULT_FONTS 
} from './types';

const ThemeCtx = createContext<ThemeContext | null>(null);

export interface ThemeProviderProps {
  branding?: Partial<BrandingConfig>;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ branding, children }) => {
  const theme = useMemo<ThemeContext>(() => {
    const colors = { ...DEFAULT_COLORS, ...branding?.colors };
    const fonts = { ...DEFAULT_FONTS, ...branding?.fonts };
    const isDark = branding?.theme !== 'light';
    
    // Select appropriate logo variant
    let logo: string | null = null;
    if (branding?.logo) {
      logo = branding.logo;
    } else if (isDark && branding?.logoLight) {
      logo = branding.logoLight;
    } else if (!isDark && branding?.logoDark) {
      logo = branding.logoDark;
    }

    return { colors, fonts, logo, isDark };
  }, [branding]);

  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
};

export const useTheme = (): ThemeContext => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    // Return defaults if no provider
    return {
      colors: DEFAULT_COLORS,
      fonts: DEFAULT_FONTS,
      logo: null,
      isDark: true,
    };
  }
  return ctx;
};

// HOC for themed compositions
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { branding?: Partial<BrandingConfig> }> {
  return function ThemedComponent({ branding, ...props }) {
    return (
      <ThemeProvider branding={branding}>
        <Component {...(props as P)} />
      </ThemeProvider>
    );
  };
}
