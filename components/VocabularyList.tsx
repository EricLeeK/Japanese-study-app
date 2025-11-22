import React, { useState } from 'react';
import { Vocabulary } from '../types';
import { Volume2, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateWordExamples } from '../services/geminiService';

interface VocabularyListProps {
    vocabList: Vocabulary[];
}

export const VocabularyList: React.FC<VocabularyListProps> = ({ vocabList }) => {
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerate = async (vocab: Vocabulary, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = vocab.id || `${vocab.lessonId}-${vocab.word}`;
    
    // If already generated, just toggle visibility
    if (examples[key]) {
      setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
      return;
    }

    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await generateWordExamples(vocab.word, vocab.meaning);
      setExamples(prev => ({ ...prev, [key]: result }));
      setExpanded(prev => ({ ...prev, [key]: true }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
      {vocabList.map((vocab, index) => {
        const key = vocab.id || `${vocab.lessonId}-${vocab.word}`;
        const isExpanded = expanded[key];
        const isLoading = loading[key];
        const hasExample = !!examples[key];

        return (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm border border-slate-100 hover:border-teal-300 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => handleSpeak(vocab.word)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                     <p className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {vocab.word}
                     </p>
                     <Volume2 size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-500">{vocab.reading}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-700 font-medium">{vocab.meaning}</p>
                  <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    vocab.type === 'i-adj' ? 'bg-blue-100 text-blue-700' :
                    vocab.type === 'na-adj' ? 'bg-orange-100 text-orange-700' :
                    vocab.type === 'verb' ? 'bg-red-100 text-red-700' :
                    vocab.type === 'counter' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {vocab.type === 'i-adj' ? 'い形容词' : 
                     vocab.type === 'na-adj' ? 'な形容词' : 
                     vocab.type === 'verb' ? '动词' :
                     vocab.type === 'counter' ? '量词' :
                     vocab.type === 'noun' ? '名词' : '短语'}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2">
                <button
                    onClick={(e) => handleGenerate(vocab, e)}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                        hasExample && isExpanded 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Sparkles size={14} />
                    )}
                    <span>{hasExample ? (isExpanded ? '收起例句' : '查看例句') : '生成例句'}</span>
                </button>
              </div>
            </div>

            {/* Examples Panel */}
            {isExpanded && examples[key] && (
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">AI 造句</h4>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                  {examples[key]}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};