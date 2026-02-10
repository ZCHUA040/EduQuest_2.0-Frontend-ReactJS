import apiService from '@/api/api-service';
import microService from '@/api/micro-service';
import { getUserAnswerAttemptByUserQuestAttempt } from '@/api/services/user-answer-attempt';
import type { StudentFeedback } from '@/types/student-feedback';
import type { UserAnswerAttempt } from '@/types/user-answer-attempt';

export const getStudentFeedbackByAttempt = async (attemptId: string): Promise<StudentFeedback | null> => {
  const response = await apiService.get<StudentFeedback | Record<string, never>>(
    `/api/student-feedback/by_attempt/?user_quest_attempt_id=${attemptId}`
  );

  if (!response.data || !('id' in response.data)) {
    return null;
  }

  return response.data as StudentFeedback;
};

export interface FeedbackPayload {
  quest_summary?: {
    overall_bloom_rating?: number;
    overall_bloom_level?: string;
    summary?: string;
  };
  subtopic_feedback?: {
    subtopic: string;
    bloom_rating: number;
    bloom_level: string;
    evidence?: string;
    improvement_focus?: string;
  }[];
  study_tips?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string;
  question_feedback?: Record<string, unknown>;
}

interface AttemptPayload {
  student_id: number;
  quest_id: number;
  answers: {
    question_id: number;
    question_text: string;
    cognitive_level: string;
    topic: string;
    selected_answer: string;
    is_selected: boolean;
    answer_is_correct: boolean;
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
  }[];
}

const buildAttemptPayload = (attemptId: string, userId: number, answerAttempts: UserAnswerAttempt[]): AttemptPayload => {
  if (!answerAttempts.length) {
    throw new Error('No answers found for this attempt.');
  }
  const questId = answerAttempts[0].question.quest_id;
  const answers = answerAttempts.map((attempt) => {
    const question = attempt.question;
    const questionMeta = question as unknown as { cognitive_level?: string; topic?: string };
    const correctAnswer = question.answers.find((answer) => answer.is_correct);
    return {
      question_id: question.id,
      question_text: question.text,
      cognitive_level: questionMeta.cognitive_level ?? 'Understand',
      topic: questionMeta.topic ?? 'General',
      selected_answer: attempt.answer.text,
      is_selected: attempt.is_selected,
      answer_is_correct: attempt.answer.is_correct,
      is_correct: attempt.is_selected && attempt.answer.is_correct,
      correct_answer: correctAnswer?.text ?? '',
      explanation: attempt.answer.reason ?? ''
    };
  });

  return {
    student_id: userId,
    quest_id: questId,
    answers
  };
};

export const generateFeedbackFromMicroservice = async (attemptId: string, userId: number): Promise<FeedbackPayload> => {
  const answerAttempts = await getUserAnswerAttemptByUserQuestAttempt(attemptId);
  const payload = buildAttemptPayload(attemptId, userId, answerAttempts);
  const response = await microService.post<FeedbackPayload>('/generate_feedback', payload);
  return response.data;
};

export const saveStudentFeedback = async (attemptId: string, feedback: FeedbackPayload): Promise<StudentFeedback> => {
  const response = await apiService.post<StudentFeedback>('/api/student-feedback/save/', {
    user_quest_attempt_id: Number(attemptId),
    ...feedback
  });
  return response.data;
};
