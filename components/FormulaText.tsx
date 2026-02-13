import React from 'react';

// A simple parser to convert the prompt's LaTeX-like syntax to React Nodes
// It handles: $...$ for formulas, \text{}, _, ^, \to, etc. roughly for display
interface FormulaTextProps {
  text: string;
  className?: string;
}

const FormulaText: React.FC<FormulaTextProps> = ({ text, className = "" }) => {
  // Split by $ to find math segments
  const parts = text.split(/(\$[^\$]+\$)/g);

  return (
    <span className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const inner = part.slice(1, -1);
          return <MathSegment key={index} latex={inner} />;
        }
        // Handle newlines
        return part.split('\n').map((line, i) => (
          <React.Fragment key={`${index}-${i}`}>
            {i > 0 && <br />}
            {line}
          </React.Fragment>
        ));
      })}
    </span>
  );
};

const MathSegment: React.FC<{ latex: string }> = ({ latex }) => {
  // Very basic cleanup for display purposes
  let clean = latex
    .replace(/\\text\{([^}]+)\}/g, '$1') // remove \text{}
    .replace(/\\longrightarrow/g, '→')
    .replace(/\\to/g, '→')
    .replace(/\\ +/g, ' '); // remove escaped spaces

  // Simple parser for subscripts and superscripts
  // Note: This is not a full TeX parser, just enough for the provided chemistry content
  const elements: React.ReactNode[] = [];
  let buffer = "";
  
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    
    if (char === '_') {
      if (buffer) elements.push(buffer);
      buffer = "";
      
      // Check if next char is {
      if (clean[i+1] === '{') {
         const end = clean.indexOf('}', i);
         if (end > -1) {
             elements.push(<sub key={i} className="text-xs">{clean.slice(i+2, end)}</sub>);
             i = end;
         }
      } else {
         elements.push(<sub key={i} className="text-xs">{clean[i+1]}</sub>);
         i++;
      }
    } else if (char === '^') {
      if (buffer) elements.push(buffer);
      buffer = "";
      
      if (clean[i+1] === '{') {
         const end = clean.indexOf('}', i);
         if (end > -1) {
             elements.push(<sup key={i} className="text-xs">{clean.slice(i+2, end)}</sup>);
             i = end;
         }
      } else {
         elements.push(<sup key={i} className="text-xs">{clean[i+1]}</sup>);
         i++;
      }
    } else {
      buffer += char;
    }
  }
  if (buffer) elements.push(buffer);

  return <span className="font-serif italic px-1">{elements}</span>;
};

export default FormulaText;