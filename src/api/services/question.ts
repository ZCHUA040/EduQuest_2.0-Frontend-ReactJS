import apiService from "@/api/api-service";
import type { Question, QuestionMultipleNewForm } from "@/types/question";


export const getQuestionsAndAnswers = async (): Promise<Question[]> => {
  const response = await apiService.get<Question[]>('/api/questions/');
  return response.data;
}

export const getQuestionAndAnswers = async (id: string): Promise<Question> => {
  const response = await apiService.get<Question>(`/api/questions/${id}/`);
  return response.data;
}

export const getQuestionsByQuest = async (questId: string): Promise<Question[]> => {
  const response = await apiService.get<Question[]>(`/api/questions/by_quest/?quest_id=${questId}`);
  return response.data;
}

export const createQuestionsAndAnswers = async (questionsAndAnswers: QuestionMultipleNewForm[]): Promise<Question> => {
  const response = await apiService.post<Question>('/api/questions/', questionsAndAnswers);
  return response.data;
}

