import React, { useState } from 'react';
import { GrammarRule } from '../types';
import { Lightbulb, PlayCircle, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface GrammarGuideProps {
    rules: GrammarRule[];
}

// --- Interactive Components ---

const AdjectiveConjugator = () => {
  const [adjType, setAdjType] = useState<'i' | 'na'>('i');
  const [tense, setTense] = useState<'non-past' | 'past'>('non-past');
  const [polarity, setPolarity] = useState<'positive' | 'negative'>('positive');

  // Sample words
  const iWord = { base: '暑い', stem: '暑' }; // Atsui
  const naWord = { base: '暇', stem: '暇' }; // Hima

  const getConjugation = () => {
    if (adjType === 'i') {
      if (tense === 'non-past') {
        return polarity === 'positive' ? `${iWord.base}です` : `${iWord.stem}くないです`;
      } else {
        return polarity === 'positive' ? `${iWord.stem}かったです` : `${iWord.stem}くなかったです`;
      }
    } else {
      if (tense === 'non-past') {
        return polarity === 'positive' ? `${naWord.base}です` : `${naWord.base}じゃありません`;
      } else {
        return polarity === 'positive' ? `${naWord.base}でした` : `${naWord.base}じゃありませんでした`;
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-indigo-100 shadow-sm mt-4">
      <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
        <RefreshCw size={18} /> 形容词变形模拟器 (Lesson 8/12)
      </h4>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setAdjType('i')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adjType === 'i' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
          >
            い形容词 (暑い)
          </button>
          <button 
             onClick={() => setAdjType('na')}
             className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adjType === 'na' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
          >
            な形容词 (暇)
          </button>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setTense('non-past')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tense === 'non-past' ? 'bg-white text-teal-600 shadow' : 'text-slate-500'}`}
          >
            现在/将来
          </button>
          <button 
             onClick={() => setTense('past')}
             className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tense === 'past' ? 'bg-white text-teal-600 shadow' : 'text-slate-500'}`}
          >
            过去
          </button>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setPolarity('positive')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${polarity === 'positive' ? 'bg-white text-green-600 shadow' : 'text-slate-500'}`}
          >
            肯定 (是)
          </button>
          <button 
             onClick={() => setPolarity('negative')}
             className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${polarity === 'negative' ? 'bg-white text-rose-600 shadow' : 'text-slate-500'}`}
          >
            否定 (不)
          </button>
        </div>
      </div>

      <div className="text-center py-8 bg-indigo-50 rounded-lg border border-indigo-100">
         <p className="text-3xl font-bold text-slate-800">{getConjugation()}</p>
         <p className="text-slate-400 text-sm mt-2">
           {adjType === 'i' ? '热' : '空闲'} 
           {tense === 'past' ? ' (过去)' : ''} 
           {polarity === 'negative' ? ' (否定)' : ''}
         </p>
      </div>
    </div>
  );
};

const ParticleQuiz = () => {
  const questions = [
    { q: '私__マイクです。', options: ['が', 'は', 'を'], ans: 'は' },
    { q: '日本__行きます。', options: ['で', 'へ', 'を'], ans: 'へ' },
    { q: '箸__食べます。', options: ['で', 'に', 'から'], ans: 'で' },
  ];
  const [currentQ, setCurrentQ] = useState(0);
  const [status, setStatus] = useState<'idle'|'correct'|'wrong'>('idle');

  const handleAnswer = (opt: string) => {
    if (opt === questions[currentQ].ans) {
      setStatus('correct');
      setTimeout(() => {
        setStatus('idle');
        setCurrentQ((prev) => (prev + 1) % questions.length);
      }, 1000);
    } else {
      setStatus('wrong');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-amber-100 shadow-sm mt-4">
      <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
        <PlayCircle size={18} /> 助词大挑战 (Particles)
      </h4>
      
      <div className="text-center space-y-6">
        <div className="text-xl font-bold text-slate-700 bg-amber-50 p-4 rounded-lg">
          {questions[currentQ].q}
        </div>
        
        <div className="flex justify-center gap-3">
          {questions[currentQ].options.map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="w-16 h-16 rounded-full bg-slate-100 hover:bg-amber-200 font-bold text-xl text-slate-700 transition-colors border-2 border-slate-200 hover:border-amber-400"
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="h-6 text-sm font-bold">
          {status === 'correct' && <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle2 size={16}/> 正确！</span>}
          {status === 'wrong' && <span className="text-red-500 flex items-center justify-center gap-1"><XCircle size={16}/> 再试试...</span>}
        </div>
      </div>
    </div>
  );
};

const CounterVisualizer = () => {
  const [count, setCount] = useState(1);
  const counters = [
    '一つ (ひとつ)', '二つ (ふたつ)', '三つ (みっつ)', '四つ (よっつ)', '五つ (いつつ)',
    '六つ (むっつ)', '七つ (ななつ)', '八つ (やっつ)', '九つ (ここのつ)', '十 (とお)'
  ];

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-sm mt-4">
      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
        <PlayCircle size={18} /> 数量词滑动条 (Lesson 11)
      </h4>

      <div className="space-y-6">
        <div className="flex justify-center gap-2 flex-wrap min-h-[60px]">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-red-400 rounded-full shadow-sm flex items-center justify-center text-white text-xs">
              🍎
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 mb-1">{counters[count - 1].split(' ')[0]}</p>
          <p className="text-slate-500 text-sm">{counters[count - 1].split(' ')[1]}</p>
        </div>

        <input 
          type="range" 
          min="1" 
          max="10" 
          value={count} 
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );
};

export const GrammarGuide: React.FC<GrammarGuideProps> = ({ rules }) => {
  // Determine if we should show specific labs based on the lesson content
  const lessonId = rules[0]?.lessonId;
  
  const showConjugator = ['L8', 'L12'].includes(lessonId);
  const showParticles = ['L1', 'L5', 'L6', 'L7'].includes(lessonId);
  const showCounters = ['L11'].includes(lessonId);

  return (
    <div className="space-y-8 pb-20">
      {/* Static Rules List */}
      <div className="space-y-6">
        {rules.map((rule, index) => (
          <div key={index} className="bg-teal-50 p-5 rounded-xl border border-teal-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="text-amber-500 fill-amber-500" size={20} />
                <h3 className="font-bold text-teal-900 text-lg">{rule.title}</h3>
              </div>
              
              <p className="text-slate-700 mb-4 leading-relaxed text-sm md:text-base">
                {rule.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/80 p-3 rounded-lg border border-teal-200/50">
                  <p className="text-xs text-teal-600 font-bold mb-1 uppercase tracking-wider">句型 Pattern</p>
                  <p className="font-mono text-slate-800 font-medium text-sm">{rule.pattern}</p>
                </div>
                
                <div className="bg-white/80 p-3 rounded-lg border border-teal-200/50">
                  <p className="text-xs text-teal-600 font-bold mb-1 uppercase tracking-wider">例句 Example</p>
                  <div className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 text-teal-400 shrink-0" />
                    <p className="text-slate-700 text-sm">{rule.example}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Playground Section */}
      {(showConjugator || showParticles || showCounters) && (
        <div className="border-t-2 border-dashed border-slate-200 pt-8">
          <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">🎮 语法实验室</h3>
          <p className="text-center text-slate-400 text-sm mb-6">通过互动练习加深理解</p>
          
          {showConjugator && <AdjectiveConjugator />}
          {showParticles && <ParticleQuiz />}
          {showCounters && <CounterVisualizer />}
        </div>
      )}
    </div>
  );
};