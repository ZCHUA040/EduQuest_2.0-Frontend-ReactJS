import apiService from "@/api/api-service";
import microService from "@/api/micro-service";
import type { Quest, QuestNewForm, QuestUpdateForm } from "@/types/quest";
import type {Question} from "@/types/question";
import type { BonusGame } from "@/types/bonus-game";


export const getQuests = async (): Promise<Quest[]> => {
  const response = await apiService.get<Quest[]>('/api/quests/');
  return response.data;
}

export const getQuest = async (id: string): Promise<Quest> => {
  const response = await apiService.get<Quest>(`/api/quests/${id}/`);
  return response.data;
}

export const getNonPrivateQuests = async (): Promise<Quest[]> => {
  const response = await apiService.get<Quest[]>('/api/quests/non_private/');
  return response.data;
}

export const getMyPrivateQuests = async (): Promise<Quest[]> => {
  const response = await apiService.get<Quest[]>('/api/quests/private_by_user/');
  return response.data;
}

export const getMyQuests = async(id: string): Promise<Quest[]> => {
  const response = await apiService.get<Quest[]>(`/api/quests/by_enrolled_user/?user_id=${id}`);
  return response.data;
}

export const getQuestsByCourseGroup = async(id: string): Promise<Quest[]> => {
  const response = await apiService.get<Quest[]>(`/api/quests/by_course_group/?course_group_id=${id}`);
  return response.data;
}

export const createQuest = async (questNewForm: QuestNewForm): Promise<Quest> => {
  const response = await apiService.post<Quest>('/api/quests/', questNewForm);
  return response.data;
}

export const importQuest = async (questImportFormData: FormData): Promise<Question[]> => {
  const response = await apiService.post<Question[]>(`/api/quests/import_quest/`, questImportFormData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export const updateQuest = async (id: string, questUpdateForm: QuestUpdateForm): Promise<Quest> => {
  const response = await apiService.patch<Quest>(`/api/quests/${id}/`, questUpdateForm);
  return response.data;
}

export const getQuestBonusGame = async (id: string): Promise<BonusGame> => {
  const quest = await getQuest(id);
  const sourceFile = quest.source_document?.file;
  if (!sourceFile) {
    throw new Error('No source document found for this quest.');
  }
  const documentId = sourceFile.split('/').pop() || '';
  if (!documentId) {
    throw new Error('Invalid source document filename.');
  }
  const response = await microService.post<BonusGame>(`/generate_bonus_game`, {
    document_id: documentId,
  });
  return response.data;
}

export const deleteQuest = async (id: string): Promise<void> => {
  await apiService.delete(`/api/quests/${id.toString()}/`);
}
