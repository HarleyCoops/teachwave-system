import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SolutionPart {
  title: string;
  steps: Array<{
    text?: string;
    formula?: string;
    explanation?: string;
  }>;
}

interface SolutionSectionProps {
  parts: SolutionPart[];
  thoughts?: {
    title: string;
    content: string;
    author: string;
  };
}

export const SolutionSection: React.FC<SolutionSectionProps> = ({ parts, thoughts }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="w-full flex items-center justify-between text-2xl font-semibold mb-4 text-left"
      >
        <span>Solution and Explanation</span>
        {isVisible ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
      </button>

      {isVisible && (
        <div className="space-y-8">
          {parts.map((part, index) => (
            <div key={index} className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">{part.title}</h3>
              <ol className="list-decimal list-outside ml-6 space-y-6">
                {part.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="pl-2">
                    {step.text && (
                      <div className="text-neutral-700 mb-2">{step.text}</div>
                    )}
                    {step.formula && (
                      <div className="flex justify-center bg-neutral-50 p-4 rounded-md my-4">
                        <BlockMath>{step.formula}</BlockMath>
                      </div>
                    )}
                    {step.explanation && (
                      <p className="text-neutral-600 mt-2">{step.explanation}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}

          {thoughts && (
            <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{thoughts.title}</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">{thoughts.content}</p>
              <p className="text-right text-neutral-600 italic">-{thoughts.author}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
