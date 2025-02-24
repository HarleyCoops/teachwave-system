import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Import all case study content
import question1 from '../content/question_1.json';
import question2 from '../content/question_2.json';
import question3 from '../content/question_3.json';
import question4 from '../content/question_4.json';
import question5 from '../content/question_5.json';
import question6 from '../content/question_6.json';
import question7 from '../content/question_7.json';
import question8 from '../content/question_8.json';
import question9 from '../content/question_9.json';
import question10 from '../content/question_10.json';

interface KaTeXDelimiter {
  left: string;
  right: string;
  display: boolean;
}

interface KaTeXOptions {
  delimiters: KaTeXDelimiter[];
  throwOnError: boolean;
}

declare global {
  interface Window {
    renderMathInElement: (element: HTMLElement, options: KaTeXOptions) => void;
  }
}

interface CaseStudyContent {
  keyConceptSection: string;
  practiceQuestion: string;
  solution: string;
}

const questions: Record<number, CaseStudyContent> = {
  1: question1 as CaseStudyContent,
  2: question2 as CaseStudyContent,
  3: question3 as CaseStudyContent,
  4: question4 as CaseStudyContent,
  5: question5 as CaseStudyContent,
  6: question6 as CaseStudyContent,
  7: question7 as CaseStudyContent,
  8: question8 as CaseStudyContent,
  9: question9 as CaseStudyContent,
  10: question10 as CaseStudyContent,
};

interface Props {
  id: number;
}

export const CaseStudyContent = ({ id }: Props) => {
  const [solutionVisible, setSolutionVisible] = useState(false);
  
  // Get content for this question
  const content = questions[id];

  useEffect(() => {
    // Render math when content changes
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          {left: "\\[", right: "\\]", display: true},
          {left: "\\(", right: "\\)", display: false}
        ],
        throwOnError: false
      });
    }
  }, [id, content, solutionVisible]);

  return (
    <div className="space-y-8">
      {/* Key Concept Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div dangerouslySetInnerHTML={{ __html: content.keyConceptSection }} />
      </div>

      {/* Practice Question Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div dangerouslySetInnerHTML={{ __html: content.practiceQuestion }} />
      </div>

      {/* Solution Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button 
          className="w-full flex items-center justify-between text-2xl font-semibold mb-4 text-left"
          onClick={() => setSolutionVisible(!solutionVisible)}
        >
          <span>Solution and Explanation</span>
          {solutionVisible ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </button>

        {solutionVisible && (
          <div dangerouslySetInnerHTML={{ __html: content.solution }} />
        )}
      </div>
    </div>
  );
};
