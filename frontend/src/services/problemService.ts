import { Problem, ProblemListResponse } from '../types';
import api from './api';

export const problemService = {
  // Get all problems with pagination
  getProblems: async (
    page: number = 0,
    size: number = 20
  ): Promise<ProblemListResponse> => {
    const response = await api.get<ProblemListResponse>(
      `/problems?page=${page}&size=${size}`
    );
    return response;
  },

  // Get problem by problemNumber
  getProblem: async (problemNumber: number): Promise<Problem> => {
    const response = await api.get<Problem>(`/problems/${problemNumber}`);
    return response;
  },

  // Search problems (백엔드에서 지원하는 경우)
  searchProblems: async (
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProblemListResponse> => {
    const response = await api.get<ProblemListResponse>(
      `/problems/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response;
  },
};
