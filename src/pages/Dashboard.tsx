import { Navigation } from '@/components/Navigation';
import { QuestionContent } from '@/components/QuestionContent';
import { useState } from 'react';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

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
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      await stripe.createCheckoutSession(STRIPE_PRICE_ID);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start subscription process',
        variant: 'destructive',
      });
    }
  };

  const handleCaseStudyClick = (caseStudy: typeof CASE_STUDIES[0]) => {
    if (caseStudy.status !== 'available') return;
    if (!caseStudy.isFree) {
      // Show subscription required message
      toast({
        title: 'Premium Content',
        description: 'Subscribe to access this case study',
      });
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
                  {!caseStudy.isFree && (
                    <span className="text-sm text-neutral-500">Premium</span>
                  )}
                </div>
                <p className="text-neutral-600 mb-4">
                  {caseStudy.description}
                </p>
                {caseStudy.status === 'available' ? (
                  caseStudy.isFree ? (
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
                      <button
                        onClick={handleSubscribe}
                        className="w-full bg-primary text-white hover:bg-primary/90 py-2 px-4 rounded-md transition-colors"
                      >
                        Unlock Premium Access
                      </button>
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
