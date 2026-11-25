import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('smartexpense_theme') || 'dark');
  const [currency, setCurrency] = useState(() => localStorage.getItem('smartexpense_currency') || 'INR');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smartexpense_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateCurrency = (curr) => {
    setCurrency(curr);
    localStorage.setItem('smartexpense_currency', curr);
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    let symbol = '₹';
    let locale = 'en-IN';

    if (currency === 'USD') {
      symbol = '$';
      locale = 'en-US';
    } else if (currency === 'EUR') {
      symbol = '€';
      locale = 'de-DE';
    } else if (currency === 'GBP') {
      symbol = '£';
      locale = 'en-GB';
    }

    return `${symbol}${num.toLocaleString(locale, {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        updateCurrency,
        formatCurrency,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
