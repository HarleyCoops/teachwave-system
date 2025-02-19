import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Math } from './Math';

export const QuestionContent = () => {
  const [solutionVisible, setSolutionVisible] = useState(false);
  return (
    <div className="space-y-8">
      {/* Key Concept Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Key Concept: Portfolio Performance Measurement</h2>
        <p className="text-neutral-700 mb-6">
          In evaluating a portfolio's performance over time, especially when dealing with cash flows at irregular intervals, 
          two primary methods are often used: the time-weighted return and the money-weighted return. These methods provide 
          different insights and are appropriate for different scenarios.
        </p>
        
        <h3 className="text-xl font-semibold mb-4">Key Formulas</h3>
        <div className="space-y-6">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="font-semibold mb-2">1. Time-weighted Return (TWR)</div>
            <p className="text-neutral-700 mb-3">
              This method calculates the geometric mean of the portfolio returns over each period, adjusting for the effects 
              of cash flows. It is not influenced by the timing or size of cash flows and is more appropriate for comparing 
              fund performance since it isolates the manager's investment skill from the effects of cash inflows and outflows.
            </p>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <Math 
                display
                math="\text{TWR} = \prod_{i=1}^{N} (1 + R_i)^{\dfrac{1}{N}} - 1"
              />
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="font-semibold mb-2">2. Money-weighted Return (MWR)</div>
            <p className="text-neutral-700 mb-3">
              This method considers the timing and size of cash flows and is equivalent to the internal rate of return (IRR) 
              of the portfolio cash flows. It is more reflective of the actual growth experienced by the investor, considering 
              the impact of cash flows.
            </p>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <Math 
                display
                math="\text{MWR} = \text{IRR} \quad \text{solving for} \quad \sum_{t=0}^{T} \dfrac{C_t}{(1 + \text{MWR})^t} = 0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Practice Question Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Practice Question</h2>
        <p className="text-neutral-700 mb-6">
          A portfolio manager in a large institutional fund is analyzing the performance of a diversified portfolio over a 
          three-year period where cash injections and withdrawals occurred at irregular intervals. You must calculate both 
          the time-weighted return and the money-weighted return, identify discrepancies between the two, and explain which 
          method is more appropriate in the context of the fund's performance evaluation.
        </p>

        <ol className="list-decimal list-outside ml-6 space-y-4">
          <li>
            <div className="text-neutral-700">
              Given the following cash flow and portfolio value data, calculate the annual time-weighted return (TWR) over 
              the three years:
            </div>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Begin Year 1: Portfolio Value = $1,000,000</li>
              <li>End Year 1: Portfolio Value = $1,080,000, Cash Injection = $50,000</li>
              <li>End Year 2: Portfolio Value = $1,200,000, No Cash Flows</li>
              <li>End Year 3: Portfolio Value = $1,350,000, Cash Withdrawal = $100,000</li>
            </ul>
          </li>
          <li>
            <div className="text-neutral-700">
              Calculate the money-weighted return (MWR) using these cash flows and ending portfolio value.
            </div>
          </li>
        </ol>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Part 1: Time-weighted Return Calculation</h3>
              <ol className="list-decimal list-outside ml-6 space-y-4">
                <li>
                  <div className="text-neutral-700">Year 1 Return:</div>
                  <div className="bg-neutral-50 p-4 rounded-md my-2">
                    <Math 
                      display
                      math="1+R_1 = \dfrac{1,080,000}{1,000,000 + 50,000} = 1.0286"
                    />
                  </div>
                </li>
                <li>
                  <div className="text-neutral-700">Year 2 Return:</div>
                  <div className="bg-neutral-50 p-4 rounded-md my-2">
                    <Math 
                      display
                      math="1+R_2 = \dfrac{1,200,000}{1,080,000} = 1.1111"
                    />
                  </div>
                </li>
                <li>
                  <div className="text-neutral-700">Year 3 Return:</div>
                  <div className="bg-neutral-50 p-4 rounded-md my-2">
                    <Math 
                      display
                      math="1+R_3 = \dfrac{1,350,000 + 100,000}{1,200,000} = 1.125"
                    />
                  </div>
                </li>
                <li>
                  <div className="text-neutral-700">Annual Time-weighted Return:</div>
                  <div className="bg-neutral-50 p-4 rounded-md my-2">
                    <Math 
                      display
                      math="\text{TWR} = (1.0286 \times 1.1111 \times 1.125)^{\frac{1}{3}} - 1 = 0.0886 \text{ or } 8.86\%"
                    />
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Part 2: Money-weighted Return Calculation</h3>
              <div className="space-y-4">
                <p className="text-neutral-700">The MWR is found using the Cash Flow timeline and the equation for the IRR:</p>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <Math 
                    display
                    math="\begin{align*}
                      \text{Year 0 (Initial Investment):} &\ -1,000,000 \\
                      \text{Year 1 (End):} &\ -50,000 \\
                      \text{Year 2 (End):} &\ 0 \\
                      \text{Year 3 (End):} &\ 1,250,000
                    \end{align*}"
                  />
                </div>
                <p className="text-neutral-700">Calculate MWR by solving the equation:</p>
                <div className="bg-neutral-50 p-4 rounded-md my-2">
                  <Math 
                    display
                    math="-1,000,000(1+\text{MWR})^3 - 50,000(1+\text{MWR})^2 + 1,250,000 = 0"
                  />
                </div>
                <p className="text-neutral-700">Using a financial calculator or software:</p>
                <div className="bg-neutral-50 p-4 rounded-md my-2">
                  <Math 
                    display
                    math="\text{MWR} = 7.45\%"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Christian's Thoughts</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                When evaluating performance, it's essential to choose the right method. Time-weighted returns reflect the 
                portfolio manager's skill by minimizing the impact of cash flows, making them ideal for comparisons. 
                Money-weighted returns, on the other hand, capture the investor's actual experience by incorporating cash flows. 
                Always remember which perspective you're examining when choosing between these Returns!
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Consider time-weighted return when you're comparing managers or investments with different levels of cash flows, 
                but if you're focusing on individual wealth growth, money-weighted return can be more insightful. Keep calculator 
                handy and remember the context.
              </p>
              <p className="text-right text-neutral-600 italic">-christian</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
