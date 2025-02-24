import { Navigation } from '@/components/Navigation';
import { CaseStudyContent } from '@/components/CaseStudyContent';
import { useState } from 'react';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

const CASE_STUDIES = [
  {
    id: 1,
    title: "Portfolio Performance Measurement",
    description: "Learn about Time-Weighted Return (TWR) and Money-Weighted Return (MWR) through a practical case study.",
    status: "available",
    isFree: true
  },
  {
    id: 2,
    title: "Return Measurement Over Time",
    description: "Compare arithmetic and geometric approaches to return measurement.",
    status: "available",
    isFree: true
  },
  {
    id: 3,
    title: "Fixed Income Securities",
    description: "Explore bond pricing and yield calculations.",
    status: "available",
    isFree: true
  },
  {
    id: 4,
    title: "Duration and Convexity",
    description: "Understand interest rate risk measures for fixed income.",
    status: "available",
    isFree: true
  },
  {
    id: 5,
    title: "Portfolio Risk Measures",
    description: "Calculate and interpret various risk metrics.",
    status: "available",
    isFree: true
  },
  {
    id: 6,
    title: "Options Pricing",
    description: "Learn Black-Scholes model and options strategies.",
    status: "available",
    isFree: false
  },
  {
    id: 7,
    title: "Futures and Forward Contracts",
    description: "Pricing and hedging with derivatives.",
    status: "available",
    isFree: false
  },
  {
    id: 8,
    title: "Capital Asset Pricing Model",
    description: "Apply CAPM in portfolio management.",
    status: "available",
    isFree: false
  },
  {
    id: 9,
    title: "Factor Models",
    description: "Multi-factor models and risk decomposition.",
    status: "available",
    isFree: false
  },
  {
    id: 10,
    title: "Portfolio Optimization",
    description: "Modern portfolio theory and efficient frontiers.",
    status: "available",
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
        
        {selectedCase ? (
          <>
            <button 
              onClick={() => setSelectedCase(null)}
              className="mb-6 text-primary hover:text-primary-dark flex items-center"
            >
              ← Back to Case Studies
            </button>
            <CaseStudyContent id={selectedCase} />
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
