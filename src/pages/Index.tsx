
import { Navigation } from '@/components/Navigation';
import { CourseCard } from '@/components/CourseCard';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const CFA_COURSES = [
  {
    title: "2025 CFA Level I",
    description: "Master fundamental concepts through practice-based case studies. Includes comprehensive math review and detailed solutions.",
    instructor: "justCalculations Team",
    duration: "300+ hours",
    students: 2450,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    category: "Now Available"
  },
  {
    title: "2025 CFA Level II",
    description: "Advanced quantitative methods and complex case studies. Focus on practical application and problem-solving.",
    instructor: "justCalculations Team",
    duration: "300+ hours",
    students: 0,
    rating: 0,
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    category: "Available March 2025"
  },
  {
    title: "2025 CFA Level III",
    description: "Master portfolio management and complex financial analysis through comprehensive case studies.",
    instructor: "justCalculations Team",
    duration: "300+ hours",
    students: 0,
    rating: 0,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    category: "Available April 2025"
  }
];

const Index = () => {
  const { signInWithGoogle, signInWithMagicLink, signOut, user } = useSupabase();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect');

  // Auto-scroll to auth section if there's a redirect parameter
  useEffect(() => {
    if (redirectPath && !user) {
      document.querySelector('.auth-section')?.scrollIntoView({ behavior: 'smooth' });
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this content",
      });
    } else if (redirectPath && user) {
      // If user is already logged in and there's a redirect, navigate there
      navigate(redirectPath, { replace: true });
    }
  }, [redirectPath, user, navigate, toast]);

  const handleMagicLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithMagicLink(email);
  };

  const handleStartCourse = () => {
    console.log('Start Course clicked');
    if (user) {
      console.log('User is logged in, navigating to dashboard');
      navigate('/dashboard');
      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });
    } else {
      console.log('User not logged in, scrolling to auth section');
      document.querySelector('.auth-section')?.scrollIntoView({ behavior: 'smooth' });
      toast({
        title: "Sign in required",
        description: "Please sign in to access the course",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-down" style={{ animationDelay: "100ms" }}>
            Master CFA Calculations Through
            <span className="text-primary"> Case Studies</span>
          </h1>
          <p className="text-accent-dark text-lg mb-8 max-w-2xl mx-auto animate-fade-down" style={{ animationDelay: "200ms" }}>
            Practice-focused learning with detailed mathematical explanations, step-by-step solutions, and expert insights.
          </p>
          <button 
            className="button-primary text-lg px-8 py-3 animate-fade-down" 
            style={{ animationDelay: "300ms" }}
            onClick={() => {
              console.log('Hero button clicked');
              handleStartCourse();
            }}
          >
            Start CFA Level I
          </button>
        </div>
      </section>

      {/* Auth Section */}
      <section className={`py-16 px-4 auth-section ${redirectPath ? 'bg-accent-off-white' : ''}`}>
        <div className="container mx-auto max-w-md">
          <div className="bg-accent-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-accent-dark">
              {user ? 'Welcome!' : redirectPath ? 'Sign in to Continue' : 'Sign in to justCalculations™'}
            </h2>
            {redirectPath && !user && (
              <p className="text-center text-accent-dark mb-6">
                Sign in to access the requested content
              </p>
            )}
            
            {user ? (
              <div className="text-center">
                <p className="mb-4">Logged in as: {user.email}</p>
                <button
                  onClick={() => signOut()}
                  className="button-primary w-full"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4 mb-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="submit"
                    className="button-primary w-full"
                  >
                    Sign in with Magic Link
                  </button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-accent-dark">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary rounded-md hover:bg-primary-light hover:border-primary-light transition-colors text-accent-dark"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CFA Programs Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">CFA Program Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CFA_COURSES.map((course, index) => (
              <CourseCard 
                key={index} 
                {...course} 
                onClick={() => {
                  console.log('Course card clicked');
                  handleStartCourse();
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Format Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Case Study Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-accent-gold-light">
              <h3 className="font-semibold text-lg mb-3 text-accent-dark">Key Concepts</h3>
              <p className="text-accent-dark">Clear explanations with mathematical foundations and practical applications</p>
            </div>
            <div className="p-6 rounded-lg bg-accent-gold-light">
              <h3 className="font-semibold text-lg mb-3 text-accent-dark">Practice Questions</h3>
              <p className="text-accent-dark">Comprehensive problems that test your understanding and application</p>
            </div>
            <div className="p-6 rounded-lg bg-accent-gold-light">
              <h3 className="font-semibold text-lg mb-3 text-accent-dark">Detailed Solutions</h3>
              <p className="text-accent-dark">Step-by-step explanations with expert insights and tips</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
