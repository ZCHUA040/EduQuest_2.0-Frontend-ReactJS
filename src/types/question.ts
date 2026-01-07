import {type Answer, type AnswerNewForm} from "@/types/answer";


export interface Question {
  quest_id: number;
  id: number;
  number: number;
  text: string;
  max_score: number;
  hint?: string | null;
  question_type?: string;
  structured_data?: Record<string, unknown>;
  answers: Answer[];
}

export interface QuestionMultipleNewForm {
  quest_id: number;
  text: string;
  number: number;
  max_score: number;
  hint?: string | null;
  question_type?: string;
  structured_data?: Record<string, unknown>;
  answers: AnswerNewForm[];
}

export interface GeneratedQuestions {
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestion {
  number: number;
  text: string;
  hint?: string | null;
  question_type?: string;
  structured_data?: Record<string, unknown>;
  answers: AnswerNewForm[];
}
