import { VOCABULARY_LIST, GRAMMAR_RULES } from '../constants';
import { SRSStatus } from '../types';

export const calculateLessonProgress = (lessonId: string): number => {
  // 1. Get all items for this lesson
  const lessonVocab = VOCABULARY_LIST.filter(v => v.lessonId === lessonId);
  const lessonGrammar = GRAMMAR_RULES.filter(g => g.lessonId === lessonId);
  
  const totalItems = lessonVocab.length + lessonGrammar.length;
  if (totalItems === 0) return 0;

  // 2. Get SRS data from local storage
  const storedData = localStorage.getItem('nihongo_srs_data');
  if (!storedData) return 0;
  
  const srsData: Record<string, SRSStatus> = JSON.parse(storedData);
  
  // 3. Count items that have been "learned" (streak > 0)
  let learnedCount = 0;

  lessonVocab.forEach(v => {
    const id = `vocab-${v.word}`;
    if (srsData[id] && srsData[id].streak > 0) {
      learnedCount++;
    }
  });

  lessonGrammar.forEach(g => {
    const id = `grammar-${g.title}`;
    if (srsData[id] && srsData[id].streak > 0) {
      learnedCount++;
    }
  });

  return Math.round((learnedCount / totalItems) * 100);
};

export const getTotalProgress = (): number => {
    const totalItems = VOCABULARY_LIST.length + GRAMMAR_RULES.length;
    if (totalItems === 0) return 0;

    const storedData = localStorage.getItem('nihongo_srs_data');
    if (!storedData) return 0;
    const srsData: Record<string, SRSStatus> = JSON.parse(storedData);

    const learnedCount = Object.values(srsData).filter(s => s.streak > 0).length;
    return Math.round((learnedCount / totalItems) * 100);
};