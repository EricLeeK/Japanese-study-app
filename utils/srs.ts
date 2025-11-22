import { SRSStatus } from '../types';

export const getInitialSRSStatus = (id: string): SRSStatus => ({
  id,
  nextReview: Date.now(),
  interval: 0,
  ease: 2.5,
  streak: 0,
});

// Quality ratings: 0 (Again), 3 (Hard), 4 (Good), 5 (Easy)
// This maps roughly to the SM-2 algorithm
export const calculateSRS = (status: SRSStatus, quality: number): SRSStatus => {
  let { interval, ease, streak } = status;

  if (quality < 3) {
    // "Again": Reset streak and interval
    streak = 0;
    interval = 0;
  } else {
    // "Pass"
    if (streak === 0) interval = 1;
    else if (streak === 1) interval = 6; // Jump to 6 days after first successful review
    else interval = Math.round(interval * ease);
    
    streak++;
  }

  // Update Ease Factor
  // ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3; // Minimum ease cap

  // Calculate next review timestamp
  // If quality is < 3 (Again), set to now + 1 minute (effectively immediate for next session logic)
  const nextReview = quality < 3 
    ? Date.now() // Due immediately/re-queue
    : Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    id: status.id,
    interval,
    ease,
    streak,
    nextReview
  };
};
