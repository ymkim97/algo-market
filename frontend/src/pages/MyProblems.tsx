import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { Problem, ProblemStatus } from '../types';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { useToastContext } from '../context/ToastContext';

const MyProblems: React.FC = () => {
  const { success, error: showError } = useToastContext();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadMyProblems(currentPage);
  }, [currentPage]);

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

  return (
    <div className="relative">
      <ProgressBar loading={loading} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                내가 만든 문제
              </h1>
              <p className="mt-2 text-gray-600">
                출제한 문제들을 관리하고 새로운 문제를 만들 수 있습니다.
              </p>
            </div>
            <Link
              to="/create-problem/new"
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              새 문제 만들기
            </Link>
          </div>
        </div>

        {/* 도움말 섹션 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                문제 공개 조건
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>문제를 공개하려면 다음 조건을 모두 만족해야 합니다:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>
                    출제자가 2가지 이상의 프로그래밍 언어로 문제를 해결해야 함
                  </li>
                  <li>테스트 데이터가 입출력 각각 최소 10개 이상 있어야 함</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {!loading && problems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 만든 문제가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">첫 번째 문제를 만들어 보세요!</p>
            <Link
              to="/create-problem/new"
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              새 문제 만들기
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-0">
                <div className="divide-y divide-gray-200">
                  {problems.map((problem, index) => (
                    <div key={index} className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            {problem.problemStatus === 'DRAFT' ? (
                              <span className="text-lg font-medium text-gray-700">
                                [임시 저장] {problem.title}
                              </span>
                            ) : (
                              <Link
                                to={`/problems/${problem.problemNumber}`}
                                className="text-lg font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                {problem.problemNumber}. {problem.title}
                              </Link>
                            )}
                            <div className="ml-3">
                              {problem.problemStatus &&
                                getStatusBadge(problem.problemStatus)}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1.5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                <span>{problem.submitCount}회 제출</span>
                              </div>
                              {problem.timeLimit && (
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1.5 text-gray-400"
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
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1.5 text-gray-400"
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
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1.5 text-gray-400"
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
                                  <span className="text-gray-600">
                                    {formatLastModified(problem.lastModified)}
                                  </span>
                                </div>
                              )}
                              {problem.problemStatus === 'DRAFT' && (
                                <div className="flex items-center">
                                  <svg
                                    className={`w-4 h-4 mr-1.5 ${
                                      problem.solvedLanguages &&
                                      problem.solvedLanguages.length >= 2
                                        ? 'text-green-500'
                                        : 'text-gray-400'
                                    }`}
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
                                  <span
                                    className={`font-medium ${
                                      problem.solvedLanguages &&
                                      problem.solvedLanguages.length >= 2
                                        ? 'text-green-600'
                                        : problem.solvedLanguages &&
                                            problem.solvedLanguages.length > 0
                                          ? 'text-yellow-600'
                                          : 'text-gray-500'
                                    }`}
                                  >
                                    해결 언어:{' '}
                                    {problem.solvedLanguages &&
                                    problem.solvedLanguages.length > 0
                                      ? problem.solvedLanguages
                                          .map((lang) => {
                                            const languageNames: Record<
                                              string,
                                              string
                                            > = {
                                              JAVA: 'Java',
                                              PYTHON: 'Python',
                                              JAVASCRIPT: 'JavaScript',
                                              CPP: 'C++',
                                              C: 'C',
                                            };
                                            return languageNames[lang] || lang;
                                          })
                                          .join(', ')
                                      : '없음'}
                                    {problem.solvedLanguages &&
                                      problem.solvedLanguages.length > 0 && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({problem.solvedLanguages.length}/2)
                                        </span>
                                      )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          {problem.problemStatus === 'DRAFT' && (
                            <div className="relative group">
                              <Link
                                to={`/create-problem/edit/${problem.problemId}`}
                                className="text-gray-400 hover:text-gray-600 p-2 block"
                              >
                                <svg
                                  className="w-5 h-5"
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
                              </Link>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                수정
                              </div>
                            </div>
                          )}
                          {problem.problemStatus === 'DRAFT' && (
                            <>
                              <div className="relative group">
                                <Link
                                  to={`/problems/draft/${problem.problemId}`}
                                  className="text-gray-400 hover:text-blue-600 p-2 block"
                                >
                                  <svg
                                    className="w-5 h-5"
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
                                </Link>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  문제 풀기
                                </div>
                              </div>
                              <div className="relative group">
                                <button
                                  onClick={() =>
                                    problem.problemId &&
                                    showPublishConfirm(problem.problemId)
                                  }
                                  className="text-gray-400 hover:text-green-600 p-2"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  공개
                                </div>
                              </div>
                              <div className="relative group">
                                <button
                                  onClick={() =>
                                    problem.problemId &&
                                    showDeleteConfirm(problem.problemId)
                                  }
                                  className="text-gray-400 hover:text-red-600 p-2"
                                >
                                  <svg
                                    className="w-5 h-5"
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
                                </button>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  삭제
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

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
