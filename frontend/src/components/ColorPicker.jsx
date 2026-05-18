import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ColorPicker() {
  const { customColor, setCustomColor, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { bg: '#ffdca8', primary: '#f59e0b', text: '#5e3b08' }, // Orange (Default)
    { bg: '#bfdbfe', primary: '#3b82f6', text: '#1e3a8a' }, // Light Blue
    { bg: '#bbf7d0', primary: '#22c55e', text: '#14532d' }, // Light Green
    { bg: '#312e81', primary: '#818cf8', text: '#e0e7ff' }, // Dark Indigo
    { bg: '#ddd6fe', primary: '#8b5cf6', text: '#4c1d95' }, // Purple
    { bg: '#fbcfe8', primary: '#ec4899', text: '#831843' }, // Pink
    { bg: '#99f6e4', primary: '#14b8a6', text: '#134e4a' }, // Teal
    { bg: '#f5e5ce', primary: '#d97706', text: '#78350f' }  // Beige
  ];

  if (theme !== 'light') return null;

  const currentThemeObj = customColor ? JSON.parse(customColor) : themes[0];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <motion.div
        layout
        style={{
          display: 'flex', 
          alignItems: 'center',
          gap: '12px', 
          padding: '8px 12px', 
          borderRadius: '30px', 
          boxShadow: 'var(--neu-flat)',
          background: 'var(--bg)',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ 
          width: '24px', height: '24px', borderRadius: '50%', 
          background: currentThemeObj.bg, 
          boxShadow: 'var(--neu-flat-sm)',
          border: '2px solid white'
        }} />
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              style={{ display: 'flex', gap: '8px', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
              {themes.map(t => {
                const themeStr = JSON.stringify(t);
                const isActive = customColor === themeStr || (t.bg === '#ffdca8' && !customColor);
                return (
                  <motion.div
                    key={t.bg}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setCustomColor(t.bg === '#ffdca8' ? '' : themeStr);
                      setIsOpen(false);
                    }}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: t.bg, 
                      boxShadow: isActive ? 'var(--neu-inset)' : 'var(--neu-flat-sm)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: isActive ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent'
                    }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
