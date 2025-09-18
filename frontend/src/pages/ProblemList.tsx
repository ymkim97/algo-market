import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { authService } from '../services/authService';
import { ProblemListResponse } from '../types';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import ProgressBar from '../components/ProgressBar';

const ITEMS_PER_PAGE = 10;

const ProblemList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // 백엔드 페이지는 0부터 시작

  const [problemResponse, setProblemResponse] =
    useState<ProblemListResponse | null>(null);
  const [loading, setLoading] = useState(true); // 초기 로딩 true로 시작
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = React.useCallback(
    async (page = currentPage) => {
      try {
        setError(null);
        setLoading(true);

        const isLoggedIn = authService.isAuthenticated();
        const data = isLoggedIn
          ? await problemService.getProblemsWithSolved(page, ITEMS_PER_PAGE)
          : await problemService.getProblems(page, ITEMS_PER_PAGE);

        setProblemResponse(data);
      } catch (err: any) {
        setError(err.message || '문제 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  // 페이지 변경 시 데이터 로드
  React.useEffect(() => {
    fetchProblems(currentPage);
  }, [currentPage, fetchProblems]);

  // 현재 페이지의 문제들 및 페이지 정보
  const totalPages = problemResponse?.page.totalPages || 0;
  const totalElements = problemResponse?.page.totalElements || 0;

  // 클라이언트 측 검색 필터링 (서버 검색 API가 없는 경우)
  const filteredProblems = useMemo(() => {
    const problems = problemResponse?.content || [];
    if (!searchQuery) return problems;

    return problems.filter((problem: any) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [problemResponse?.content, searchQuery]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', page);
    setCurrentPage(page);
  };

  // 검색이 변경되면 첫 페이지로
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">문제 목록</h1>
        <ErrorMessage
          message={error}
          onRetry={() => fetchProblems(currentPage)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 상단 로딩 바 */}
      <ProgressBar loading={loading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">문제 목록</h1>

        {/* 검색 */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색바 */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="문제 제목으로 검색..."
                />
              </div>
            </div>
          </div>

          {/* 검색 결과 정보 */}
          <div className="text-sm text-gray-500">
            총 {totalElements}개의 문제
            {searchQuery &&
              ` (검색: "${searchQuery}" - ${filteredProblems.length}개 결과)`}
            {totalPages > 1 && (
              <span>
                {' '}
                • 페이지 {currentPage + 1}/{totalPages}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProblems && filteredProblems.length > 0
              ? filteredProblems.map((problem: any, index: number) => (
                  <li key={`${problem.problemNumber}-${index}`}>
                    <Link
                      to={`/problems/${problem.problemNumber}`}
                      className="block px-4 py-4 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {problem.problemNumber}. {problem.title}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                          {problem.isSolved === true && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 text-xs font-semibold text-green-700">
                              해결
                            </span>
                          )}
                          {problem.isSolved === false && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-700">
                              미해결
                            </span>
                          )}
                          <div className="group relative inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            전체 제출 {problem.submitCount}회
                            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-10 hidden w-max -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition duration-150 group-hover:block group-hover:opacity-100">
                              모든 사용자의 제출 횟수
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              : // 로딩 중이 아닐 때만 "등록된 문제가 없습니다" 표시
                !loading && (
                  <li className="px-4 py-8 text-center text-gray-500">
                    등록된 문제가 없습니다.
                  </li>
                )}
          </ul>
        </div>

        {/* 페이지네이션 */}
        {totalElements > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(totalPages, 1)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemList;
