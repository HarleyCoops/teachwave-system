import { Navigation } from '@/components/Navigation';
import { useSupabase } from '@/contexts/SupabaseContext';
import { QuestionContent } from '@/components/QuestionContent';
import { useState } from 'react';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { SubscriptionButton } from '@/components/SubscriptionButton';
import { useSubscription } from '@/lib/stripe';

const CASE_STUDIES = [
  {
    id: 1,
    title: "Case Study 1: Portfolio Performance Measurement",
    description: "Learn about Time-Weighted Return (TWR) and Money-Weighted Return (MWR) through a practical case study.",
    status: "available",
    isFree: true
  },
  {
    id: 2,
    title: "Case Study 2",
    description: "Coming Soon",
    status: "coming-soon",
    isFree: false
  },
  {
    id: 3,
    title: "Case Study 3",
    description: "Coming Soon",
    status: "coming-soon",
    isFree: false
  }
];

const Dashboard = () => {
  const { user } = useSupabase();
  const { isActive: isSubscribed } = useSubscription();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  const handleCaseStudyClick = (caseStudy: typeof CASE_STUDIES[0]) => {
    if (caseStudy.status !== 'available') return;
    if (!caseStudy.isFree && !isSubscribed) {
      // Show subscription required message
      return;
    }
    setSelectedCase(caseStudy.id);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold">CFA Level I Case Studies</h1>
          {user && (
            <div className="flex flex-col gap-2">
              <SubscriptionStatus className="w-80" />
              {!isSubscribed && (
                <SubscriptionButton className="w-full">
                  Upgrade to Premium
                </SubscriptionButton>
              )}
            </div>
          )}
        </div>
        
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
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{caseStudy.title}</h3>
                    {caseStudy.isFree && (
                      <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mt-1">
                        Free Preview
                      </span>
                    )}
                  </div>
                  {!caseStudy.isFree && !isSubscribed && (
                    <span className="text-sm text-neutral-500">Premium</span>
                  )}
                </div>
                <p className="text-neutral-600 mb-4">
                  {caseStudy.description}
                </p>
                {caseStudy.status === 'available' ? (
                  caseStudy.isFree || isSubscribed ? (
                    <button 
                      className="button-primary"
                      onClick={() => handleCaseStudyClick(caseStudy)}
                    >
                      Start Case Study
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-600">
                        Subscribe to access this case study
                      </p>
                      <SubscriptionButton>
                        Unlock Premium Access
                      </SubscriptionButton>
                    </div>
                  )
                ) : (
                  <button 
                    className="button-primary opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
