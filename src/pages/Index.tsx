import { Navigation } from '@/components/Navigation';
import { CourseCard } from '@/components/CourseCard';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useState } from 'react';

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
  const { signIn, signUp, signOut, user } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary animate-fade-down">
            Welcome to justCalculations
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-down" style={{ animationDelay: "100ms" }}>
            Master CFA Calculations Through
            <span className="text-primary"> Case Studies</span>
          </h1>
          <p className="text-neutral-600 text-lg mb-8 max-w-2xl mx-auto animate-fade-down" style={{ animationDelay: "200ms" }}>
            Practice-focused learning with detailed mathematical explanations, step-by-step solutions, and expert insights.
          </p>
          <button className="button-primary text-lg px-8 py-3 animate-fade-down" style={{ animationDelay: "300ms" }}>
            Start CFA Level I
          </button>
        </div>
      </section>

      {/* Test Login Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {user ? 'Welcome!' : 'Test Login'}
            </h2>
            
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
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleSignIn}
                    className="button-primary w-full"
                    type="button"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="button-secondary w-full"
                    type="button"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
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
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Format Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Case Study Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-accent-purple/20">
              <h3 className="font-semibold text-lg mb-3">Key Concepts</h3>
              <p className="text-neutral-600">Clear explanations with mathematical foundations and practical applications</p>
            </div>
            <div className="p-6 rounded-lg bg-accent-green/20">
              <h3 className="font-semibold text-lg mb-3">Practice Questions</h3>
              <p className="text-neutral-600">Comprehensive problems that test your understanding and application</p>
            </div>
            <div className="p-6 rounded-lg bg-accent-blue/20">
              <h3 className="font-semibold text-lg mb-3">Detailed Solutions</h3>
              <p className="text-neutral-600">Step-by-step explanations with expert insights and tips</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
