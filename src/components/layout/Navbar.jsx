import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Briefcase } from "lucide-react";

import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { APP_NAME } from "../../constants";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest("nav")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Add blur effect to nav on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="page-container flex items-center justify-between py-4">
        {/* Logo and Brand */}
        <Link to={"/"} className="flex items-center space-x-2 text-primary">
          <Briefcase className="w-6 h-6" />
          <span className="text-xl font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-4">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground/80 hover:text-primary transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isAuthenticated && (
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md shadow-md overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="page-container py-4 space-y-4">
            <button
              onClick={logout}
              className="flex items-center space-x-2 py-2 text-foreground/80 hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
