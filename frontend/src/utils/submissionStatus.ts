import { SubmissionStatus } from '../types';

export interface SubmissionStatusMeta {
  text: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

const DEFAULT_META: SubmissionStatusMeta = {
  text: '알 수 없음',
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-800',
  icon: '❓',
};

const STATUS_META: Record<SubmissionStatus, SubmissionStatusMeta> = {
  PENDING: {
    text: '대기 중',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: '⏳',
  },
  JUDGING: {
    text: '채점 중',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'spinner',
  },
  ACCEPTED: {
    text: '정답',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✅',
  },
  WRONG_ANSWER: {
    text: '틀렸습니다',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '❌',
  },
  TIME_LIMIT_EXCEEDED: {
    text: '시간 초과',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '⏰',
  },
  MEMORY_LIMIT_EXCEEDED: {
    text: '메모리 초과',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: '💾',
  },
  RUNTIME_ERROR: {
    text: '런타임 에러',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: '🚫',
  },
  COMPILE_ERROR: {
    text: '컴파일 에러',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    icon: '🔧',
  },
  SERVER_ERROR: {
    text: '서버 에러',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: '⚠️',
  },
};

export const getSubmissionStatusMeta = (
  status: SubmissionStatus
): SubmissionStatusMeta => {
  return STATUS_META[status] ?? DEFAULT_META;
};
