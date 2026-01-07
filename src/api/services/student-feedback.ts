import apiService from '@/api/api-service';
import type { StudentFeedback } from '@/types/student-feedback';

export const getStudentFeedbackByAttempt = async (attemptId: string): Promise<StudentFeedback | null> => {
  const response = await apiService.get<StudentFeedback | Record<string, never>>(
    `/api/student-feedback/by_attempt/?user_quest_attempt_id=${attemptId}`
  );

  if (!response.data || !('id' in response.data)) {
    return null;
  }

  return response.data as StudentFeedback;
};
