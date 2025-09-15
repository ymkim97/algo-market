import { Problem, ApiResponse } from '../types';
import api from './api';

export const problemService = {
  // Get all problems
  getProblems: async (
    page: number = 0,
    size: number = 20
  ): Promise<Problem[]> => {
    const response = await api.get<ApiResponse<Problem[]>>(
      `/problems?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get problem by id
  getProblem: async (problemId: number): Promise<Problem> => {
    const response = await api.get<ApiResponse<Problem>>(
      `/problems/${problemId}`
    );
    return response.data;
  },

  // Search problems
  searchProblems: async (
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<Problem[]> => {
    const response = await api.get<ApiResponse<Problem[]>>(
      `/problems/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response.data;
  },

  // Create problem (for admin/creator)
  createProblem: async (problem: Partial<Problem>): Promise<Problem> => {
    const response = await api.post<ApiResponse<Problem>>('/problems', problem);
    return response.data;
  },

  // Update problem (for admin/creator)
  updateProblem: async (
    problemId: number,
    problem: Partial<Problem>
  ): Promise<Problem> => {
    const response = await api.put<ApiResponse<Problem>>(
      `/problems/${problemId}`,
      problem
    );
    return response.data;
  },
};
