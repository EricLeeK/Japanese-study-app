import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { CheckCircle, XCircle, HelpCircle, MessageCircle } from 'lucide-react';

interface PracticeModeProps {
  exercises: Exercise[];
  onAskAI: (context: string) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ exercises, onAskAI }) => {
  // Get unique sections from the passed exercises
  const sections = Array.from(new Set(exercises.map(e => e.section))).sort((a, b) => Number(a) - Number(b));
  
  const [activeSection, setActiveSection] = useState<number>(sections[0] || 1);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  // Reset section if exercises change (lesson switch)
  useEffect(() => {
    if (sections.length > 0 && !sections.includes(activeSection)) {
        setActiveSection(sections[0]);
    }
  }, [exercises]);

  const currentExercises = exercises.filter(ex => ex.section === activeSection);

  const handleCheck = (exercise: Exercise) => {
    const userInput = (inputs[exercise.id] || '').trim().replace(/\s+/g, '');
    const correctAnswer = exercise.answer.replace(/\s+/g, '');
    
    // Simple exact match check for this demo
    const isCorrect = userInput === correctAnswer;
    setResults({ ...results, [exercise.id]: isCorrect ? 'correct' : 'incorrect' });
  };

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      {sections.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map(num => (
            <button
              key={num}
              onClick={() => setActiveSection(num)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                activeSection === num
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              第 {num} 题
            </button>
          ))}
        </div>
      ) : (
        <div className="text-slate-500">该课程暂无练习题。</div>
      )}

      {/* Exercises List */}
      <div className="space-y-6">
        {currentExercises.map(exercise => (
          <div key={exercise.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">{exercise.prompt}</h3>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                {exercise.hint}
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={inputs[exercise.id] || ''}
                onChange={(e) => setInputs({ ...inputs, [exercise.id]: e.target.value })}
                placeholder="请输入日语..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white text-slate-800 placeholder-slate-400"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleCheck(exercise)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
                >
                  检查
                </button>
                <button
                  onClick={() => setShowAnswer(prev => ({...prev, [exercise.id]: !prev[exercise.id]}))}
                  className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors font-medium flex items-center gap-2"
                >
                  {showAnswer[exercise.id] ? '隐藏答案' : '显示答案'}
                </button>
                <button
                  onClick={() => onAskAI(`关于题目 "${exercise.prompt}" 的答案 "${exercise.answer}"，请解释一下语法。`)}
                  className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center gap-2 ml-auto"
                >
                  <MessageCircle size={18} />
                  <span className="hidden sm:inline">问 AI</span>
                </button>
              </div>

              {/* Feedback Area */}
              {results[exercise.id] === 'correct' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg mt-2">
                  <CheckCircle size={20} />
                  <span>正解！太棒了！</span>
                </div>
              )}
              
              {results[exercise.id] === 'incorrect' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mt-2">
                  <XCircle size={20} />
                  <span>有点不对哦。请检查平假名或助词。</span>
                </div>
              )}

              {showAnswer[exercise.id] && (
                <div className="mt-3 p-3 bg-slate-100 text-slate-700 rounded-lg border-l-4 border-amber-400 font-mono">
                  {exercise.answer}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};