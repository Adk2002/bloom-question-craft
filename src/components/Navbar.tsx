import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { AuthContext } from "@/pages/(auth)/context/AuthContext";

import {
  Share2,
  User,
  BookOpen,
  MessageSquare,
  Home,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const auth = useContext(AuthContext);

  if (!auth) {
    // Optionally render nothing or a fallback
    return null;
  }

  const { isAuthenticated, logout } = auth;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    ...(isAuthenticated
      ? [
          { path: "/chat", label: "Generate Questions", icon: MessageSquare },
          { path: "/dashboard", label: "Dashboard", icon: User },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* This is the Logo part */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-brand-primary">
              QuestionCraft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-brand-primary bg-brand-accent/20"
                      : "text-gray-600 hover:text-brand-primary hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Login button (always visible, green) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                onClick={logout}
              >
                😒
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  😁
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Share Button */}
          <div className="hidden md:flex items-center space-x-4">
            {location.pathname === "/chat" && (
              <Button
                variant="outline"
                size="sm"
                className="border-brand-secondary text-brand-secondary hover:bg-purple-600 hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Chat
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-brand-primary bg-brand-accent/20"
                        : "text-gray-600 hover:text-brand-primary hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {location.pathname === "/chat" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brand-secondary text-brand-secondary hover:bg-purple-600 hover:text-white w-fit mx-3 mt-2"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Chat
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
