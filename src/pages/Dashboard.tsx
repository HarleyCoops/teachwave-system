
import { Navigation } from '@/components/Navigation';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

const Dashboard = () => {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<number | null>(null);

  // Protect this route - redirect to home if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleStartModule = (moduleIndex: number) => {
    setActiveModule(moduleIndex);
    toast({
      title: "Module Started",
      description: "You've started a new module. Good luck with your studies!",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">CFA Level I Dashboard</h1>
          <div className="text-sm text-neutral-600">
            Welcome back, {user.email}
          </div>
        </div>
        
        {/* Course Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${activeModule !== null ? ((activeModule + 1) / 3) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-600 mt-2">
            {activeModule !== null 
              ? `${Math.round(((activeModule + 1) / 3) * 100)}% Complete` 
              : '0% Complete'}
          </p>
        </div>

        {/* Course Modules */}
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Module 1: Quantitative Methods</h3>
                <p className="text-neutral-600 mb-4">
                  Introduction to Time Value of Money, Statistical Concepts, and Probability Basics
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-600 mb-4">
                  <li>Time Value of Money Calculations</li>
                  <li>Statistical Measures and Probability</li>
                  <li>Hypothesis Testing</li>
                </ul>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-primary font-medium">10 lessons</span>
              </div>
            </div>
            <button 
              className="button-primary"
              onClick={() => handleStartModule(0)}
            >
              {activeModule === 0 ? 'Continue Module' : 'Start Module'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Module 2: Financial Analysis</h3>
                <p className="text-neutral-600 mb-4">
                  Financial Statements, Ratios, and Corporate Finance Fundamentals
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-600 mb-4">
                  <li>Financial Statement Analysis</li>
                  <li>Key Financial Ratios</li>
                  <li>Corporate Finance Metrics</li>
                </ul>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-primary font-medium">12 lessons</span>
              </div>
            </div>
            <button 
              className="button-primary"
              onClick={() => handleStartModule(1)}
              disabled={activeModule !== null && activeModule < 1}
            >
              {activeModule === 1 ? 'Continue Module' : 'Start Module'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Module 3: Asset Valuation</h3>
                <p className="text-neutral-600 mb-4">
                  Equity Investments, Fixed Income, and Derivative Instruments
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-600 mb-4">
                  <li>Equity Valuation Methods</li>
                  <li>Fixed Income Analysis</li>
                  <li>Derivatives and Risk Management</li>
                </ul>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-primary font-medium">15 lessons</span>
              </div>
            </div>
            <button 
              className="button-primary"
              onClick={() => handleStartModule(2)}
              disabled={activeModule !== null && activeModule < 2}
            >
              {activeModule === 2 ? 'Continue Module' : 'Start Module'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
