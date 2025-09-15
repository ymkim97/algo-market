// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Problem Types
export interface Problem {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  submitCount: number;
  correctCount: number;
  examples: Example[];
  difficulty?: string;
  tags?: string[];
  isPublic: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

// Submission Types
export interface Submission {
  id: number;
  problemId: number;
  userId: number;
  code: string;
  language: string;
  status: SubmissionStatus;
  createdAt: string;
  executionTime?: number;
  memoryUsage?: number;
}

export type SubmissionStatus =
  | 'PENDING'
  | 'JUDGING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR';

// Progress Types
export interface ProgressEvent {
  submissionId: number;
  username: string;
  submitStatus: SubmissionStatus;
  progressPercent: number;
  currentTest: number;
  totalTests: number;
  timestamp: string;
}
