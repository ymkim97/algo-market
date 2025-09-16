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

export interface SignupRequest {
  username: string;
  password: string;
  email?: string;
}

export interface SignupResponse {
  message: string;
  success: boolean;
}

// Problem Types
export interface Problem {
  problemId?: number; // 상세에서만 있음
  problemNumber: number; // 문제 번호
  title: string;
  description?: string; // 목록에서는 없고 상세에서만 있음
  timeLimit?: number; // 상세에서만 있음 (float)
  memoryLimit?: number; // 상세에서만 있음
  submitCount: number;
  exampleTestCases?: ExampleTestCase[]; // 상세에서만 있음
}

export interface ExampleTestCase {
  input: string;
  output: string;
}

// 페이지네이션을 위한 타입
export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

// API 응답 타입
export interface ProblemListResponse extends PageResponse<Problem> {}

// 기존 Example 타입은 호환성을 위해 유지
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

export interface SubmitResponse {
  submissionId: number;
  problemId: number;
  username: string;
  submitStatus: SubmissionStatus;
  runtimeMs?: number;
  memoryKb?: number;
  submitTime: string;
}

export type SubmissionStatus =
  | 'PENDING'
  | 'JUDGING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'SERVER_ERROR';

// Progress Types
export interface ProgressEvent {
  submissionId: number;
  username: string;
  submitStatus: SubmissionStatus;
  progressPercent: number;
  currentTest: number;
  totalTest: number;
  timeStamp: string;
  runtimeMs?: number;
  memoryKb?: number;
}

export interface CompletedEvent {
  submissionId: number;
  username: string;
  finalStatus: SubmissionStatus;
  timeStamp: string;
}
