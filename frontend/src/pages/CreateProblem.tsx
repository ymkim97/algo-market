import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { Problem, ProblemStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';

const CreateProblem: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const getStatusBadge = (status: ProblemStatus) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PUBLIC: 'bg-green-100 text-green-800 border-green-200',
    };

    const labels = {
      DRAFT: '초안',
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내가 만든 문제</h1>
            <p className="mt-2 text-gray-600">
              출제한 문제들을 관리하고 새로운 문제를 만들 수 있습니다.
            </p>
          </div>
          <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            새 문제 만들기
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {problems.length === 0 ? (
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
          <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            새 문제 만들기
          </button>
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
                              [초안] {problem.title}
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
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span>제출 수: {problem.submitCount}회</span>
                          {problem.timeLimit && (
                            <span>시간 제한: {problem.timeLimit}초</span>
                          )}
                          {problem.memoryLimit && (
                            <span>메모리 제한: {problem.memoryLimit}MB</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600 p-2">
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
                          </button>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            {problem.problemStatus === 'DRAFT'
                              ? '수정'
                              : '편집'}
                          </div>
                        </div>
                        {problem.problemStatus === 'DRAFT' && (
                          <div className="relative group">
                            <button className="text-gray-400 hover:text-green-600 p-2">
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
    </div>
  );
};

export default CreateProblem;
