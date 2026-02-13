import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, Lightbulb, AlertTriangle, Check, PenTool, LayoutList } from 'lucide-react';
import { PROBLEMS } from './constants';
import { AppState, Branch, ReactionProblem } from './types';
import FormulaText from './components/FormulaText';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('home');
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const startLearning = () => setView('problem');
  const startAnalysis = () => setView('analysis');
  const selectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setView('adaptive');
  };
  const backToHome = () => {
    setView('home');
    setSelectedBranch(null);
  };
  
  const currentProblem = PROBLEMS[currentProblemIdx];

  const goToNextProblem = () => {
    if (currentProblemIdx < PROBLEMS.length - 1) {
      setCurrentProblemIdx(prev => prev + 1);
      setView('problem'); // Ensure we stay in problem view
    }
  };

  const goToPrevProblem = () => {
    if (currentProblemIdx > 0) {
      setCurrentProblemIdx(prev => prev - 1);
      setView('problem');
    }
  };

  return (
    <div className="min-h-screen relative flex justify-center p-4 md:p-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50" 
           style={{
             backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', 
             backgroundSize: '24px 24px'
           }} 
      />

      <div className="w-full max-w-3xl z-10 relative">
        {view === 'home' && (
          <HomeView onStart={startLearning} totalProblems={PROBLEMS.length} />
        )}

        {view === 'problem' && (
          <ProblemView 
            problem={currentProblem}
            problemIndex={currentProblemIdx}
            totalProblems={PROBLEMS.length}
            onAnalyze={startAnalysis} 
            onHome={backToHome}
            onNext={goToNextProblem}
            onPrev={goToPrevProblem}
          />
        )}

        {view === 'analysis' && (
          <AnalysisView 
            problem={currentProblem}
            onSelectBranch={selectBranch} 
            onBack={() => setView('problem')} 
          />
        )}

        {view === 'adaptive' && selectedBranch && (
          <AdaptiveView 
            branch={selectedBranch} 
            onBack={() => setView('analysis')} 
            onHome={backToHome} 
          />
        )}
      </div>
    </div>
  );
};

// --- View Components ---

const HomeView: React.FC<{ onStart: () => void, totalProblems: number }> = ({ onStart, totalProblems }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full transform transition-all duration-500 hover:scale-[1.01]">
        {/* Notebook Spiral Binding Visual */}
        <div className="absolute left-0 top-8 bottom-8 w-4 md:w-8 flex flex-col justify-evenly items-center -ml-2 md:-ml-4">
           {[...Array(10)].map((_, i) => (
             <div key={i} className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-slate-200 shadow-inner border border-slate-300" />
           ))}
        </div>

        <div className="pl-6 md:pl-8">
          <p className="handwritten text-[#D8A7B1] text-xl md:text-2xl mb-6 font-bold tracking-wider rotate-[-2deg]">
            「わかったつもり」はもう終わり。<br/>学びは停止点から。
          </p>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-8 leading-tight tracking-tight">
            化学基礎：<br/>
            <span className="text-3xl md:text-4xl font-normal text-slate-500 mt-2 block">模擬試験 完全網羅編</span>
          </h1>

          <div className="space-y-4">
             <div className="flex items-center gap-3 text-slate-500 text-sm">
                <BookOpen size={18} />
                <span>My Notebook / Mock Exam</span>
             </div>
             <div className="flex items-center gap-3 text-slate-500 text-sm">
                <LayoutList size={18} />
                <span>Total Chapters: {totalProblems}</span>
             </div>
          </div>
        </div>

        {/* Tab Button */}
        <button 
          onClick={onStart}
          className="absolute top-1/2 -right-4 md:-right-8 transform -translate-y-1/2 bg-[#1a3b5c] text-white py-8 px-2 md:px-3 rounded-r-xl shadow-lg hover:bg-[#2C3E50] hover:-translate-x-1 transition-all flex flex-col items-center justify-center gap-2 group"
          aria-label="Start Learning"
        >
          <span className="writing-vertical-rl font-bold tracking-widest text-sm md:text-base opacity-90 group-hover:opacity-100">学習開始</span>
          <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={16} />
        </button>
      </div>
    </div>
  );
};

const ProblemView: React.FC<{ 
  problem: ReactionProblem, 
  problemIndex: number,
  totalProblems: number,
  onAnalyze: () => void, 
  onHome: () => void,
  onNext: () => void,
  onPrev: () => void
}> = ({ problem, problemIndex, totalProblems, onAnalyze, onHome, onNext, onPrev }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  // Reset state when problem changes
  const [userInputs, setUserInputs] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    setShowAnswer(false);
    setUserInputs({});
  }, [problem.id]);

  const handleInputChange = (id: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectionChange = (id: string, option: string, isMulti: boolean) => {
    setUserInputs(prev => {
      const current = prev[id];
      if (isMulti) {
        const currentArray = Array.isArray(current) ? current : [];
        if (currentArray.includes(option)) {
          return { ...prev, [id]: currentArray.filter(o => o !== option) };
        } else {
          return { ...prev, [id]: [...currentArray, option] };
        }
      } else {
        return { ...prev, [id]: option };
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onHome} className="text-slate-400 hover:text-[#1a3b5c] transition-colors flex items-center gap-1">
          <ChevronLeft size={20} /> <span className="text-sm font-medium">Home</span>
        </button>
        <div className="flex items-center gap-2">
           <button 
             onClick={onPrev} 
             disabled={problemIndex === 0}
             className={`p-1 rounded hover:bg-slate-200 transition-colors ${problemIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'text-[#1a3b5c]'}`}
           >
             <ChevronLeft size={20} />
           </button>
           <span className="bg-[#FFF9C4] px-3 py-1 rounded-md text-[#B7950B] text-xs font-bold tracking-wider">
             CHAPTER {problemIndex + 1} / {totalProblems}
           </span>
           <button 
             onClick={onNext} 
             disabled={problemIndex === totalProblems - 1}
             className={`p-1 rounded hover:bg-slate-200 transition-colors ${problemIndex === totalProblems - 1 ? 'opacity-30 cursor-not-allowed' : 'text-[#1a3b5c]'}`}
           >
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8 relative pb-24">
        <h2 className="text-xl font-bold text-[#1a3b5c] mb-6 flex items-center gap-2">
           <span className="w-1 h-6 bg-[#D8A7B1] rounded-full"></span>
           {problem.title}
        </h2>

        <div className="space-y-8 text-slate-700">
           {/* Problem Description */}
           {problem.description && (
             <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-lg leading-loose font-medium">
               <FormulaText text={problem.description} />
             </div>
           )}

           {/* Additional Equations if any */}
           {problem.equations.length > 0 && (
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                {problem.equations.map((eq, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <FormulaText text={eq} />
                  </div>
                ))}
             </div>
           )}
           
           <div className="space-y-10">
             {problem.questions.map((q) => (
                <div key={q.id} className="relative group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-[#1a3b5c] bg-[#E0F7FA] px-2 py-0.5 rounded text-xs">{q.type.toUpperCase()}</span>
                    <span className="font-bold text-[#1a3b5c] text-lg">{q.label}</span>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-100 mb-4 group-hover:border-[#D8A7B1] transition-colors">
                    <p className="text-base md:text-lg leading-relaxed">
                      <FormulaText text={q.text} />
                    </p>
                  </div>

                  {/* Input Area */}
                  <div className="pl-4">
                    {q.inputType === 'text' && (
                      <textarea 
                        value={typeof userInputs[q.id] === 'string' ? userInputs[q.id] as string : ''}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="ここに回答を入力..."
                        className="w-full bg-[#FAFAFA] border-b-2 border-slate-200 focus:border-[#1a3b5c] outline-none p-4 rounded-t-lg handwritten text-xl text-slate-700 resize-y min-h-[80px] transition-colors placeholder:text-slate-300"
                        readOnly={showAnswer}
                      />
                    )}

                    {(q.inputType === 'selection-single' || q.inputType === 'selection-multi') && q.options && (
                      <div className="flex flex-wrap gap-4 mt-2">
                         {q.options.map((opt) => {
                           const isMulti = q.inputType === 'selection-multi';
                           const val = userInputs[q.id];
                           const isSelected = isMulti 
                             ? Array.isArray(val) && val.includes(opt)
                             : val === opt;
                           
                           return (
                             <button
                               key={opt}
                               onClick={() => !showAnswer && handleSelectionChange(q.id, opt, isMulti)}
                               className={`
                                 group relative px-6 py-3 rounded-full border-2 transition-all duration-200 flex items-center gap-2
                                 ${isSelected 
                                    ? 'bg-[#2C3E50] border-[#2C3E50] text-white shadow-lg transform scale-105' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#1a3b5c] hover:bg-slate-50'}
                                 ${showAnswer ? 'cursor-default' : 'cursor-pointer'}
                               `}
                             >
                               <span className={`
                                 w-4 h-4 rounded-full border border-current flex items-center justify-center
                                 ${isSelected ? 'bg-white' : 'bg-transparent'}
                               `}>
                                 {isSelected && <span className="w-2 h-2 rounded-full bg-[#2C3E50]"></span>}
                               </span>
                               <span className="font-bold text-lg"><FormulaText text={opt} /></span>
                             </button>
                           );
                         })}
                      </div>
                    )}
                  </div>

                  {/* Answer Display */}
                  {showAnswer && (
                    <div className="mt-4 pl-4 animate-fade-in-up">
                      <div className="bg-red-50 border border-red-100 rounded-lg p-5 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400"></div>
                        <div className="flex flex-col gap-2">
                           <span className="text-red-500 font-bold text-sm flex items-center gap-1">
                             <PenTool size={14} /> 模範解答
                           </span>
                           <div className="handwritten text-red-700 text-xl leading-relaxed font-bold">
                             <FormulaText text={problem.answers[q.id]} />
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
             ))}
           </div>

           {/* Explanation Section */}
           {showAnswer && (
             <div className="mt-16 pt-10 border-t-2 border-dashed border-slate-200 animate-fade-in-up">
                <h3 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
                  <BookOpen size={24} className="text-[#1a3b5c]" />
                  解説ポイント
                </h3>
                <ul className="space-y-4">
                  {problem.explanationPoints.map((point, idx) => (
                    <li key={idx} className="bg-[#FFF9C4] bg-opacity-40 p-4 rounded-xl text-slate-700 text-base flex gap-3 shadow-sm border border-[#FFF9C4]">
                       <span className="text-[#B7950B] font-bold mt-0.5">•</span>
                       <span className="leading-relaxed"><FormulaText text={point} /></span>
                    </li>
                  ))}
                </ul>
             </div>
           )}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none gap-4 z-20">
        {!showAnswer ? (
          <button 
            onClick={() => setShowAnswer(true)}
            className="pointer-events-auto bg-[#1a3b5c] hover:bg-[#2c4e74] text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Check size={24} />
            答え合わせ
          </button>
        ) : (
          <button 
            onClick={onAnalyze}
            className="pointer-events-auto bg-[#D8A7B1] hover:bg-[#c995a0] text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Lightbulb size={24} />
            間違えた原因を分析する
          </button>
        )}
      </div>
      <div className="h-24" /> {/* Spacer */}
    </div>
  );
};

const AnalysisView: React.FC<{ problem: ReactionProblem, onSelectBranch: (b: Branch) => void, onBack: () => void }> = ({ problem, onSelectBranch, onBack }) => {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-[#1a3b5c]">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold handwritten text-[#1a3b5c]">どこで思考が止まりましたか？</h2>
      </div>

      <div className="grid gap-4">
        {problem.branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onSelectBranch(branch)}
            className="group relative bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-[#D8A7B1] hover:shadow-md transition-all text-left"
          >
             <div className="absolute -top-3 -left-2 bg-[#FFF9C4] text-[#B7950B] text-xs font-bold px-2 py-1 rounded shadow-sm rotate-[-2deg] group-hover:rotate-0 transition-transform">
               {branch.title}
             </div>
             <div className="mt-2">
               <h3 className="text-lg font-bold text-[#2C3E50] mb-2">{branch.label}</h3>
               <p className="text-sm text-slate-500">
                 <FormulaText text={branch.diagnosis} />
               </p>
             </div>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#D8A7B1]">
               <ArrowRight size={24} />
             </div>
          </button>
        ))}
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-sm text-slate-400 handwritten">正直に答えることが、最短の解決策です。</p>
      </div>
    </div>
  );
};

const AdaptiveView: React.FC<{ branch: Branch, onBack: () => void, onHome: () => void }> = ({ branch, onBack, onHome }) => {
  return (
    <div className="animate-fade-in-up">
       <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-[#1a3b5c] transition-colors flex items-center gap-1">
          <ChevronLeft size={20} /> <span className="text-sm font-medium">診断に戻る</span>
        </button>
      </div>

      {/* Diagnosis Card */}
      <div className="bg-[#E0F7FA] p-6 rounded-2xl mb-6 border border-[#B2EBF2]">
        <h3 className="flex items-center gap-2 text-[#006064] font-bold mb-2">
          <AlertTriangle size={20} />
          ボトルネック特定
        </h3>
        <p className="text-[#00838F]">
           <FormulaText text={branch.diagnosis} />
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tape Effect */}
        <div className="h-4 bg-slate-100 opacity-50 w-32 mx-auto mt-2 transform -rotate-1 shadow-inner absolute left-0 right-0 top-0"></div>

        <div className="p-8 pt-10">
          <div className="flex items-center gap-2 mb-6">
             <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${branch.remediation.type === 'knowledge' ? 'bg-emerald-400' : 'bg-orange-400'}`}>
                {branch.remediation.type === 'knowledge' ? 'KNOWLEDGE CHECK' : 'EXERCISE'}
             </span>
             <h2 className="text-2xl font-bold handwritten text-[#2C3E50]">処方箋</h2>
          </div>

          <div className="prose prose-slate max-w-none">
             <p className="text-lg leading-relaxed mb-6 font-medium">
               <FormulaText text={branch.remediation.content} />
             </p>

             {branch.remediation.points && (
               <div className="bg-[#FFF9C4] bg-opacity-30 p-6 rounded-xl relative mt-8">
                  <div className="absolute -top-3 left-4 bg-[#FFF9C4] px-2 py-0.5 text-xs font-bold text-[#F9A825] rounded shadow-sm">
                    CHECK POINT
                  </div>
                  <ul className="space-y-4">
                    {branch.remediation.points.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm md:text-base text-slate-700">
                        <CheckCircle size={20} className="text-[#D8A7B1] flex-shrink-0 mt-0.5" />
                        <span><FormulaText text={point} /></span>
                      </li>
                    ))}
                  </ul>
               </div>
             )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
           <button onClick={onHome} className="text-[#1a3b5c] font-bold hover:underline flex items-center gap-2">
             学習を完了してノートを閉じる <BookOpen size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default App;