import React from 'react';
import { LESSONS } from '../constants';
import { BookOpen, ChevronRight, Star } from 'lucide-react';

interface CourseDirectoryProps {
  onSelectLesson: (lessonId: string) => void;
}

export const CourseDirectory: React.FC<CourseDirectoryProps> = ({ onSelectLesson }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">课程目录</h2>
      <div className="grid gap-4">
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson.id)}
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">
                  {lesson.id}
                </span>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                  {lesson.title}
                </h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">{lesson.description}</p>
              <div className="flex flex-wrap gap-2">
                {lesson.topics.map(topic => (
                  <span key={topic} className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-teal-500">
              <ChevronRight size={24} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};