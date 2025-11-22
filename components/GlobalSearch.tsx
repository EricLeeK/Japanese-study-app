import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight, Book, Layers } from 'lucide-react';
import { VOCABULARY_LIST, GRAMMAR_RULES } from '../constants';
import { Vocabulary, GrammarRule } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (lessonId: string, tab: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { vocab: [], grammar: [] };
    
    const lowerQ = query.toLowerCase();

    const vocab = VOCABULARY_LIST.filter(v => 
      v.word.includes(query) || 
      v.reading.includes(query) || 
      v.meaning.includes(query)
    );

    const grammar = GRAMMAR_RULES.filter(g => 
      g.title.includes(query) || 
      g.description.includes(query) || 
      g.pattern.includes(query)
    );

    return { vocab, grammar };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex flex-col animate-fade-in">
       <div className="bg-white p-4 shadow-lg">
          <div className="max-w-3xl mx-auto flex gap-3 items-center">
            <Search className="text-slate-400" />
            <input 
              type="text" 
              autoFocus
              placeholder="搜索单词 (去)、假名 (いき)、或语法 (へ行きます)..." 
              className="flex-1 text-lg outline-none text-slate-800 placeholder-slate-300 h-12"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
               <X className="text-slate-500" />
            </button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto bg-slate-50/90 p-4" onClick={onClose}>
          <div className="max-w-3xl mx-auto space-y-6" onClick={e => e.stopPropagation()}>
             
             {query && results.vocab.length === 0 && results.grammar.length === 0 && (
                <div className="text-center text-slate-400 mt-20">
                   没有找到相关内容
                </div>
             )}

             {/* Vocab Results */}
             {results.vocab.length > 0 && (
                <div>
                   <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Book size={14} /> 单词
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.vocab.map((v, idx) => (
                         <div 
                            key={idx} 
                            onClick={() => { onNavigate(v.lessonId, 'vocab'); onClose(); }}
                            className="bg-white p-3 rounded-lg shadow-sm hover:ring-2 hover:ring-teal-400 cursor-pointer flex justify-between items-center group"
                         >
                            <div>
                               <div className="font-bold text-slate-800 flex items-baseline gap-2">
                                  {v.word}
                                  <span className="text-xs text-slate-400 font-normal">{v.reading}</span>
                               </div>
                               <div className="text-sm text-slate-600">{v.meaning}</div>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                                  {v.lessonId}
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             )}

             {/* Grammar Results */}
             {results.grammar.length > 0 && (
                <div>
                   <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Layers size={14} /> 语法
                   </h3>
                   <div className="space-y-3">
                      {results.grammar.map((g, idx) => (
                         <div 
                            key={idx} 
                            onClick={() => { onNavigate(g.lessonId, 'grammar'); onClose(); }}
                            className="bg-white p-4 rounded-lg shadow-sm hover:ring-2 hover:ring-indigo-400 cursor-pointer group"
                         >
                            <div className="flex justify-between mb-1">
                               <h4 className="font-bold text-indigo-700">{g.title}</h4>
                               <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded h-fit">
                                  {g.lessonId}
                               </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{g.description}</p>
                            <div className="bg-indigo-50 p-2 rounded text-xs font-mono text-indigo-800">
                               {g.pattern}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             )}

          </div>
       </div>
    </div>
  );
};