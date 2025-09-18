import React from 'react';
import Editor from '@monaco-editor/react';
import { SubmissionHistoryForProblem } from '../types';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import { getSubmissionStatusMeta } from '../utils/submissionStatus';
import IconButton from './IconButton';
import { useToastContext } from '../context/ToastContext';

interface SubmissionHistoryListProps {
  submissions: SubmissionHistoryForProblem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedSubmissionId?: number | null;
  expandedSubmissionId?: number | null;
  onToggleExpand?: (submissionId: number | null) => void;
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
  expandedSubmissionId,
  onToggleExpand,
}) => {
  const toast = useToastContext();
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

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('코드를 복사했습니다!');
    } catch (error) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast.success('코드를 복사했습니다!');
      } catch (fallbackError) {
        console.error('Clipboard copy failed', fallbackError);
        toast.error('클립보드 복사에 실패했습니다.');
      }
    }
  };

  const resolveEditorLanguage = (language: string) => {
    const upper = language?.toUpperCase() ?? '';
    if (upper.includes('JAVA')) {
      return 'java';
    }
    if (upper.includes('PYTHON')) {
      return 'python';
    }
    if (upper.includes('JAVASCRIPT') || upper.includes('JS')) {
      return 'javascript';
    }
    if (upper.includes('TYPESCRIPT') || upper.includes('TS')) {
      return 'typescript';
    }
    if (upper.includes('C++') || upper.includes('CPP')) {
      return 'cpp';
    }
    if (upper.includes('C#')) {
      return 'csharp';
    }
    return 'plaintext';
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
                className="px-4 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                제출 ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                결과
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                언어
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                실행 시간
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                메모리
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                제출 시간
              </th>
              <th
                scope="col"
                className="px-12 py-3 text-right text-xs font-medium text-black-500 uppercase tracking-wider"
              >
                코드
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => {
              const meta = getSubmissionStatusMeta(submission.submitStatus);
              const isSelected =
                submission.submissionId === selectedSubmissionId;
              const isExpanded =
                expandedSubmissionId === submission.submissionId;

              return (
                <React.Fragment key={submission.submissionId}>
                  <tr
                    className={`${
                      isSelected ? 'bg-indigo-50' : 'bg-white'
                    } ${isExpanded ? 'border-b border-gray-200' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-black-500">
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
                    <td className="px-4 py-3 text-sm text-black-500 uppercase">
                      {submission.language}
                    </td>
                    <td className="px-4 py-3 text-sm text-black-500">
                      {submission.runtimeMs !== undefined &&
                      submission.runtimeMs !== null
                        ? `${submission.runtimeMs} ms`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-black-500">
                      {submission.memoryKb !== undefined &&
                      submission.memoryKb !== null
                        ? `${submission.memoryKb} KB`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {submission.submitTime
                        ? new Date(submission.submitTime).toLocaleString(
                            'ko-KR'
                          )
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {onToggleExpand && (
                        <IconButton
                          label={isExpanded ? '코드 닫기' : '코드 보기'}
                          onClick={() =>
                            onToggleExpand(
                              isExpanded ? null : submission.submissionId
                            )
                          }
                          className="ml-auto"
                        >
                          {isExpanded ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 12H6"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v12m6-6H6"
                              />
                            </svg>
                          )}
                          <span className="ml-1 text-sm">
                            {isExpanded ? '코드 닫기' : '코드 보기'}
                          </span>
                        </IconButton>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-4 pb-4">
                        <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700">
                              제출 코드
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">
                                {submission.language}
                              </span>
                              <IconButton
                                label="코드 복사"
                                onClick={() =>
                                  handleCopyCode(submission.sourceCode)
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 13h6m-6 4h6M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="ml-1 text-sm">복사</span>
                              </IconButton>
                            </div>
                          </div>
                          <div className="max-h-80 overflow-hidden">
                            <Editor
                              height="320px"
                              language={resolveEditorLanguage(
                                submission.language
                              )}
                              value={submission.sourceCode}
                              theme="vs-dark"
                              options={{
                                readOnly: true,
                                fontSize: 13,
                                lineNumbers: 'on',
                                minimap: { enabled: false },
                                scrollbar: {
                                  vertical: 'visible',
                                  horizontal: 'visible',
                                },
                                overviewRulerLanes: 0,
                                wordWrap: 'off',
                              }}
                              loading={
                                <div className="flex h-52 items-center justify-center bg-gray-900 text-sm text-gray-200">
                                  코드 뷰어를 불러오는 중...
                                </div>
                              }
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
