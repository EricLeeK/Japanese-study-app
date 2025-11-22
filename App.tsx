
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { VocabularyList } from './components/VocabularyList';
import { GrammarGuide } from './components/GrammarGuide';
import { PracticeMode } from './components/PracticeMode';
import { SRSReview } from './components/SRSReview';
import { ShadowingMode } from './components/ShadowingMode';
import { AITutor } from './components/AITutor';
import { Dashboard } from './components/Dashboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GlobalSearch } from './components/GlobalSearch';
import { Book, PenTool, Layers, RotateCw, Mic, ArrowLeft, Home } from 'lucide-react';
import { VOCABULARY_LIST, GRAMMAR_RULES, EXERCISES, LESSONS } from './constants';

const App: React.FC = () => {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vocab' | 'grammar' | 'practice' | 'shadowing' | 'review'>('practice');
  const [isGlobalReviewMode, setIsGlobalReviewMode] = useState(false);
  
  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  // Scroll to top when lesson changes
  useEffect(() => {
     window.scrollTo(0, 0);
  }, [currentLessonId, activeTab, isGlobalReviewMode]);

  // Filter data based on current lesson
  const currentLesson = LESSONS.find(l => l.id === currentLessonId);
  
  const filteredVocab = useMemo(() => 
    VOCABULARY_LIST.filter(v => v.lessonId === currentLessonId), 
  [currentLessonId]);

  const filteredGrammar = useMemo(() => 
    GRAMMAR_RULES.filter(g => g.lessonId === currentLessonId), 
  [currentLessonId]);

  const filteredExercises = useMemo(() => 
    EXERCISES.filter(e => e.lessonId === currentLessonId), 
  [currentLessonId]);

  const handleOpenAI = (question: string = '') => {
    setAiQuestion(question);
    setIsAIModalOpen(true);
  };

  // When navigating from search results
  const handleNavigate = (lessonId: string, tab: string) => {
    setIsGlobalReviewMode(false);
    setCurrentLessonId(lessonId);
    setActiveTab(tab as any);
  };

  const handleStartReview = () => {
      setIsGlobalReviewMode(true);
      setCurrentLessonId(null);
  };

  const handleExitLesson = () => {
      setCurrentLessonId(null);
      setIsGlobalReviewMode(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-0 selection:bg-teal-100 selection:text-teal-900">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="max-w-4xl mx-auto p-4">
        
        {/* 1. Global Smart Review Mode */}
        {isGlobalReviewMode && (
            <div className="animate-fade-in">
                 <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm sticky top-[4.5rem] z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleExitLesson}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded inline-block mb-0.5">
                                GLOBAL MODE
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">智能复习</h2>
                        </div>
                    </div>
                </div>
                <SRSReview />
            </div>
        )}

        {/* 2. Lesson View */}
        {!isGlobalReviewMode && currentLessonId && (
          <div className="animate-fade-in">
            {/* Active Lesson Navigation Bar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm sticky top-[4.5rem] z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExitLesson}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                   <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded inline-block mb-0.5">
                      LESSON {currentLessonId.replace('L', '')}
                   </div>
                   <h2 className="text-lg font-bold text-slate-800 leading-tight">{currentLesson?.title.split('：')[1] || currentLesson?.title}</h2>
                </div>
              </div>
              <button 
                 onClick={handleExitLesson}
                 className="hidden md:flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                 <Home size={16} /> 首页
              </button>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
              {[
                 { id: 'practice', label: '做题练习', icon: PenTool },
                 { id: 'vocab', label: '单词表', icon: Book },
                 { id: 'grammar', label: '语法重点', icon: Layers },
                 { id: 'shadowing', label: '跟读训练', icon: Mic },
              ].map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group flex items-center gap-2 px-5 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${
                       activeTab === tab.id 
                       ? 'border-teal-500 text-teal-700 bg-teal-50/50' 
                       : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                 >
                    <tab.icon size={18} className={activeTab === tab.id ? 'stroke-[2.5px]' : ''} />
                    {tab.label}
                 </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[60vh]">
              {activeTab === 'vocab' && <VocabularyList vocabList={filteredVocab} />}
              {activeTab === 'grammar' && <GrammarGuide rules={filteredGrammar} />}
              {activeTab === 'practice' && <PracticeMode exercises={filteredExercises} onAskAI={handleOpenAI} />}
              {activeTab === 'shadowing' && <ShadowingMode vocabList={filteredVocab} exerciseList={filteredExercises} />}
            </div>
          </div>
        )}

        {/* 3. Dashboard (Home) */}
        {!isGlobalReviewMode && !currentLessonId && (
          <Dashboard onSelectLesson={setCurrentLessonId} onStartReview={handleStartReview} />
        )}

      </main>

      {/* Mobile Navigation (Sticky Bottom) - Only in Lesson Mode */}
      {!isGlobalReviewMode && currentLessonId && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-1 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
          <button onClick={() => setActiveTab('vocab')} className={`flex flex-col items-center p-2 rounded-lg w-16 ${activeTab === 'vocab' ? 'text-teal-600' : 'text-slate-400'}`}>
            <Book size={20} strokeWidth={activeTab === 'vocab' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">单词</span>
          </button>
          <button onClick={() => setActiveTab('grammar')} className={`flex flex-col items-center p-2 rounded-lg w-16 ${activeTab === 'grammar' ? 'text-teal-600' : 'text-slate-400'}`}>
            <Layers size={20} strokeWidth={activeTab === 'grammar' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">语法</span>
          </button>
          <div className="relative -top-5">
             <button onClick={() => setActiveTab('practice')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-teal-200 ${activeTab === 'practice' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
               <PenTool size={24} fill={activeTab === 'practice' ? "currentColor" : "none"} />
             </button>
          </div>
          <button onClick={() => setActiveTab('shadowing')} className={`flex flex-col items-center p-2 rounded-lg w-16 ${activeTab === 'shadowing' ? 'text-teal-600' : 'text-slate-400'}`}>
            <Mic size={20} strokeWidth={activeTab === 'shadowing' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">跟读</span>
          </button>
        </div>
      )}

      {/* Global AI FAB */}
      <button
        onClick={() => handleOpenAI('')}
        className="fixed bottom-24 md:bottom-8 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 hover:-translate-y-1 z-50 flex items-center gap-2"
      >
        <img src="https://api.iconify.design/fluent-emoji:teacher-light.svg" className="w-6 h-6" alt="Sensei" />
        <span className="font-bold hidden md:inline">AI 老师</span>
      </button>

      <AITutor 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        initialQuestion={aiQuestion}
      />

      <ApiKeyModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <GlobalSearch 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
