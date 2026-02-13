export type InputType = 'text' | 'selection-single' | 'selection-multi';

export interface Question {
  id: string;
  label: string;
  type: 'knowledge' | 'principle' | 'judgment' | 'skill';
  text: string;
  inputType: InputType;
  options?: string[]; // For selection questions
}

export interface Branch {
  id: string;
  title: string; 
  label: string; 
  diagnosis: string;
  remediation: {
    type: 'knowledge' | 'exercise';
    content: string; 
    points?: string[];
  };
}

export interface ReactionProblem {
  id: string;
  title: string;
  description?: string; 
  equations: string[]; // Can be used for diagrams/images URLs in this context if needed, or text equations
  questions: Question[];
  answers: {
    [key: string]: string;
  };
  explanationPoints: string[];
  branches: Branch[];
}

export type AppState = 'home' | 'problem' | 'analysis' | 'adaptive';