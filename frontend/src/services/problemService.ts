import { Problem, ProblemListResponse, ProblemCreateRequest } from '../types';
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

  // Get my problems (problems created by the current user)
  getMyProblems: async (page: number = 0): Promise<ProblemListResponse> => {
    const response = await api.get<ProblemListResponse>(
      `/problems/my?page=${page}&size=10`
    );
    return response;
  },

  // Create a new problem
  createProblem: async (
    problemData: ProblemCreateRequest
  ): Promise<Problem> => {
    const response = await api.post<Problem>('/problems', problemData);
    return response;
  },

  // Create a draft problem (minimal info, returns problemId)
  createDraftProblem: async (): Promise<{ problemId: number }> => {
    const response = await api.post<{ problemId: number }>('/problems', {
      title: null,
      description: '',
      timeLimitSec: 1.0,
      memoryLimitMb: 256,
      exampleTestCases: [],
      testCaseUrls: [],
    });
    return response;
  },

  // Save draft problem
  saveDraftProblem: async (
    problemId: number,
    problemData: ProblemCreateRequest
  ): Promise<Problem> => {
    const response = await api.put<Problem>('/problems/draft', {
      problemId,
      ...problemData,
    });
    return response;
  },

  // Get my problem for editing
  getMyProblem: async (problemId: number): Promise<Problem> => {
    const response = await api.get<Problem>(`/problems/my/${problemId}`);
    return response;
  },
};
