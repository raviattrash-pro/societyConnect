import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [customColor, setCustomColor] = useState(() => localStorage.getItem('customColor') || '');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (customColor && theme === 'light') {
      try {
        const parsed = JSON.parse(customColor);
        document.documentElement.style.setProperty('--bg', parsed.bg);
        document.documentElement.style.setProperty('--bg-card', parsed.bg);
        document.documentElement.style.setProperty('--bg-elevated', parsed.bg);
        document.documentElement.style.setProperty('--bg-gradient', parsed.bg);
        document.documentElement.style.setProperty('--bg-card-hover', parsed.bg);
        document.documentElement.style.setProperty('--primary', parsed.primary);
        document.documentElement.style.setProperty('--text', parsed.text);
      } catch(e) {
        // Fallback for old customColor string
        document.documentElement.style.setProperty('--bg', customColor);
      }
    } else {
      document.documentElement.style.removeProperty('--bg');
      document.documentElement.style.removeProperty('--bg-card');
      document.documentElement.style.removeProperty('--bg-elevated');
      document.documentElement.style.removeProperty('--bg-gradient');
      document.documentElement.style.removeProperty('--bg-card-hover');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--text');
    }
    localStorage.setItem('customColor', customColor);
  }, [theme, customColor]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, customColor, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
