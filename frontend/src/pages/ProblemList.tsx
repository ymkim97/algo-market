import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// import { problemService } from '../services/problemService'; // TODO: 실제 API 연동시 사용
import { useAsync } from '../hooks/useAsync';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const ProblemList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: allProblems,
    loading,
    error,
    execute: refetch,
  } = useAsync(
    () => import('../data/mockData').then((m) => m.getMockProblems()),
    [],
    { immediate: true }
  );

  // 모든 태그 추출
  const allTags = useMemo(() => {
    if (!allProblems) return [];
    const tags = new Set<string>();
    allProblems.forEach((problem) => {
      problem.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allProblems]);

  // 검색 및 필터링된 문제들
  const filteredProblems = useMemo(() => {
    if (!allProblems) return [];

    return allProblems.filter((problem) => {
      const matchesSearch =
        searchQuery === '' ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === '' || problem.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [allProblems, searchQuery, selectedTag]);

  // 페이지네이션된 문제들
  const { problems, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      problems: filteredProblems.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredProblems.length / ITEMS_PER_PAGE),
    };
  }, [filteredProblems, currentPage]);

  // 검색이나 필터가 변경되면 첫 페이지로
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">문제 목록</h1>
        <LoadingSkeleton type="list" lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">문제 목록</h1>
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">문제 목록</h1>

      {/* 검색 및 필터 */}
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
                placeholder="문제 제목이나 설명으로 검색..."
              />
            </div>
          </div>

          {/* 태그 필터 */}
          <div className="sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="">모든 태그</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 검색 결과 정보 */}
        <div className="text-sm text-gray-500">
          총 {filteredProblems.length}개의 문제
          {searchQuery && ` (검색: "${searchQuery}")`}
          {selectedTag && ` (태그: "${selectedTag}")`}
          {filteredProblems.length > ITEMS_PER_PAGE && (
            <span>
              {' '}
              • 페이지 {currentPage}/{totalPages}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {problems && problems.length > 0 ? (
            problems.map((problem) => (
              <li key={problem.id}>
                <Link
                  to={`/problems/${problem.id}`}
                  className="block px-4 py-4 sm:px-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {problem.id}. {problem.title}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      {problem.tags &&
                        problem.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        시간 제한: {problem.timeLimit}초 | 메모리 제한:{' '}
                        {problem.memoryLimit}MB
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        정답률:{' '}
                        {problem.correctCount > 0
                          ? Math.round(
                              (problem.correctCount / problem.submitCount) * 100
                            )
                          : 0}
                        % ({problem.correctCount}명 해결)
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              등록된 문제가 없습니다.
            </li>
          )}
        </ul>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ProblemList;
