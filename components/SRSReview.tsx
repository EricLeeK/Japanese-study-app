
import React, { useState, useEffect } from 'react';
import { VOCABULARY_LIST, GRAMMAR_RULES } from '../constants';
import { SRSStatus } from '../types';
import { calculateSRS, getInitialSRSStatus } from '../utils/srs';
import { RotateCw, Check, Brain, Clock, ThumbsUp, Sliders, PlayCircle, BookOpen, Save, Trash2 } from 'lucide-react';

interface Flashcard {
  id: string;
  type: 'vocab' | 'grammar';
  front: React.ReactNode;
  back: React.ReactNode;
  subtext?: string;
  isNew: boolean;
}

type ReviewPhase = 'setup' | 'session' | 'summary';

// Helper to reconstruct card UI from ID since we can't store React Nodes in localStorage
const createCardFromId = (id: string, srsData: Record<string, SRSStatus>): Flashcard | null => {
    let item: any;
    let type: 'vocab' | 'grammar';
    
    if (id.startsWith('vocab-')) {
        const word = id.replace('vocab-', '');
        item = VOCABULARY_LIST.find(v => v.word === word);
        type = 'vocab';
    } else {
        const title = id.replace('grammar-', '');
        item = GRAMMAR_RULES.find(g => g.title === title);
        type = 'grammar';
    }

    if (!item) return null;

    const status = srsData[id] || getInitialSRSStatus(id);
    const isNew = status.streak === 0;

    let front, back, subtext;
    if (type === 'vocab') {
        front = <div className="text-4xl font-bold text-slate-800">{item.word}</div>;
        back = (
          <div className="text-center space-y-2">
            <div className="text-2xl text-teal-600 font-medium">{item.reading}</div>
            <div className="text-xl text-slate-700">{item.meaning}</div>
            <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${
              item.type === 'i-adj' ? 'bg-blue-100 text-blue-700' :
              item.type === 'na-adj' ? 'bg-orange-100 text-orange-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {item.type === 'i-adj' ? 'い形容词' : item.type === 'na-adj' ? 'な形容词' : item.type === 'noun' ? '名词' : '短语'}
            </span>
          </div>
        );
        subtext = '单词卡';
    } else {
        front = <div className="text-xl font-bold text-center text-slate-800">{item.title}</div>;
        back = (
          <div className="text-left space-y-3">
            <p className="text-slate-700">{item.description}</p>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <p className="text-xs text-slate-400">接续</p>
              <p className="font-mono text-teal-700 text-sm">{item.pattern}</p>
            </div>
            <div className="bg-teal-50 p-2 rounded border border-teal-100">
               <p className="text-xs text-teal-400">例句</p>
               <p className="text-slate-800 text-sm">{item.example}</p>
            </div>
          </div>
        );
        subtext = '语法卡';
    }

    return { id, type, front, back, subtext, isNew };
};

export const SRSReview: React.FC = () => {
  // State
  const [phase, setPhase] = useState<ReviewPhase>('setup');
  const [srsData, setSrsData] = useState<Record<string, SRSStatus>>({});
  
  // Queues
  const [dueReviews, setDueReviews] = useState<string[]>([]); // Store IDs only
  const [newCardsAvailable, setNewCardsAvailable] = useState<string[]>([]); // Store IDs only
  
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>([]);
  
  // User Settings
  const [newCardsLimit, setNewCardsLimit] = useState<number>(10);
  const [includeReviews, setIncludeReviews] = useState<boolean>(true);

  // Session State
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, hard: 0, again: 0 });
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // 1. Load Global SRS Data
  useEffect(() => {
    const storedData = localStorage.getItem('nihongo_srs_data');
    const parsedData: Record<string, SRSStatus> = storedData ? JSON.parse(storedData) : {};
    setSrsData(parsedData);

    // Check for saved active session
    const savedSession = localStorage.getItem('nihongo_srs_session');
    if (savedSession) {
        setHasSavedSession(true);
    }

    // Calculate available cards (IDs)
    const now = Date.now();
    const tempDue: string[] = [];
    const tempNew: string[] = [];

    // Helper to check status
    const processItem = (id: string) => {
        const status = parsedData[id] || getInitialSRSStatus(id);
        if (status.streak === 0) {
            tempNew.push(id);
        } else if (status.nextReview <= now) {
            tempDue.push(id);
        }
    };

    VOCABULARY_LIST.forEach(v => processItem(`vocab-${v.word}`));
    GRAMMAR_RULES.forEach(g => processItem(`grammar-${g.title}`));

    setDueReviews(tempDue);
    setNewCardsAvailable(tempNew);
  }, []);

  // 2. Persist Session State
  useEffect(() => {
    if (phase === 'session' && sessionQueue.length > 0) {
        const sessionData = {
            queueIds: sessionQueue.map(c => c.id),
            stats: sessionStats
        };
        localStorage.setItem('nihongo_srs_session', JSON.stringify(sessionData));
    } else if (phase === 'summary') {
        localStorage.removeItem('nihongo_srs_session');
    }
  }, [sessionQueue, phase, sessionStats]);

  // 3. Start New Session
  const handleStartSession = () => {
    let queueIds: string[] = [];

    // Add Reviews (Priority)
    if (includeReviews) {
      queueIds = [...queueIds, ...dueReviews];
    }

    // Add New Cards (Limited)
    const newCardsToLearn = newCardsAvailable.slice(0, newCardsLimit);
    queueIds = [...queueIds, ...newCardsToLearn];

    // Shuffle IDs
    queueIds = queueIds.sort(() => Math.random() - 0.5);

    // Construct Cards
    const queue = queueIds
        .map(id => createCardFromId(id, srsData))
        .filter((c): c is Flashcard => c !== null);

    setSessionQueue(queue);
    setPhase('session');
    setSessionStats({ correct: 0, hard: 0, again: 0 });
  };

  // 4. Resume Saved Session
  const handleResumeSession = () => {
      const saved = localStorage.getItem('nihongo_srs_session');
      if (!saved) return;

      const { queueIds, stats } = JSON.parse(saved);
      
      const queue = queueIds
        .map((id: string) => createCardFromId(id, srsData))
        .filter((c: any): c is Flashcard => c !== null);

      setSessionQueue(queue);
      setSessionStats(stats);
      setPhase('session');
  };

  const handleDiscardSession = () => {
      localStorage.removeItem('nihongo_srs_session');
      setHasSavedSession(false);
  };

  // 5. Rate Card
  const handleRate = (quality: number) => {
    if (sessionQueue.length === 0) return;

    const currentCard = sessionQueue[0];
    const currentStatus = srsData[currentCard.id] || getInitialSRSStatus(currentCard.id);
    
    // Update Logic
    const newStatus = calculateSRS(currentStatus, quality);
    const updatedData = { ...srsData, [currentCard.id]: newStatus };
    setSrsData(updatedData);
    localStorage.setItem('nihongo_srs_data', JSON.stringify(updatedData));

    // Stats
    setSessionStats(prev => ({
      ...prev,
      correct: quality >= 4 ? prev.correct + 1 : prev.correct,
      hard: quality === 3 ? prev.hard + 1 : prev.hard,
      again: quality < 3 ? prev.again + 1 : prev.again
    }));

    setIsFlipped(false);

    // Queue Management
    if (quality < 3) {
      // Re-queue at the end if forgotten
      setSessionQueue(prev => [...prev.slice(1), currentCard]);
    } else {
      const nextQueue = sessionQueue.slice(1);
      setSessionQueue(nextQueue);
      if (nextQueue.length === 0) {
        setPhase('summary');
        localStorage.removeItem('nihongo_srs_session'); // Clear saved session
      }
    }
  };

  // --- Render: Setup Phase ---
  if (phase === 'setup') {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in mt-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Sliders className="text-teal-600" />
          智能复习配置
        </h2>

        {hasSavedSession && (
            <div className="mb-8 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="font-bold text-indigo-800">发现未完成的学习</p>
                    <p className="text-xs text-indigo-600">您上次有未完成的队列。</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDiscardSession}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="放弃"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={handleResumeSession}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                    >
                        继续学习
                    </button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
             <div className="text-3xl font-bold text-amber-600 mb-1">{dueReviews.length}</div>
             <div className="text-sm text-amber-800 font-bold flex items-center justify-center gap-1">
                <RotateCw size={14} /> 待复习
             </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
             <div className="text-3xl font-bold text-indigo-600 mb-1">{newCardsAvailable.length}</div>
             <div className="text-sm text-indigo-800 font-bold flex items-center justify-center gap-1">
                <BookOpen size={14} /> 新内容
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Review Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
            <div>
              <div className="font-bold text-slate-700">包含复习内容</div>
              <div className="text-xs text-slate-400">优先复习即将遗忘的卡片</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={includeReviews}
                onChange={(e) => setIncludeReviews(e.target.checked)}
                disabled={dueReviews.length === 0}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* New Cards Input */}
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-bold text-slate-700">新词学习数量</div>
                <div className="text-xs text-slate-400">输入本次想学的新卡片数</div>
              </div>
              <div className="w-20">
                <input 
                  type="number" 
                  min="0" 
                  max={newCardsAvailable.length}
                  value={newCardsLimit}
                  onChange={(e) => setNewCardsLimit(Math.min(Number(e.target.value), newCardsAvailable.length))}
                  className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-lg outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max={Math.min(50, newCardsAvailable.length)} 
              step="5"
              value={newCardsLimit}
              onChange={(e) => setNewCardsLimit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
        </div>

        <button
          onClick={handleStartSession}
          disabled={!includeReviews && newCardsLimit === 0}
          className="w-full mt-8 bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <PlayCircle size={20} />
          开始任务 ({ (includeReviews ? dueReviews.length : 0) + newCardsLimit })
        </button>
      </div>
    );
  }

  // --- Render: Summary Phase ---
  if (phase === 'summary') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in max-w-md mx-auto mt-8">
        <div className="bg-green-100 p-6 rounded-full mb-6 text-green-600 shadow-sm">
          <Check size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">本次学习完成！</h2>
        <p className="text-slate-600 mb-8">
          进度已自动保存。
        </p>

        <div className="grid grid-cols-3 gap-4 w-full mb-8">
           <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-xs text-slate-500">记住</div>
           </div>
           <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-orange-500">{sessionStats.hard}</div>
              <div className="text-xs text-slate-500">模糊</div>
           </div>
           <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-rose-500">{sessionStats.again}</div>
              <div className="text-xs text-slate-500">重来</div>
           </div>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-all"
        >
          返回主页
        </button>
      </div>
    );
  }

  // --- Render: Session Phase (Review Card) ---
  const currentCard = sessionQueue[0];
  if (!currentCard) return null; 

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-teal-600" />
          <span className="font-medium">{currentCard.isNew ? '新词学习' : '记忆复习'}</span>
        </div>
        <div className="bg-slate-200 px-3 py-1 rounded-full font-mono text-xs">
          剩余: {sessionQueue.length}
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className="relative h-80 w-full perspective-1000 cursor-pointer group"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full bg-white rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden border-2 border-slate-100">
            <div className="absolute top-4 left-4 flex gap-2">
               <span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                 {currentCard.subtext}
               </span>
               {currentCard.isNew && (
                 <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded flex items-center gap-1">
                    <BookOpen size={10} /> NEW
                 </span>
               )}
            </div>
            
            {currentCard.front}
            
            <p className="absolute bottom-6 text-sm text-slate-400 animate-pulse">
              点击查看答案
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-indigo-50 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-indigo-100">
             <span className="absolute top-4 left-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              答案
            </span>
            {currentCard.back}
          </div>
        </div>
      </div>

      {/* Rating Controls */}
      <div className="mt-8 h-20">
        {!isFlipped ? (
          <button 
            onClick={() => setIsFlipped(true)}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all active:scale-95"
          >
            显示答案
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleRate(0)}
                className="bg-rose-100 text-rose-700 py-3 rounded-xl font-bold hover:bg-rose-200 transition-colors flex flex-col items-center justify-center border-b-4 border-rose-200 active:border-b-0 active:translate-y-1"
              >
                <RotateCw size={20} className="mb-1" />
                <span className="text-xs">忘记</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleRate(3)}
                className="bg-orange-100 text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-200 transition-colors flex flex-col items-center justify-center border-b-4 border-orange-200 active:border-b-0 active:translate-y-1"
              >
                <Clock size={20} className="mb-1" />
                <span className="text-xs">模糊</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleRate(4)}
                className="bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition-colors flex flex-col items-center justify-center border-b-4 border-blue-200 active:border-b-0 active:translate-y-1"
              >
                <ThumbsUp size={20} className="mb-1" />
                <span className="text-xs">记得</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleRate(5)}
                className="bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors flex flex-col items-center justify-center border-b-4 border-green-200 active:border-b-0 active:translate-y-1"
              >
                <Check size={20} className="mb-1" />
                <span className="text-xs">简单</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
