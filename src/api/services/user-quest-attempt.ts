import apiService from "@/api/api-service";
import type {
  UserQuestAttempt,
  // UserQuestAttemptMultipleUpdateForm,
  UserQuestAttemptNewForm, UserQuestAttemptUpdateForm
} from "@/types/user-quest-attempt";
import type { UserQuestAttemptBonusResponse } from "@/types/user-quest-attempt";

export const getUserQuestAttempts = async (): Promise<UserQuestAttempt[]> => {
  const response = await apiService.get<UserQuestAttempt[]>('/api/user-quest-attempts/');
  return response.data;
}

export const getUserQuestAttempt = async (id: string): Promise<UserQuestAttempt> => {
  const response = await apiService.get<UserQuestAttempt>(`/api/user-quest-attempts/${id}/`);
  return response.data;
}

export const getUserQuestAttemptsByUserAndQuest = async (userId: string, questId: string): Promise<UserQuestAttempt[]> => {
  const response = await apiService.get<UserQuestAttempt[]>(`/api/user-quest-attempts/by_user_quest/?user_id=${userId}&quest_id=${questId}`);
  return response.data;
}

export const getUserQuestAttemptsByQuest = async (questId: string): Promise<UserQuestAttempt[]> => {
  const response = await apiService.get<UserQuestAttempt[]>(`/api/user-quest-attempts/by_quest/?quest_id=${questId}`);
  return response.data;
}

export const createUserQuestAttempt = async (userQuestAttempt: UserQuestAttemptNewForm): Promise<UserQuestAttempt> => {
  const response = await apiService.post<UserQuestAttempt>('/api/user-quest-attempts/', userQuestAttempt);
  return response.data;
}

export const updateUserQuestAttempt = async (id: string, userQuestAttempt: UserQuestAttemptUpdateForm): Promise<UserQuestAttempt> => {
  const response = await apiService.patch<UserQuestAttempt>(`/api/user-quest-attempts/${id}/`, userQuestAttempt);
  return response.data;
}

export const updateUserQuestAttemptByQuestAsSubmitted = async (questId: string): Promise<void> => {
  await apiService.post(`/api/user-quest-attempts/set_all_attempts_submitted_by_quest/?quest_id=${questId}`);
}

export const deleteUserQuestAttempt = async (id: string): Promise<void> => {
  await apiService.delete(`/api/user-quest-attempts/${id}/`);
}

export const claimUserQuestAttemptBonus = async (id: string): Promise<UserQuestAttemptBonusResponse> => {
  const response = await apiService.post<UserQuestAttemptBonusResponse>(`/api/user-quest-attempts/${id}/bonus/`);
  return response.data;
}
