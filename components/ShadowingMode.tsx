import React, { useState, useEffect } from 'react';
import { Vocabulary, Exercise } from '../types';
import { Play, Pause, Mic, Volume2, SkipBack, SkipForward } from 'lucide-react';

interface ShadowingModeProps {
  vocabList: Vocabulary[];
  exerciseList: Exercise[];
}

export const ShadowingMode: React.FC<ShadowingModeProps> = ({ vocabList, exerciseList }) => {
  const [items, setItems] = useState<{text: string, sub: string, type: 'word' | 'sentence'}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    // Combine vocab and sentences into a linear playlist
    const playlist: {text: string, sub: string, type: 'word' | 'sentence'}[] = [];
    
    vocabList.forEach(v => playlist.push({ text: v.word, sub: `${v.reading} - ${v.meaning}`, type: 'word' }));
    exerciseList.forEach(e => playlist.push({ text: e.answer, sub: e.hint, type: 'sentence' }));
    
    setItems(playlist);
    setCurrentIndex(0);
  }, [vocabList, exerciseList]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Slightly slower for learning
    
    utterance.onend = () => {
      setIsPlaying(false);
      if (autoPlay && currentIndex < items.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          // Trigger next play in a useEffect or separate logic, 
          // but for simplicity in this loop:
          // We set state, effect triggers? No, let's just basic chain here.
        }, 2000); // 2 seconds gap to repeat
      }
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoPlay && items.length > 0) {
        speak(items[currentIndex].text);
    }
  }, [currentIndex, autoPlay]);

  const handlePlayCurrent = () => {
    if (items.length > 0) {
      speak(items[currentIndex].text);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (items.length === 0) return <div className="p-8 text-center text-slate-500">没有可跟读的内容</div>;

  const currentItem = items[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Mic className="text-teal-600" />
          跟读练习 (Shadowing)
        </h2>
        <p className="text-slate-500">听 AI 发音，然后大声跟读。模仿语调和节奏。</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-2 border-teal-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div 
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-400 mb-8">
          <span>{currentIndex + 1} / {items.length}</span>
          <span className="uppercase tracking-wider">{currentItem.type === 'word' ? '单词' : '句子'}</span>
        </div>

        <div className="text-center space-y-6 mb-8">
          <div className="min-h-[120px] flex items-center justify-center">
            <p className={`font-bold text-slate-800 ${currentItem.type === 'word' ? 'text-5xl' : 'text-2xl leading-relaxed'}`}>
              {currentItem.text}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-slate-500 text-lg">{currentItem.sub}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
          >
            <SkipBack size={28} />
          </button>

          <button 
            onClick={handlePlayCurrent}
            disabled={isPlaying && autoPlay}
            className={`p-6 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 ${
              isPlaying ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-600 text-white'
            }`}
          >
            {isPlaying && !autoPlay ? <Volume2 size={32} className="animate-pulse" /> : <Play size={32} fill="currentColor" />}
          </button>

          <button 
             onClick={handleNext}
             disabled={currentIndex === items.length - 1}
             className="p-3 rounded-full hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
          >
            <SkipForward size={28} />
          </button>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              setAutoPlay(!autoPlay);
              if (!autoPlay) speak(items[currentIndex].text);
              else window.speechSynthesis.cancel();
            }}
            className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
              autoPlay ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {autoPlay ? '自动播放中 (暂停)' : '开启自动连播'}
          </button>
        </div>
      </div>

      <div className="text-slate-400 text-xs text-center max-w-xs">
        提示：请确保您的设备没有静音。跟读时尽量不要看文字，先听声音。
      </div>
    </div>
  );
};