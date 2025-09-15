import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
// import { submissionService } from '../services/submissionService'; // TODO: 실제 API 연동시 사용
import { useAsync } from '../hooks/useAsync';
import { useToastContext } from '../context/ToastContext';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';

const ProblemDetail: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToastContext();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다!');
    } catch (error) {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('클립보드에 복사되었습니다!');
    }
  };

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
        <ProgressBar loading={loading} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">문제를 불러오는 중...</div>
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
            <div className="mt-8">
              {problem.exampleTestCases.map((example, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold text-indigo-700 mb-4">
                    예제 {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          입력
                        </span>
                        <button
                          onClick={() => copyToClipboard(example.input)}
                          className="inline-flex items-center px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="클립보드에 복사"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          복사
                        </button>
                      </div>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
                        <pre className="whitespace-pre-wrap">
                          {example.input}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          출력
                        </span>
                      </div>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
                        <pre className="whitespace-pre-wrap">
                          {example.output}
                        </pre>
                      </div>
                    </div>
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
