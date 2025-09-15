import { Submission, ApiResponse } from '../types';
import api from './api';

export const submissionService = {
  // Submit code
  submitCode: async (
    problemId: number,
    code: string,
    language: string
  ): Promise<Submission> => {
    const response = await api.post<ApiResponse<Submission>>('/submissions', {
      problemId,
      code,
      language,
    });
    return response.data;
  },

  // Get submission by id
  getSubmission: async (submissionId: number): Promise<Submission> => {
    const response = await api.get<ApiResponse<Submission>>(
      `/submissions/${submissionId}`
    );
    return response.data;
  },

  // Get user's submissions
  getUserSubmissions: async (
    page: number = 0,
    size: number = 20
  ): Promise<Submission[]> => {
    const response = await api.get<ApiResponse<Submission[]>>(
      `/submissions/my?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get submissions for a problem
  getProblemSubmissions: async (
    problemId: number,
    page: number = 0,
    size: number = 20
  ): Promise<Submission[]> => {
    const response = await api.get<ApiResponse<Submission[]>>(
      `/problems/${problemId}/submissions?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Create SSE connection for real-time progress
  createProgressEventSource: (submissionId: number): EventSource => {
    const token = localStorage.getItem('token');
    const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'}/submissions/${submissionId}/progress`;

    // Note: EventSource doesn't support custom headers directly
    // We'll need to pass token as query parameter for SSE
    const eventSource = new EventSource(`${url}?token=${token}`);

    return eventSource;
  },
};
