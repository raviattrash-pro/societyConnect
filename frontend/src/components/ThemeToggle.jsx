import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiMoon, HiSun } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: 'none',
        background: 'var(--bg)',
        boxShadow: 'var(--neu-flat)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text)',
        fontSize: '1.2rem',
        transition: 'all 0.3s ease'
      }}
      className="btn"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {theme === 'light' ? <HiMoon /> : <HiSun />}
      </motion.div>
    </button>
  );
}
