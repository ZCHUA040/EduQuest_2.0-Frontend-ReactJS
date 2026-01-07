import type { UserQuestAttemptSummary } from './user-quest-attempt';

export interface StudentFeedback {
  id: number;
  user_quest_attempt: UserQuestAttemptSummary;
  quest_summary: {
    overall_bloom_rating: number;
    overall_bloom_level: string;
    summary: string;
  };
  subtopic_feedback: {
    subtopic: string;
    bloom_rating: number;
    bloom_level: string;
    evidence: string;
    improvement_focus: string;
  }[];
  study_tips: string[];
  datetime_created: string;
}
