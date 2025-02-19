
import { Navigation } from '@/components/Navigation';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useSupabase();

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  // Only redirect after we've confirmed there's no user
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">CFA Level I Dashboard</h1>
        
        {/* Course Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-sm text-neutral-600 mt-2">0% Complete</p>
        </div>

        {/* Course Modules */}
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Module 1: Quantitative Methods</h3>
            <p className="text-neutral-600 mb-4">
              Introduction to Time Value of Money, Statistical Concepts, and Probability Basics
            </p>
            <button className="button-primary">Start Module</button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Module 2: Financial Analysis</h3>
            <p className="text-neutral-600 mb-4">
              Financial Statements, Ratios, and Corporate Finance Fundamentals
            </p>
            <button className="button-primary" disabled>Coming Soon</button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Module 3: Asset Valuation</h3>
            <p className="text-neutral-600 mb-4">
              Equity Investments, Fixed Income, and Derivative Instruments
            </p>
            <button className="button-primary" disabled>Coming Soon</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
