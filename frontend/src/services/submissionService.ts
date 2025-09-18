import {
  ApiResponse,
  PageResponse,
  Submission,
  SubmissionHistoryForProblem,
  SubmitResponse,
} from '../types';
import api from './api';

export const submissionService = {
  // Submit code
  submitCode: async (
    problemId: number,
    sourceCode: string,
    language: string
  ): Promise<SubmitResponse> => {
    const response = await api.post<SubmitResponse>('/submissions', {
      problemId,
      sourceCode,
      language,
    });
    return response;
  },

  // Get submission by id
  getSubmission: async (submissionId: number): Promise<Submission> => {
    const response = await api.get<ApiResponse<Submission>>(
      `/submissions/${submissionId}`
    );
    return response.data;
  },

  // Get user's submissions
  getUserSubmissionsPage: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<SubmissionHistoryForProblem>> => {
    const response = await api.get<PageResponse<SubmissionHistoryForProblem>>(
      `/submissions?page=${page}&size=${size}`
    );
    return response;
  },

  // Get submissions for a problem
  getProblemSubmissions: async (
    problemId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<SubmissionHistoryForProblem>> => {
    const response = await api.get<PageResponse<SubmissionHistoryForProblem>>(
      `/submissions/history/${problemId}?page=${page}&size=${size}`
    );
    return response;
  },

  // Create an SSE connection for real-time progress
  createProgressEventSource: (submissionId: number): EventSource => {
    const user = localStorage.getItem('user');
    const username = user ? JSON.parse(user).username : '';
    const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/submissions/${submissionId}/progress?username=${username}`;

    // 표준 EventSource 사용 (query parameter로 username 전송)
    return new EventSource(url);
  },
};
