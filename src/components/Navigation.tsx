
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useToast } from '@/components/ui/use-toast';

export const Navigation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabase();
  const { toast } = useToast();

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'CFA Courses', path: '/dashboard' },
    { name: 'Study Portal', path: '/dashboard' },
    { name: 'About', path: '/about' },
  ];

  const handleStartLearning = () => {
    console.log('Start Learning clicked');
    if (user) {
      console.log('User is logged in, navigating to dashboard');
      navigate('/dashboard');
      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });
    } else {
      console.log('User not logged in');
      if (location.pathname === '/') {
        document.querySelector('.auth-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/?auth=true');
      }
      toast({
        title: "Sign in required",
        description: "Please sign in to access the dashboard",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">justCalculations</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="nav-link font-medium"
                onClick={(e) => {
                  if ((item.path === '/dashboard' || item.path === '/courses') && !user) {
                    e.preventDefault();
                    handleStartLearning();
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
            <button 
              className="button-primary"
              onClick={handleStartLearning}
            >
              Start Learning
            </button>
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 glass animate-fade-down">
            <div className="px-4 py-2 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block py-2 nav-link font-medium"
                  onClick={(e) => {
                    if ((item.path === '/dashboard' || item.path === '/courses') && !user) {
                      e.preventDefault();
                      handleStartLearning();
                    }
                    setIsOpen(false);
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <button 
                className="button-primary w-full mt-4"
                onClick={() => {
                  setIsOpen(false);
                  handleStartLearning();
                }}
              >
                Start Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
