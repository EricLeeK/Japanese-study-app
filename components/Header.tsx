import React from 'react';
import { BookOpen, GraduationCap, Settings, Search } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenSearch }) => {
  return (
    <header className="bg-teal-600 text-white p-4 shadow-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-white text-teal-600 p-2 rounded-full shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">日语作业助手</h1>
            <p className="text-teal-100 text-[10px] md:text-xs opacity-90">Minna no Nihongo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-teal-700/40 hover:bg-teal-700/60 text-teal-50 px-3 py-1.5 rounded-full transition-all text-sm"
          >
             <Search size={16} />
             <span className="hidden md:inline opacity-80">搜索单词/语法...</span>
          </button>

          <div className="h-6 w-px bg-teal-500/50 mx-1 hidden md:block"></div>

          <button 
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-teal-700/50 text-teal-100 transition-colors"
            title="设置 API Key"
          >
            <Settings size={20} />
          </button>

          <div className="hidden md:flex items-center gap-2 text-teal-100 bg-teal-700/30 px-3 py-1 rounded-full border border-teal-500/30">
            <GraduationCap size={18} />
            <span className="text-xs font-bold">AI 辅导</span>
          </div>
        </div>
      </div>
    </header>
  );
};