import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { submissionService } from '../services/submissionService';
import { useAsync } from '../hooks/useAsync';
import { useToastContext } from '../context/ToastContext';
import {
  SubmitResponse,
  SubmissionStatus,
  ProgressEvent,
  CompletedEvent,
} from '../types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import Editor from '@monaco-editor/react';

const ProblemDetail: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  // localStorage 키 생성 함수
  const getStorageKey = (key: string) => `problem-${problemId}-${key}`;

  // 언어별 기본 코드 템플릿
  const defaultCode = {
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 여기에 코드를 작성하세요
    }
}`,
    python: `def main():
    # 여기에 코드를 작성하세요

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
  const toast = useToastContext();

  const code = codeByLanguage[language];

  // 제출 상태별 스타일 및 텍스트
  const getStatusDisplay = (status: SubmissionStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          text: '대기 중',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '⏳',
        };
      case 'JUDGING':
        return {
          text: '채점 중',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: 'spinner',
        };
      case 'ACCEPTED':
        return {
          text: '정답',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: '✅',
        };
      case 'WRONG_ANSWER':
        return {
          text: '틀렸습니다',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: '❌',
        };
      case 'TIME_LIMIT_EXCEEDED':
        return {
          text: '시간 초과',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: '⏰',
        };
      case 'MEMORY_LIMIT_EXCEEDED':
        return {
          text: '메모리 초과',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          icon: '💾',
        };
      case 'RUNTIME_ERROR':
        return {
          text: '런타임 에러',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: '🚫',
        };
      case 'COMPILE_ERROR':
        return {
          text: '컴파일 에러',
          bgColor: 'bg-pink-100',
          textColor: 'text-pink-800',
          icon: '🔧',
        };
      case 'SERVER_ERROR':
        return {
          text: '서버 에러',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '⚠️',
        };
      default:
        return {
          text: '알 수 없음',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '❓',
        };
    }
  };

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
      const submission = await submissionService.submitCode(
        Number(problemId),
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

      toast.success('코드가 제출되었습니다!');
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
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="java">Java 21</option>
                <option value="python">Python 3</option>
              </select>
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
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">결과</h3>
            </div>

            {lastSubmission ? (
              <div className="space-y-4">
                {/* 제출 기본 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        제출 정보
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">제출 ID:</span> #
                          {lastSubmission.submissionId}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">제출자:</span>{' '}
                          {lastSubmission.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">제출 시간:</span>{' '}
                          {new Date(lastSubmission.submitTime).toLocaleString(
                            'ko-KR'
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        채점 결과
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          const statusDisplay = getStatusDisplay(
                            lastSubmission.submitStatus
                          );
                          return (
                            <div className="flex items-center space-x-2">
                              {statusDisplay.icon === 'spinner' ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <span className="text-lg">
                                  {statusDisplay.icon}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}
                              >
                                {statusDisplay.text}
                                {lastSubmission.submitStatus === 'JUDGING' &&
                                  progressEvent && (
                                    <span className="ml-1">
                                      {progressEvent.progressPercent}%
                                    </span>
                                  )}
                                {lastSubmission.submitStatus === 'PENDING' &&
                                  progressEvent && (
                                    <span className="ml-1">
                                      {progressEvent.progressPercent}%
                                    </span>
                                  )}
                              </span>
                            </div>
                          );
                        })()}

                        {lastSubmission.runtimeMs !== undefined && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">실행 시간:</span>{' '}
                            {lastSubmission.runtimeMs}ms
                          </p>
                        )}

                        {lastSubmission.memoryKb !== undefined && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">메모리 사용량:</span>{' '}
                            {lastSubmission.memoryKb}KB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
