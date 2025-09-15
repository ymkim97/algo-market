import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
// import { submissionService } from '../services/submissionService'; // TODO: 실제 API 연동시 사용
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../hooks/useToast';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const ProblemDetail: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const {
    data: problem,
    loading,
    error,
    execute: refetch,
  } = useAsync(
    () => problemService.getProblem(Number(problemId)),
    [problemId],
    { immediate: true }
  );

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('코드를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // const submission = await submissionService.submitCode(
      //   Number(problemId),
      //   code,
      //   language
      // );
      // TODO: 실제 API 연동시 사용
      console.log('Submit code:', { problemId, code, language });
      toast.success('코드가 제출되었습니다!');
      // TODO: Navigate to submission progress page
    } catch (error: any) {
      toast.error(error.message || '코드 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        {/* 상단 로딩 바 */}
        <div className="fixed top-0 left-0 w-full h-1 bg-red-500 z-50">
          <div className="h-full bg-indigo-600 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage
          title="문제를 불러올 수 없습니다"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage
          title="문제를 찾을 수 없습니다"
          message="요청하신 문제가 존재하지 않습니다."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Description */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {problem.problemNumber}. {problem.title}
          </h1>

          <div className="mb-6">
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>시간 제한: {problem.timeLimit}초</span>
              <span>메모리 제한: {problem.memoryLimit}MB</span>
            </div>
          </div>

          {problem.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                문제 설명
              </h2>
              <div
                className="text-gray-700 prose prose-sm"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            </div>
          )}

          {problem.exampleTestCases && problem.exampleTestCases.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">예제</h2>
              {problem.exampleTestCases.map((example, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="mb-2">
                    <strong>입력 {index + 1}:</strong>
                    <pre className="mt-1 text-sm whitespace-pre-wrap">
                      {example.input}
                    </pre>
                  </div>
                  <div className="mb-2">
                    <strong>출력 {index + 1}:</strong>
                    <pre className="mt-1 text-sm whitespace-pre-wrap">
                      {example.output}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어 선택
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 작성
            </label>
            <textarea
              rows={15}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder="여기에 코드를 작성하세요..."
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                제출 중...
              </>
            ) : (
              '제출'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
