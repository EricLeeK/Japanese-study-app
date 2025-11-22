
import React, { useEffect, useState } from 'react';
import { LESSONS, VOCABULARY_LIST, GRAMMAR_RULES } from '../constants';
import { MillersDiary } from './MillersDiary';
import { calculateLessonProgress, getTotalProgress } from '../utils/progress';
import { SRSStatus } from '../types';
import { PlayCircle, Lock, CheckCircle2, RotateCw, ArrowRight, Mic } from 'lucide-react';

interface DashboardProps {
  onSelectLesson: (lessonId: string) => void;
  onStartReview: () => void;
  onStartSpeakingPrep: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectLesson, onStartReview, onStartSpeakingPrep }) => {
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    // Calculate progress on mount
    const p: Record<string, number> = {};
    LESSONS.forEach(l => {
      p[l.id] = calculateLessonProgress(l.id);
    });
    setProgressData(p);
    setTotalProgress(getTotalProgress());

    // Calculate Due Reviews
    const storedData = localStorage.getItem('nihongo_srs_data');
    if (storedData) {
        const srsData: Record<string, SRSStatus> = JSON.parse(storedData);
        const now = Date.now();
        let count = 0;
        
        // Helper to check ID existence in constants (clean up old data)
        const isValidId = (id: string) => {
            if (id.startsWith('vocab-')) return VOCABULARY_LIST.some(v => v.word === id.replace('vocab-', ''));
            if (id.startsWith('grammar-')) return GRAMMAR_RULES.some(g => g.title === id.replace('grammar-', ''));
            return false;
        };

        Object.values(srsData).forEach(status => {
            if (status.streak > 0 && status.nextReview <= now && isValidId(status.id)) {
                count++;
            }
        });
        setDueCount(count);
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Smart Review Call to Action */}
          <button 
            onClick={onStartReview}
            className="w-full bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative overflow-hidden text-left h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 z-0 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <RotateCw className="text-indigo-600" />
                        智能复习模式
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {dueCount > 0 
                            ? `您有 ${dueCount} 个单词/语法需要复习。` 
                            : "目前没有待复习的内容，去学点新词吧！"}
                    </p>
                </div>
                <div className="mt-4 text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    开始复习 <ArrowRight size={16} />
                </div>
            </div>
          </button>

          {/* Hokudai Speaking Prep Card (NEW) */}
          <button 
            onClick={onStartSpeakingPrep}
            className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white relative overflow-hidden group text-left h-full"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 z-0 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-white/30">
                         HOKUDAI SPECIAL
                       </span>
                    </div>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2 text-white">
                        <Mic className="text-blue-200" /> 口语考试特训
                    </h2>
                    <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                        专为北海道大学交换生定制。
                        <br/>
                        包含自我介绍、札幌生活、小樽旅行等必考话题。
                    </p>
                </div>
                <div className="mt-4 text-white font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    进入特训 <ArrowRight size={16} />
                </div>
            </div>
          </button>
      </div>

      {/* Top Section: Diary & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <MillersDiary />
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
           <div>
              <h3 className="text-teal-100 font-medium mb-1">总学习进度</h3>
              <div className="text-4xl font-bold mb-2">{totalProgress}%</div>
              <div className="w-full bg-teal-800/30 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${totalProgress}%` }}></div>
              </div>
           </div>
           <div className="mt-6">
              <p className="text-sm text-teal-50 opacity-90">
                 "千里之行，始于足下。"
              </p>
              <p className="text-xs text-teal-200 mt-1 text-right">— 老子</p>
           </div>
        </div>
      </div>

      {/* Lessons Map */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
           <PlayCircle className="text-teal-600" />
           课程地图
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {LESSONS.map((lesson, index) => {
            const progress = progressData[lesson.id] || 0;
            const isLocked = false; 

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                disabled={isLocked}
                className={`group relative p-5 rounded-xl border-2 text-left transition-all hover:-translate-y-1 ${
                    isLocked 
                    ? 'bg-slate-50 border-slate-100 opacity-70 cursor-not-allowed' 
                    : 'bg-white border-slate-100 hover:border-teal-400 hover:shadow-md'
                }`}
              >
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-xl overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex justify-between items-start mb-2 mt-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lesson {index + 1}</span>
                    <h3 className={`font-bold text-lg ${progress === 100 ? 'text-green-700' : 'text-slate-800'}`}>
                       {lesson.title.split('：')[1] || lesson.title}
                    </h3>
                  </div>
                  {progress === 100 ? (
                     <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                     <div className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {progress}%
                     </div>
                  )}
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                   {lesson.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                   {lesson.topics.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                         {t}
                      </span>
                   ))}
                </div>
              </button>
            );
          })}
          
          {/* Coming Soon */}
          {[13, 14, 15].map(n => (
             <div key={n} className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-300 select-none">
                <Lock size={24} className="mb-2" />
                <span className="text-sm font-bold">Lesson {n}</span>
                <span className="text-xs">Coming Soon</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
