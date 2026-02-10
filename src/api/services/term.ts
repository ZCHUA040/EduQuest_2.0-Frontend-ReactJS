import apiService from "@/api/api-service";
import type { Term, TermNewForm, TermUpdateForm } from "@/types/term";


export const getTerms = async (): Promise<Term[]> => {
  const response = await apiService.get<Term[]>('/api/terms/');
  return response.data;
}

export const getNonPrivateTerms = async (): Promise<Term[]> => {
  const response = await apiService.get<Term[]>('/api/terms/non_private/');
  return response.data;
}

export const getTerm = async (id: string): Promise<Term> => {
  const response = await apiService.get<Term>(`/api/terms/${id}/`);
  return response.data;
}

export const createTerm = async (term: TermNewForm): Promise<Term> => {
  const response = await apiService.post<Term>('/api/terms/', term);
  return response.data;
}

export const updateTerm = async (id: string, term: TermUpdateForm): Promise<Term> => {
  const response = await apiService.patch<Term>(`/api/terms/${id}/`, term);
  return response.data;
}

export const deleteTerm = async (id: string): Promise<void> => {
  await apiService.delete(`/api/terms/${id}/`);
}
