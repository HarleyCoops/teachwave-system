import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const Math: React.FC<MathProps> = ({ math, display = false, className = '' }) => {
  try {
    if (display) {
      return (
        <div className={`flex justify-center overflow-x-auto ${className}`}>
          <BlockMath>{math}</BlockMath>
        </div>
      );
    }
    return <InlineMath>{math}</InlineMath>;
  } catch (error) {
    console.error('Math rendering error:', error);
    return <code className="text-red-500">{math}</code>;
  }
};
