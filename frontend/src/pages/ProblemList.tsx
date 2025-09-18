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

        {filteredProblems && filteredProblems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProblems.map((problem: any, index: number) => (
              <Link
                key={`${problem.problemNumber}-${index}`}
                to={`/problems/${problem.problemNumber}`}
                className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                      문제 {problem.problemNumber}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-indigo-600">
                      {problem.title}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {problem.isSolved === true && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        해결됨
                      </span>
                    )}
                    {problem.isSolved === false && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        미해결
                      </span>
                    )}
                    <div className="group/tooltip relative inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      전체 제출 {problem.submitCount}회
                      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-10 hidden w-max -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition duration-150 group-hover/tooltip:block group-hover/tooltip:opacity-100">
                        모든 사용자의 전체 제출 횟수
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-1 items-end justify-between text-xs text-slate-500">
                  <span>자세히 보기 →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-gray-500">
              등록된 문제가 없습니다.
            </div>
          )
        )}

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
