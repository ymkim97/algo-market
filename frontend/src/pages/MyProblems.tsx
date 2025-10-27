import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { Problem, ProblemStatus } from '../types';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { useToastContext } from '../context/ToastContext';
import { authService } from '../services/authService';

type FilterValue = 'ALL' | ProblemStatus;
const LANGUAGE_LABELS: Record<string, string> = {
  JAVA: 'Java',
  PYTHON: 'Python',
  KOTLIN: 'Kotlin',
  JAVASCRIPT: 'JavaScript',
  CPP: 'C++',
  C: 'C',
};

const MyProblems: React.FC = () => {
  const { success, error: showError } = useToastContext();
  const isAuthenticated = authService.isAuthenticated();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  );

  const filterOptions = useMemo(
    () => [
      {
        label: '전체',
        value: 'ALL' as FilterValue,
        helper: '모든 상태의 문제 보기',
      },
      {
        label: '공개',
        value: 'PUBLIC' as FilterValue,
        helper: '게시가 완료된 문제',
      },
      {
        label: '임시 저장',
        value: 'DRAFT' as FilterValue,
        helper: '공개 준비 중인 문제',
      },
    ],
    []
  );

  const { totalCount, draftCount, publicCount } = useMemo(() => {
    const draft = problems.filter(
      (problem) => problem.problemStatus === 'DRAFT'
    ).length;
    const published = problems.filter(
      (problem) => problem.problemStatus === 'PUBLIC'
    ).length;

    return {
      totalCount: problems.length,
      draftCount: draft,
      publicCount: published,
    };
  }, [problems]);

  const filteredProblems = useMemo(() => {
    if (activeFilter === 'ALL') {
      return problems;
    }

    return problems.filter((problem) => problem.problemStatus === activeFilter);
  }, [activeFilter, problems]);

  const filterCounts = useMemo(
    () => ({
      ALL: totalCount,
      PUBLIC: publicCount,
      DRAFT: draftCount,
    }),
    [draftCount, publicCount, totalCount]
  );

  const activeFilterDescription = useMemo(() => {
    const selected = filterOptions.find(
      (option) => option.value === activeFilter
    );
    return selected?.helper ?? '';
  }, [activeFilter, filterOptions]);

  const hasProblems = filteredProblems.length > 0;
  const showInitialEmptyState = !loading && totalCount === 0;
  const showFilterEmptyState =
    !loading && totalCount > 0 && filteredProblems.length === 0;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadMyProblems(currentPage);
  }, [currentPage, isAuthenticated]);

  const loadMyProblems = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await problemService.getMyProblems(page);
      setProblems(response.content);
      setTotalPages(response.page.totalPages);
    } catch (err) {
      setError('내가 만든 문제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const showPublishConfirm = (problemId: number) => {
    setSelectedProblemId(problemId);
    setShowPublishModal(true);
  };

  const showDeleteConfirm = (problemId: number) => {
    setSelectedProblemId(problemId);
    setShowDeleteModal(true);
  };

  const handlePublishProblem = async () => {
    if (!selectedProblemId) return;

    try {
      await problemService.publishProblem(selectedProblemId);
      await loadMyProblems(currentPage);
      setShowPublishModal(false);
      setSelectedProblemId(null);
      setShowSuccessModal(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        '문제를 공개하는 중 오류가 발생했습니다.';
      showError(errorMessage);
      setShowPublishModal(false);
      setSelectedProblemId(null);
    }
  };

  const handleDeleteProblem = async () => {
    if (!selectedProblemId) return;

    try {
      await problemService.deleteProblem(selectedProblemId);
      await loadMyProblems(currentPage);
      setShowDeleteModal(false);
      setSelectedProblemId(null);
      success('문제가 성공적으로 삭제되었습니다.');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        '문제를 삭제하는 중 오류가 발생했습니다.';
      showError(errorMessage);
      setShowDeleteModal(false);
      setSelectedProblemId(null);
    }
  };

  const getStatusBadge = (status: ProblemStatus) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PUBLIC: 'bg-green-100 text-green-800 border-green-200',
    };

    const labels = {
      DRAFT: '임시 저장',
      PUBLIC: '공개',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[status]
        }`}
      >
        {labels[status]}
      </span>
    );
  };

  const formatLastModified = (lastModified: string) => {
    const now = new Date();
    const date = new Date(lastModified);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return '방금 전';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      // 7일 이상은 정확한 날짜 표시
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <ProgressBar loading={false} />
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-12 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            문제를 출제하려면 로그인해 주세요
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            작성 중인 문제 목록과 새 문제 만들기 기능은 로그인한 사용자만 사용할
            수 있습니다.
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
    <div className="relative">
      <ProgressBar loading={loading} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  내가 만든 문제
                </h1>
                <p className="text-gray-600">
                  출제한 문제 현황을 살펴보고 공개 준비를 마친 뒤 바로
                  배포하세요.
                </p>
              </div>
              <Link
                to="/create-problem/new"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 문제 만들기
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-sm font-medium text-gray-500">
                  전체 문제
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-gray-900">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-gray-400">개</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  공개 {publicCount.toLocaleString()}개 · 임시 저장{' '}
                  {draftCount.toLocaleString()}개
                </p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <span className="text-sm font-medium text-green-600">
                  공개된 문제
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-green-700">
                    {publicCount.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-green-500">개</span>
                </div>
                <p className="mt-2 text-xs text-green-600">
                  도전자들이 풀이 중인 문제 수입니다.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <span className="text-sm font-medium text-amber-600">
                  임시 저장
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-amber-700">
                    {draftCount.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-amber-500">개</span>
                </div>
                <p className="mt-2 text-xs text-amber-600">
                  공개 조건을 충족하면 바로 문제를 공개할 수 있어요.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                  const isActive = activeFilter === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setActiveFilter(option.value)}
                      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                      aria-pressed={isActive}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
                        {filterCounts[option.value]}개
                      </span>
                    </button>
                  );
                })}
              </div>
              {activeFilterDescription && (
                <span className="text-xs text-gray-500">
                  {activeFilterDescription}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-800">
                  문제 공개 체크리스트
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>
                      출제자가 2가지 이상의 프로그래밍 언어로 문제를 해결해야
                      합니다.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>
                      테스트 데이터가 입출력 각각 최소 10개 이상 준비되어야
                      합니다.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <ErrorMessage message={error} className="rounded-2xl shadow-sm" />
          )}

          {loading && totalCount === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                    <div className="flex flex-wrap gap-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
                    <div className="flex flex-wrap gap-2">
                      <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {showInitialEmptyState ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-10 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <svg
                      className="h-10 w-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">
                    아직 만든 문제가 없습니다
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    첫 번째 문제를 만들어 공개 준비 과정을 경험해 보세요.
                  </p>
                  <Link
                    to="/create-problem/new"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    새 문제 만들기
                  </Link>
                </div>
              ) : (
                <>
                  {showFilterEmptyState && (
                    <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 px-6 py-8 text-center text-indigo-700 shadow-sm">
                      <h3 className="text-base font-semibold">
                        선택한 조건에 맞는 문제가 없습니다
                      </h3>
                      <p className="mt-2 text-sm">
                        다른 필터를 선택하거나 페이지를 이동해 보세요.
                      </p>
                    </div>
                  )}

                  {hasProblems && (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredProblems.map((problem) => {
                        const key = problem.problemId ?? problem.problemNumber;
                        const solvedLanguages = problem.solvedLanguages ?? [];
                        const solvedLanguagesLabel =
                          solvedLanguages.length > 0
                            ? solvedLanguages
                                .map(
                                  (language) =>
                                    LANGUAGE_LABELS[language] || language
                                )
                                .join(', ')
                            : '없음';
                        const solvedCount = solvedLanguages.length;
                        const solvedStateClass =
                          solvedCount >= 2
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : solvedCount > 0
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-gray-200 bg-gray-50 text-gray-600';
                        const solvedStateLabel =
                          solvedCount >= 2
                            ? '해결 언어 조건 충족'
                            : `해결 언어 ${solvedCount}/2`;
                        return (
                          <div
                            key={key}
                            className="flex h-full flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-wrap items-center gap-3">
                                {problem.problemStatus === 'PUBLIC' ? (
                                  <Link
                                    to={`/problems/${problem.problemNumber}`}
                                    className="text-lg font-semibold text-indigo-600 hover:text-indigo-500"
                                  >
                                    {problem.title}
                                  </Link>
                                ) : (
                                  <span className="text-lg font-semibold text-gray-900">
                                    {problem.title}
                                  </span>
                                )}
                                {problem.problemStatus &&
                                  getStatusBadge(problem.problemStatus)}
                              </div>
                              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  <span>
                                    {problem.submitCount.toLocaleString()}회
                                    제출
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M3 7h18M3 12h18M3 17h18"
                                    />
                                  </svg>
                                  <span>문제 #{problem.problemNumber}</span>
                                </div>
                                {problem.timeLimit && (
                                  <div className="flex items-center gap-1.5">
                                    <svg
                                      className="h-4 w-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>{problem.timeLimit}초</span>
                                  </div>
                                )}
                                {problem.memoryLimit && (
                                  <div className="flex items-center gap-1.5">
                                    <svg
                                      className="h-4 w-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                      />
                                    </svg>
                                    <span>{problem.memoryLimit}MB</span>
                                  </div>
                                )}
                                {problem.lastModified && (
                                  <div className="flex items-center gap-1.5">
                                    <svg
                                      className="h-4 w-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    <span>
                                      {formatLastModified(problem.lastModified)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {problem.problemStatus === 'DRAFT' && (
                              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                                <div
                                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${solvedStateClass}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>{solvedStateLabel}</span>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {solvedCount}/2
                                  </span>
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                  현재 해결 언어: {solvedLanguagesLabel}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  충분한 테스트 케이스도 함께 준비하면 공개할
                                  준비가 끝나요.
                                </p>
                              </div>
                            )}

                            <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                              {problem.problemStatus === 'DRAFT' ? (
                                <>
                                  <Link
                                    to={`/create-problem/edit/${problem.problemId}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    수정하기
                                  </Link>
                                  <Link
                                    to={`/problems/draft/${problem.problemId}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                      />
                                    </svg>
                                    미리보기
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      problem.problemId &&
                                      showPublishConfirm(problem.problemId)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                    공개하기
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      problem.problemId &&
                                      showDeleteConfirm(problem.problemId)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    삭제하기
                                  </button>
                                </>
                              ) : (
                                <Link
                                  to={`/problems/${problem.problemNumber}`}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                  문제 보러가기
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {totalPages > 1 && (
                <div className="pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
        {/* 공개 확인 모달 */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  문제를 공개하시겠습니까?
                </h3>
                <div className="mt-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ 주의사항
                  </p>
                  <ul className="text-sm text-yellow-700 text-left space-y-1">
                    <li>• 한번 공개한 문제는 비공개로 되돌릴 수 없습니다</li>
                    <li>• 공개된 문제는 삭제할 수 없습니다</li>
                    <li>• 공개 후에는 내용 수정이 제한됩니다</li>
                  </ul>
                </div>
                <div className="flex justify-center mt-6 space-x-3">
                  <button
                    onClick={() => {
                      setShowPublishModal(false);
                      setSelectedProblemId(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePublishProblem}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    공개하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  문제를 삭제하시겠습니까?
                </h3>
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    ⚠️ 주의사항
                  </p>
                  <ul className="text-sm text-red-700 text-left space-y-1">
                    <li>• 삭제된 문제는 복구할 수 없습니다</li>
                    <li>• 모든 관련 데이터가 영구적으로 삭제됩니다</li>
                    <li>• 이 작업은 되돌릴 수 없습니다</li>
                  </ul>
                </div>
                <div className="flex justify-center mt-6 space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedProblemId(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteProblem}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 공개 성공 모달 */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  문제가 성공적으로 공개되었습니다!
                </h3>
                <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    🎉 축하합니다! 🎉
                    <br />
                    문제가 공개되어 다른 사용자들이 도전할 수 있습니다.
                  </p>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProblems;
