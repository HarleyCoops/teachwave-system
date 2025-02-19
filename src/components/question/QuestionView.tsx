import React from 'react';
import { ConceptSection } from './ConceptSection';
import { QuestionSection } from './QuestionSection';
import { SolutionSection } from './SolutionSection';

// Sample data structure based on the LaTeX content
const questionData = {
  concept: {
    title: "Key Concept: Portfolio Performance Measurement",
    content: "In evaluating a portfolio's performance over time, especially when dealing with cash flows at irregular intervals, two primary methods are often used: the time-weighted return and the money-weighted return. These methods provide different insights and are appropriate for different scenarios.",
    formulas: {
      title: "Key Formulas",
      items: [
        {
          name: "Time-weighted Return (TWR)",
          description: "This method calculates the geometric mean of the portfolio returns over each period, adjusting for the effects of cash flows. It is not influenced by the timing or size of cash flows and is more appropriate for comparing fund performance since it isolates the manager's investment skill from the effects of cash inflows and outflows.",
          formula: "\\text{TWR} = \\prod_{i=1}^{N} (1 + R_i)^{\\dfrac{1}{N}} - 1"
        },
        {
          name: "Money-weighted Return (MWR)",
          description: "This method considers the timing and size of cash flows and is equivalent to the internal rate of return (IRR) of the portfolio cash flows. It is more reflective of the actual growth experienced by the investor, considering the impact of cash flows.",
          formula: "\\text{MWR} = \\text{IRR} \\quad \\text{solving for} \\quad \\sum_{t=0}^{T} \\dfrac{C_t}{(1 + \\text{MWR})^t} = 0"
        }
      ]
    }
  },
  question: {
    text: "A portfolio manager in a large institutional fund is analyzing the performance of a diversified portfolio over a three-year period where cash injections and withdrawals occurred at irregular intervals. You must calculate both the time-weighted return and the money-weighted return, identify discrepancies between the two, and explain which method is more appropriate in the context of the fund's performance evaluation.",
    parts: [
      {
        text: "Given the following cash flow and portfolio value data, calculate the annual time-weighted return (TWR) over the three years:",
        items: [
          "Begin Year 1: Portfolio Value = $1,000,000",
          "End Year 1: Portfolio Value = $1,080,000, Cash Injection = $50,000",
          "End Year 2: Portfolio Value = $1,200,000, No Cash Flows",
          "End Year 3: Portfolio Value = $1,350,000, Cash Withdrawal = $100,000"
        ]
      },
      {
        text: "Calculate the money-weighted return (MWR) using these cash flows and ending portfolio value."
      }
    ]
  },
  solution: {
    parts: [
      {
        title: "Part 1: Time-weighted Return Calculation",
        steps: [
          {
            text: "Year 1 Return:",
            formula: "1+R_1 = \\dfrac{\\text{Ending Value} + \\text{Withdrawal}}{\\text{Beginning Value} + \\text{Cash Injection}} = \\dfrac{1,080,000}{1,000,000 + 50,000} = 1.0286"
          },
          {
            text: "Year 2 Return:",
            formula: "1+R_2 = \\dfrac{1,200,000}{1,080,000} = 1.1111"
          },
          {
            text: "Year 3 Return:",
            formula: "1+R_3 = \\dfrac{\\text{Ending Portfolio Value}}{\\text{Beginning Portfolio Value - Cash Withdrawal}} = \\dfrac{1,350,000 + 100,000}{1,200,000} = 1.125"
          },
          {
            text: "Annual Time-weighted Return:",
            formula: "\\text{TWR} = \\left(1.0286 \\times 1.1111 \\times 1.125\\right)^{\\dfrac{1}{3}} - 1 = 0.0886 \\text{ or } 8.86\\%"
          }
        ]
      },
      {
        title: "Part 2: Money-weighted Return Calculation",
        steps: [
          {
            text: "The MWR is found using the Cash Flow timeline and the equation for the IRR:",
            formula: "\\begin{align*} \\text{Year 0 (Initial Investment):} &\\ -1,000,000 \\\\ \\text{Year 1 (End):} &\\ -50,000 \\\\ \\text{Year 2 (End):} &\\ 0 \\\\ \\text{Year 3 (End):} &\\ 1,250,000 \\end{align*}"
          },
          {
            text: "Calculate MWR by solving the equation:",
            formula: "-1,000,000 (1+\\text{MWR})^3 - 50,000 (1+\\text{MWR})^2 + 1,250,000 = 0"
          },
          {
            text: "Using a financial calculator or software:",
            formula: "\\text{MWR} = 7.45\\%"
          }
        ]
      }
    ],
    thoughts: {
      title: "Christian's Thoughts",
      content: "When evaluating performance, it's essential to choose the right method. Time-weighted returns reflect the portfolio manager's skill by minimizing the impact of cash flows, making them ideal for comparisons. Money-weighted returns, on the other hand, capture the investor's actual experience by incorporating cash flows. Always remember which perspective you're examining when choosing between these Returns! Consider time-weighted return when you're comparing managers or investments with different levels of cash flows, but if you're focusing on individual wealth growth, money-weighted return can be more insightful. Keep calculator handy and remember the context.",
      author: "christian"
    }
  }
};

export const QuestionView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ConceptSection {...questionData.concept} />
      <QuestionSection question={questionData.question} />
      <SolutionSection {...questionData.solution} />
    </div>
  );
};
