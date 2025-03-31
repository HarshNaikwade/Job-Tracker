import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Briefcase, User } from "lucide-react";

import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { APP_NAME } from "../../constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, logout, currentUser } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest("nav")) {
        setIsOpen(false);
      }

      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isDropdownOpen]);

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.email) return "U";
    return currentUser.email.charAt(0).toUpperCase();
  };

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
            <div className="relative" ref={dropdownRef}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                      aria-label="User menu"
                    >
                      {getUserInitials()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your account</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* User Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">User</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-muted transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            <div className="border-b pb-2 mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {getUserInitials()}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3" onClick={logout}>
              <button
                onClick={logout}
                className="flex items-center space-x-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
