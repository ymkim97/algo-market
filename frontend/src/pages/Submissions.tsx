import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { SubmissionHistoryForProblem, SubmissionStatus } from '../types';
import { authService } from '../services/authService';
import { submissionService } from '../services/submissionService';
import { problemService } from '../services/problemService';
import { useToastContext } from '../context/ToastContext';
import { getSubmissionStatusMeta } from '../utils/submissionStatus';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import IconButton from '../components/IconButton';

interface FilterState {
  status: 'ALL' | SubmissionStatus;
  language: 'ALL' | string;
}

const PAGE_SIZE = 10;

const SubmissionsPage: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [filter, setFilter] = React.useState<FilterState>({
    status: 'ALL',
    language: 'ALL',
  });
  const [loading, setLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<
    SubmissionHistoryForProblem[]
  >([]);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [navigating, setNavigating] = React.useState(false);
  const [codePreview, setCodePreview] =
    React.useState<SubmissionHistoryForProblem | null>(null);

  const loadSubmissions = React.useCallback(
    async (pageToLoad: number) => {
      if (!isAuthenticated) {
        setLoading(false);
        setSubmissions([]);
        setTotalPages(0);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await submissionService.getUserSubmissionsPage(
          pageToLoad,
          PAGE_SIZE
        );
        setSubmissions(response.content);
        setTotalPages(response.page.totalPages);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          '제출 목록을 불러오는 중 오류가 발생했습니다.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadSubmissions(page);
  }, [isAuthenticated, page, loadSubmissions]);

  const uniqueLanguages = React.useMemo(() => {
    return Array.from(
      new Set(submissions.map((submission) => submission.language))
    );
  }, [submissions]);

  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((submission) => {
      const matchStatus =
        filter.status === 'ALL' || submission.submitStatus === filter.status;
      const matchLanguage =
        filter.language === 'ALL' || submission.language === filter.language;
      return matchStatus && matchLanguage;
    });
  }, [filter, submissions]);

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setFilter((prev) => ({
      ...prev,
      status: event.target.value as FilterState['status'],
    }));
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setFilter((prev) => ({
      ...prev,
      language: event.target.value as FilterState['language'],
    }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    setPage(nextPage);
  };

  const resolveEditorLanguage = React.useCallback((language: string) => {
    const upper = language?.toUpperCase() ?? '';
    if (upper.includes('JAVA')) return 'java';
    if (upper.includes('PYTHON')) return 'python';
    if (upper.includes('TYPESCRIPT') || upper.includes('TS'))
      return 'typescript';
    if (upper.includes('JAVASCRIPT') || upper.includes('JS'))
      return 'javascript';
    if (upper.includes('C++') || upper.includes('CPP')) return 'cpp';
    if (upper.includes('C#')) return 'csharp';
    if (upper.includes('GO')) return 'go';
    return 'plaintext';
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('코드를 복사했습니다.');
    } catch {
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
        toast.success('코드를 복사했습니다.');
      } catch (err) {
        console.error('Clipboard copy failed', err);
        toast.error('클립보드 복사에 실패했습니다.');
      }
    }
  };

  const handleOpenCodePreview = (submission: SubmissionHistoryForProblem) => {
    setCodePreview(submission);
  };

  const handleCloseCodePreview = () => {
    setCodePreview(null);
  };

  const handleProblemNavigate = async (problemTitle: string) => {
    if (!problemTitle) return;

    try {
      setNavigating(true);
      const problem = await problemService.getProblemByTitle(problemTitle);
      navigate(`/problems/${problem.problemNumber}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        '문제 상세 정보를 불러오는 중 오류가 발생했습니다.';
      toast.error(message);
    } finally {
      setNavigating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-12 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            내 제출 기록을 확인하려면 로그인해 주세요
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            제출 내역 등의 정보를 확인하려면 로그인이 필요합니다.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center rounded-md border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <ProgressBar loading={loading || navigating} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">내 제출 기록</h1>
        <p className="mt-2 text-sm text-gray-600">
          최근 제출 내역과 결과를 한 곳에서 확인할 수 있습니다.
        </p>
      </header>

      {error && (
        <ErrorMessage
          className="mb-6"
          title="제출 기록을 불러오지 못했습니다"
          message={error}
          onRetry={() => loadSubmissions(page)}
        />
      )}

      {loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            제출 데이터를 불러오는 중입니다...
          </p>
        </div>
      ) : (
        <>
          <section className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-end md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  결과 상태
                </label>
                <select
                  value={filter.status}
                  onChange={handleStatusChange}
                  className="mt-1 w-40 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">전체</option>
                  <option value="ACCEPTED">정답</option>
                  <option value="WRONG_ANSWER">틀렸습니다</option>
                  <option value="TIME_LIMIT_EXCEEDED">시간 초과</option>
                  <option value="MEMORY_LIMIT_EXCEEDED">메모리 초과</option>
                  <option value="RUNTIME_ERROR">런타임 에러</option>
                  <option value="COMPILE_ERROR">컴파일 에러</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  언어
                </label>
                <select
                  value={filter.language}
                  onChange={handleLanguageChange}
                  className="mt-1 w-40 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">전체</option>
                  {uniqueLanguages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      제출 ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      문제 제목
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      결과
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      언어
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      실행 시간
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      메모리
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      제출 시간
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      코드
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        조건에 맞는 제출 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission) => {
                      const meta = getSubmissionStatusMeta(
                        submission.submitStatus
                      );
                      return (
                        <tr key={submission.submissionId}>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            #{submission.submissionId}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              type="button"
                              onClick={() =>
                                handleProblemNavigate(submission.problemTitle)
                              }
                              className="text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {submission.problemTitle}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${meta.bgColor} ${meta.textColor}`}
                            >
                              {meta.text}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 uppercase">
                            {submission.language}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {submission.runtimeMs != null
                              ? `${submission.runtimeMs} ms`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {submission.memoryKb != null
                              ? `${submission.memoryKb} KB`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(submission.submitTime).toLocaleString(
                              'ko-KR'
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <IconButton
                              label="제출 코드 보기"
                              onClick={() => handleOpenCodePreview(submission)}
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
                                  d="M8 16l-4-4 4-4m8 8l4-4-4-4"
                                />
                              </svg>
                              <span className="ml-1 text-sm">코드 보기</span>
                            </IconButton>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <Pagination
            className="mt-6"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {codePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  제출 코드 #{codePreview.submissionId}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {codePreview.problemTitle} · {codePreview.language} ·{' '}
                  {new Date(codePreview.submitTime).toLocaleString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <IconButton
                  label="코드 복사"
                  onClick={() => handleCopyCode(codePreview.sourceCode)}
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
                <IconButton label="닫기" onClick={handleCloseCodePreview}>
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </IconButton>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-hidden p-0">
              <Editor
                height="60vh"
                language={resolveEditorLanguage(codePreview.language)}
                value={codePreview.sourceCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  wordWrap: 'off',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
