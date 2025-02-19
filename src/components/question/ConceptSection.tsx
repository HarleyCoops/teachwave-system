import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface ConceptSectionProps {
  title: string;
  content: string;
  formulas?: {
    title: string;
    items: Array<{
      name: string;
      description: string;
      formula: string;
    }>;
  };
}

export const ConceptSection: React.FC<ConceptSectionProps> = ({
  title,
  content,
  formulas
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="prose max-w-none mb-6">
        <p className="text-neutral-700 leading-relaxed">{content}</p>
      </div>
      
      {formulas && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">{formulas.title}</h3>
          <div className="space-y-6">
            {formulas.items.map((item, index) => (
              <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                <div className="font-semibold mb-2">{index + 1}. {item.name}</div>
                <p className="text-neutral-700 mb-3">{item.description}</p>
                <div className="flex justify-center bg-white p-4 rounded-md shadow-sm">
                  <BlockMath>{item.formula}</BlockMath>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
