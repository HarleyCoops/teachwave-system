
import { Navigation } from '@/components/Navigation';
import { useSupabase } from '@/contexts/SupabaseContext';
import { QuestionContent } from '@/components/QuestionContent';
import { useState } from 'react';

const CASE_STUDIES = [
  {
    id: 1,
    title: "Case Study 1: Portfolio Performance Measurement",
    description: "Learn about Time-Weighted Return (TWR) and Money-Weighted Return (MWR) through a practical case study.",
    status: "available"
  },
  {
    id: 2,
    title: "Case Study 2",
    description: "Coming Soon",
    status: "coming-soon"
  },
  {
    id: 3,
    title: "Case Study 3",
    description: "Coming Soon",
    status: "coming-soon"
  }
];

const Dashboard = () => {
  const { user } = useSupabase();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">CFA Level I Case Studies</h1>
        
        {selectedCase === 1 ? (
          <>
            <button 
              onClick={() => setSelectedCase(null)}
              className="mb-6 text-primary hover:text-primary-dark flex items-center"
            >
              ← Back to Case Studies
            </button>
            <QuestionContent />
          </>
        ) : (
          <div className="grid gap-6">
            {CASE_STUDIES.map((caseStudy) => (
              <div key={caseStudy.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{caseStudy.title}</h3>
                <p className="text-neutral-600 mb-4">
                  {caseStudy.description}
                </p>
                <button 
                  className={`button-primary ${caseStudy.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => caseStudy.status === 'available' && setSelectedCase(caseStudy.id)}
                  disabled={caseStudy.status === 'coming-soon'}
                >
                  {caseStudy.status === 'available' ? 'Start Case Study' : 'Coming Soon'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
