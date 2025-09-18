import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { submissionService } from '../services/submissionService';
import { useAsync } from '../hooks/useAsync';
import { useToastContext } from '../context/ToastContext';
import {
  SubmissionHistoryForProblem,
  SubmitResponse,
  SubmissionStatus,
  ProgressEvent,
  CompletedEvent,
} from '../types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import Editor from '@monaco-editor/react';
import SubmissionHistoryList from '../components/SubmissionHistoryList';
import { getSubmissionStatusMeta } from '../utils/submissionStatus';
import { authService } from '../services/authService';

const HISTORY_PAGE_SIZE = 10;

const ProblemDetail: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const location = useLocation();
  const isDraftMode = location.pathname.includes('/problems/draft/');
  const [actualProblemId, setActualProblemId] = useState<number | null>(null);
  // localStorage 키 생성 함수
  const getStorageKey = (key: string) => `problem-${problemId}-${key}`;

  // 언어별 기본 코드 템플릿
  const defaultCode = {
    java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        
        System.out.println(input);
    }
}`,
    python: `def main():
    print("Hello World!")

if __name__ == "__main__":
    main()`,
  };

  // 저장된 상태 불러오기
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('language'));
    return saved || 'java';
  });

  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(
    () => {
      const savedJava = localStorage.getItem(getStorageKey('code-java'));
      const savedPython = localStorage.getItem(getStorageKey('code-python'));
      return {
        java: savedJava || defaultCode.java,
        python: savedPython || defaultCode.python,
      };
    }
  );

  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<SubmitResponse | null>(
    null
  );
  const [progressEvent, setProgressEvent] = useState<ProgressEvent | null>(
    null
  );
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('problem-detail-left-panel-width');
    return saved ? parseFloat(saved) : 50;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [topPanelHeight, setTopPanelHeight] = useState(() => {
    const saved = localStorage.getItem('problem-detail-top-panel-height');
    return saved ? parseFloat(saved) : 60;
  });
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const toast = useToastContext();

  const code = codeByLanguage[language];
  const [activeResultTab, setActiveResultTab] = useState<'result' | 'history'>(
    'result'
  );
  const [historySubmissions, setHistorySubmissions] = useState<
    SubmissionHistoryForProblem[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const historyRequestPageRef = React.useRef(0);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<
    number | null
  >(null);
  const [historyRequiresLogin, setHistoryRequiresLogin] = useState(false);

  const loadHistory = React.useCallback(
    async (pageToLoad: number) => {
      if (historyLoading) {
        return;
      }

      if (!authService.isAuthenticated()) {
        setHistoryRequiresLogin(true);
        return;
      }

      historyRequestPageRef.current = pageToLoad;

      const fallbackProblemId = Number(problemId);
      const targetProblemId = actualProblemId ?? fallbackProblemId;

      if (!targetProblemId || Number.isNaN(targetProblemId)) {
        return;
      }

      setHistoryRequiresLogin(false);
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const pageResult = await submissionService.getProblemSubmissions(
          targetProblemId,
          pageToLoad,
          HISTORY_PAGE_SIZE
        );

        setExpandedSubmissionId(null);
        setHistorySubmissions(pageResult.content);
        setHistoryPage(pageResult.page.number);
        setHistoryTotalPages(pageResult.page.totalPages);
        historyRequestPageRef.current = pageResult.page.number;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          '제출 기록을 불러오는 중 오류가 발생했습니다.';
        setHistoryError(message);
      } finally {
        setHistoryLoading(false);
      }
    },
    [actualProblemId, problemId, historyLoading]
  );

  const handleResultTabSelect = React.useCallback(() => {
    setActiveResultTab('result');
    setExpandedSubmissionId(null);
    setHistoryRequiresLogin(false);
  }, []);

  const handleHistoryTabSelect = React.useCallback(() => {
    setActiveResultTab('history');
    setExpandedSubmissionId(null);
    setHistorySubmissions([]);
    setHistoryPage(0);
    setHistoryTotalPages(0);
    setHistoryError(null);
    historyRequestPageRef.current = 0;

    if (!authService.isAuthenticated()) {
      setHistoryRequiresLogin(true);
      return;
    }

    setHistoryRequiresLogin(false);
    loadHistory(0);
  }, [loadHistory]);

  React.useEffect(() => {
    setHistorySubmissions([]);
    setHistoryPage(0);
    setHistoryTotalPages(0);
    setHistoryError(null);
    historyRequestPageRef.current = 0;
    setExpandedSubmissionId(null);
    setHistoryRequiresLogin(false);
  }, [actualProblemId, problemId]);

  // 코드 변경 핸들러
  const handleCodeChange = (newCode: string) => {
    const newCodeByLanguage = { ...codeByLanguage, [language]: newCode };
    setCodeByLanguage(newCodeByLanguage);
    localStorage.setItem(getStorageKey(`code-${language}`), newCode);
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem(getStorageKey('language'), newLanguage);
  };

  // 코드 초기화 핸들러
  const handleResetCode = () => {
    setShowResetModal(true);
  };

  // 코드 초기화 확인 핸들러
  const confirmResetCode = () => {
    const resetCode = defaultCode[language as keyof typeof defaultCode];
    const newCodeByLanguage = { ...codeByLanguage, [language]: resetCode };
    setCodeByLanguage(newCodeByLanguage);
    localStorage.setItem(getStorageKey(`code-${language}`), resetCode);
    setShowResetModal(false);
    toast.success('코드가 초기화되었습니다.');
  };

  // SSE 연결 시작
  const startProgressEventSource = (submissionId: number) => {
    // 기존 연결이 있으면 닫기
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource =
      submissionService.createProgressEventSource(submissionId);

    newEventSource.onopen = (event) => {
      console.log('SSE connection opened:', event);
    };

    // 커스텀 이벤트명 'progress'로 리스닝
    newEventSource.addEventListener('progress', (event: any) => {
      try {
        console.log('SSE Raw data:', event.data);
        const progress: ProgressEvent = JSON.parse(event.data);
        console.log('SSE Parsed progress:', progress);
        setProgressEvent(progress);

        // 진행 중에도 성능 정보가 있으면 업데이트
        if (
          progress.runtimeMs !== undefined ||
          progress.memoryKb !== undefined
        ) {
          setLastSubmission((prev) =>
            prev
              ? {
                  ...prev,
                  runtimeMs: progress.runtimeMs ?? prev.runtimeMs,
                  memoryKb: progress.memoryKb ?? prev.memoryKb,
                }
              : null
          );
        }

        // 채점이 완료되면 submission 상태도 업데이트 (성능 정보 포함)
        if (
          progress.submitStatus !== 'PENDING' &&
          progress.submitStatus !== 'JUDGING'
        ) {
          console.log('Updating submission status to:', progress.submitStatus);
          setLastSubmission((prev) =>
            prev
              ? {
                  ...prev,
                  submitStatus: progress.submitStatus,
                  // 성능 정보 업데이트 (있으면 업데이트, 없으면 기존 값 유지)
                  runtimeMs: progress.runtimeMs ?? prev.runtimeMs,
                  memoryKb: progress.memoryKb ?? prev.memoryKb,
                }
              : null
          );

          // progress 이벤트로 완료된 경우는 연결을 유지하여 completed 이벤트를 기다림
          // 단, 에러 상태인 경우에만 연결 종료
          if (
            ['COMPILE_ERROR', 'RUNTIME_ERROR', 'SERVER_ERROR'].includes(
              progress.submitStatus
            )
          ) {
            newEventSource.close();
            setEventSource(null);
          }
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    });

    // 완료 이벤트 리스닝
    newEventSource.addEventListener('completed', (event: any) => {
      try {
        console.log('SSE Completed data:', event.data);
        const completed: CompletedEvent = JSON.parse(event.data);
        console.log('SSE Parsed completed:', completed);

        // 최종 결과로 submission 상태 업데이트 (성능 정보는 그대로 유지)
        setLastSubmission((prev) =>
          prev
            ? {
                ...prev,
                submitStatus: completed.finalStatus,
                // 성능 정보는 그대로 유지
                runtimeMs: prev.runtimeMs,
                memoryKb: prev.memoryKb,
              }
            : null
        );

        // 연결 종료
        newEventSource.close();
        setEventSource(null);
      } catch (error) {
        console.error('Error parsing completed SSE data:', error);
      }
    });

    newEventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      console.log('EventSource readyState:', newEventSource.readyState);
      console.log('EventSource URL:', newEventSource.url);
      newEventSource.close();
      setEventSource(null);
    };

    setEventSource(newEventSource);
  };

  // 컴포넌트 언마운트 시 SSE 연결 정리
  React.useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  // 수평 패널 리사이즈 핸들러
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();

      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100; // 컨테이너 좌우 패딩 제거로 0 기준 계산

      if (newWidth >= 20 && newWidth <= 80) {
        setLeftPanelWidth(newWidth);
        localStorage.setItem(
          'problem-detail-left-panel-width',
          newWidth.toString()
        );
      }
    },
    [isResizing]
  );

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // 수직 패널 리사이즈 핸들러
  const handleVerticalMouseDown = () => {
    setIsVerticalResizing(true);
  };

  const handleVerticalMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isVerticalResizing) return;
      e.preventDefault();

      const containerHeight = window.innerHeight - 80; // 헤더 높이 제외
      const newHeight = ((e.clientY - 80) / containerHeight) * 100; // 상단 오프셋 고려

      if (newHeight >= 30 && newHeight <= 80) {
        setTopPanelHeight(newHeight);
        localStorage.setItem(
          'problem-detail-top-panel-height',
          newHeight.toString()
        );
      }
    },
    [isVerticalResizing]
  );

  const handleVerticalMouseUp = () => {
    setIsVerticalResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove]);

  React.useEffect(() => {
    if (isVerticalResizing) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isVerticalResizing, handleVerticalMouseMove]);

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
    async () => {
      const result = isDraftMode
        ? await problemService.getMyProblem(Number(problemId))
        : await problemService.getProblem(Number(problemId));

      // 실제 problemId 저장
      if (result && result.problemId) {
        setActualProblemId(result.problemId);
      }

      return result;
    },
    [problemId, isDraftMode],
    { immediate: true }
  );

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('코드를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const submission = await submissionService.submitCode(
        actualProblemId || Number(problemId),
        code,
        language.toUpperCase()
      );
      setLastSubmission(submission);
      setProgressEvent(null); // 이전 진행률 초기화

      // SSE 연결 시작 (PENDING이나 JUDGING 상태일 때만)
      if (
        submission.submitStatus === 'PENDING' ||
        submission.submitStatus === 'JUDGING'
      ) {
        startProgressEventSource(submission.submissionId);
      }

      if (activeResultTab === 'history') {
        loadHistory(0);
      } else {
        setHistorySubmissions([]);
        setHistoryPage(0);
        setHistoryTotalPages(0);
        setHistoryError(null);
        historyRequestPageRef.current = 0;
      }

      toast.success('코드가 제출되었습니다!');
    } catch (error: any) {
      console.error('Submit error:', error);

      // 서버에서 보내는 에러 메시지 추출
      let errorMessage = '코드 제출 중 오류가 발생했습니다.';

      if (error?.response?.data?.detail) {
        // Spring Boot의 detail 필드 (주요 에러 메시지)
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        // message 필드
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // 일반적인 에러 메시지
        errorMessage = error.message;
      }

      toast.error(errorMessage);
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
    <div className="w-full px-0 py-2">
      <div className="flex h-[calc(100vh-5rem)] gap-1">
        {/* Problem Description */}
        <div
          className="bg-white shadow sm:rounded-lg p-6 overflow-y-auto"
          style={{ width: `${leftPanelWidth}%` }}
        >
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
                className="text-gray-700 prose prose-sm max-w-full break-words"
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

        {/* Resize Handle */}
        <div
          className={`w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center ${
            isResizing ? 'bg-indigo-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="w-0.5 h-8 bg-white rounded opacity-50"></div>
        </div>

        {/* Right Panel - Code Editor and Bottom Panel */}
        <div
          className="flex flex-col gap-1"
          style={{ width: `${100 - leftPanelWidth}%`, overflowY: 'scroll' }}
        >
          {/* Code Editor Panel */}
          <div
            className="bg-white shadow sm:rounded-lg p-6 flex flex-col"
            style={{ height: `${topPanelHeight}%`, overflowY: 'scroll' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <label className="block text-lg font-semibold text-gray-900">
                  코드 작성
                </label>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-indigo-600 text-white py-1.5 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium"
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
              <div className="flex items-center space-x-2">
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="java">Java 21</option>
                  <option value="python">Python 3</option>
                </select>
                <button
                  onClick={handleResetCode}
                  className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  title="코드를 기본 템플릿으로 초기화"
                >
                  초기화
                </button>
              </div>
            </div>
            <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <Editor
                height="100%"
                language={language === 'java' ? 'java' : 'python'}
                value={code}
                onChange={(value) => handleCodeChange(value || '')}
                theme="vs-dark"
                loading={
                  <div className="flex items-center justify-center h-96 bg-gray-900 text-white">
                    <LoadingSpinner size="md" className="mr-2" />
                    에디터 로딩 중...
                  </div>
                }
                options={{
                  fontSize: 14,
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  folding: true,
                  selectOnLineNumbers: true,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                }}
              />
            </div>
          </div>

          {/* Vertical Resize Handle */}
          <div
            className={`h-1 bg-gray-300 hover:bg-gray-400 cursor-row-resize flex items-center justify-center ${
              isVerticalResizing ? 'bg-indigo-500' : ''
            }`}
            onMouseDown={handleVerticalMouseDown}
          >
            <div className="h-0.5 w-8 bg-white rounded opacity-50"></div>
          </div>

          {/* Bottom Panel */}
          <div
            className="bg-white shadow sm:rounded-lg p-6 overflow-y-auto"
            style={{ height: `${100 - topPanelHeight}%` }}
          >
            <div className="mb-4 border-b border-gray-200">
              <nav
                className="-mb-px flex space-x-4"
                aria-label="결과 및 제출 내역"
              >
                <button
                  type="button"
                  onClick={handleResultTabSelect}
                  className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
                    activeResultTab === 'result'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  결과
                </button>
                <button
                  type="button"
                  onClick={handleHistoryTabSelect}
                  className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
                    activeResultTab === 'history'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  내 제출
                </button>
              </nav>
            </div>

            {activeResultTab === 'result' ? (
              lastSubmission ? (
                <div className="space-y-4">
                  {/* 채점 상태 카드 */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                            <svg
                              className="w-5 h-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              채점 결과
                            </h4>
                            <p className="text-sm text-gray-500">
                              코드 실행 결과
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            제출 ID: #{lastSubmission.submissionId} | 제출자:{' '}
                            {lastSubmission.username}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {(() => {
                        const statusMeta = getSubmissionStatusMeta(
                          lastSubmission.submitStatus
                        );
                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {statusMeta.icon === 'spinner' ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <span className="text-2xl">
                                  {statusMeta.icon}
                                </span>
                              )}
                              <div>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusMeta.bgColor} ${statusMeta.textColor}`}
                                >
                                  {statusMeta.text}
                                  {(lastSubmission.submitStatus === 'JUDGING' ||
                                    lastSubmission.submitStatus ===
                                      'PENDING') &&
                                    progressEvent && (
                                      <span className="ml-2 font-bold">
                                        {progressEvent.progressPercent}%
                                      </span>
                                    )}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">제출 시간</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(
                                  lastSubmission.submitTime
                                ).toLocaleString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 성능 정보 카드 */}
                  {(lastSubmission.runtimeMs !== undefined ||
                    lastSubmission.memoryKb !== undefined) && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              성능 정보
                            </h4>
                            <p className="text-sm text-gray-500">
                              실행 시간 및 메모리 사용량
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {lastSubmission.runtimeMs !== undefined && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-xs font-medium text-blue-700">
                                  실행 시간
                                </span>
                              </div>
                              <p className="mt-1 text-lg font-bold text-blue-900">
                                {lastSubmission.runtimeMs}ms
                              </p>
                            </div>
                          )}
                          {lastSubmission.memoryKb !== undefined && (
                            <div className="bg-purple-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                  />
                                </svg>
                                <span className="text-xs font-medium text-purple-700">
                                  메모리
                                </span>
                              </div>
                              <p className="mt-1 text-lg font-bold text-purple-900">
                                {lastSubmission.memoryKb}KB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 에러 상태일 때 추가 정보 */}
                  {(
                    ['COMPILE_ERROR', 'RUNTIME_ERROR'] as SubmissionStatus[]
                  ).includes(lastSubmission.submitStatus) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-red-700 mb-2">
                        {lastSubmission.submitStatus === 'COMPILE_ERROR'
                          ? '컴파일 오류'
                          : '런타임 오류'}
                      </h5>
                      <p className="text-sm text-red-600">
                        {lastSubmission.submitStatus === 'COMPILE_ERROR'
                          ? '코드를 컴파일하는 중에 오류가 발생했습니다. 문법을 다시 확인해보세요.'
                          : '코드 실행 중에 오류가 발생했습니다. 런타임 에러를 확인해보세요.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  코드를 제출하면 여기에 결과가 표시됩니다.
                </div>
              )
            ) : historyRequiresLogin ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <p className="text-sm text-gray-600">
                  제출 기록은 로그인 후에 확인할 수 있습니다.
                </p>
                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  로그인 하러 가기
                </Link>
              </div>
            ) : (
              <SubmissionHistoryList
                submissions={historySubmissions}
                loading={historyLoading}
                error={historyError}
                onRetry={() => loadHistory(historyRequestPageRef.current)}
                currentPage={historyPage}
                totalPages={historyTotalPages}
                onPageChange={(page) => loadHistory(page)}
                selectedSubmissionId={lastSubmission?.submissionId ?? null}
                expandedSubmissionId={expandedSubmissionId}
                onToggleExpand={setExpandedSubmissionId}
              />
            )}
          </div>
        </div>
      </div>

      {/* 코드 초기화 확인 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  코드 초기화
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    현재 작성한 모든 코드가 삭제되고 기본 템플릿으로
                    초기화됩니다.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 px-4 py-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmResetCode}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;
