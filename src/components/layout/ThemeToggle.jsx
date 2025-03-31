
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-foreground/80" />
      ) : (
        <Moon className="w-5 h-5 text-foreground/80" />
      )}
    </button>
  );
};

export default ThemeToggle;
