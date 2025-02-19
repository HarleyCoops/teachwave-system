import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface QuestionData {
  text: string;
  parts: Array<{
    text: string;
    items?: string[];
  }>;
}

interface QuestionSectionProps {
  question: QuestionData;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Practice Question</h2>
      <div className="prose max-w-none">
        <p className="text-neutral-700 leading-relaxed mb-6">{question.text}</p>
        
        <ol className="list-decimal list-outside ml-6 space-y-4">
          {question.parts.map((part, index) => (
            <li key={index} className="pl-2">
              <div className="text-neutral-700">{part.text}</div>
              {part.items && (
                <ul className="list-disc list-inside mt-2 space-y-2">
                  {part.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-neutral-600 ml-4">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
