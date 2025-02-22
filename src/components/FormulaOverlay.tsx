import { useEffect, useRef } from 'react';

const formulas = [
  'E(R_p)',
  'σ(R_p)',
  'Var(R_p)',
  'β_p',
  'α_p',
  'R_f',
  'CAPM',
  'MPT',
  'Sharpe',
  'Treynor',
  'Jensen',
  'M²',
];

export const FormulaOverlay = () => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createFormulaElement = () => {
      const formula = document.createElement('div');
      formula.className = 'absolute text-white font-serif text-xl';
      formula.style.opacity = (Math.random() * 0.1 + 0.02).toString(); // Random opacity between 0.02 and 0.12
      formula.style.transform = `rotate(${Math.random() * 30 - 15}deg)`; // Random rotation between -15 and 15 degrees
      formula.textContent = formulas[Math.floor(Math.random() * formulas.length)];
      return formula;
    };

    const overlay = overlayRef.current;
    if (!overlay) return;

    // Clear existing formulas
    overlay.innerHTML = '';

    // Create grid of formulas
    const columns = window.innerWidth < 768 ? 4 : 8;
    const rows = 6;
    const width = overlay.offsetWidth / columns;
    const height = overlay.offsetHeight / rows;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const formula = createFormulaElement();
        formula.style.left = `${(i * width) + (Math.random() * width * 0.5)}px`;
        formula.style.top = `${(j * height) + (Math.random() * height * 0.5)}px`;
        overlay.appendChild(formula);
      }
    }
  }, []);

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 z-[1] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
};
