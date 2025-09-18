import React from 'react';
import { SubmissionHistoryForProblem } from '../types';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import { getSubmissionStatusMeta } from '../utils/submissionStatus';

interface SubmissionHistoryListProps {
  submissions: SubmissionHistoryForProblem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedSubmissionId?: number | null;
}

const SubmissionHistoryList: React.FC<SubmissionHistoryListProps> = ({
  submissions,
  loading,
  error,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  selectedSubmissionId,
}) => {
  const isInitialLoading = loading && submissions.length === 0;
  const hasMultiplePages = totalPages > 1;

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index);
    }

    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, start + 4);
    const adjustedStart = Math.max(0, end - 4);
    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index
    );
  };

  if (isInitialLoading) {
    return (
      <div className="py-6">
        <LoadingSpinner />
        <p className="mt-3 text-sm text-gray-500 text-center">
          제출 기록을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="제출 기록을 불러오지 못했습니다"
        message={error}
        onRetry={onRetry}
        className="mt-4"
      />
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        아직 제출 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                제출 ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                결과
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                언어
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                실행 시간
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                메모리
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                제출 시간
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => {
              const meta = getSubmissionStatusMeta(submission.submitStatus);
              const isSelected =
                submission.submissionId === selectedSubmissionId;

              return (
                <tr
                  key={submission.submissionId}
                  className={isSelected ? 'bg-indigo-50' : undefined}
                >
                  <td className="px-4 py-3 text-sm text-gray-500">
                    #{submission.submissionId}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${meta.bgColor} ${meta.textColor}`}
                    >
                      {meta.icon !== 'spinner' ? (
                        <span className="mr-1 text-base leading-none">
                          {meta.icon}
                        </span>
                      ) : null}
                      {meta.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 uppercase">
                    {submission.language}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {submission.runtimeMs !== undefined &&
                    submission.runtimeMs !== null
                      ? `${submission.runtimeMs}ms`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {submission.memoryKb !== undefined &&
                    submission.memoryKb !== null
                      ? `${submission.memoryKb}KB`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {submission.submitTime
                      ? new Date(submission.submitTime).toLocaleString('ko-KR')
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMultiplePages && (
        <div className="flex items-center justify-center space-x-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            이전
          </button>
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={loading || page === currentPage}
                className={`px-3 py-1 text-sm rounded-md border ${
                  page === currentPage
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                } disabled:opacity-60 disabled:hover:bg-indigo-50`}
              >
                {page + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              onPageChange(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage >= totalPages - 1 || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistoryList;
