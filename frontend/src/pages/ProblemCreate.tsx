import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProblemCreateRequest, ExampleTestCase, TestCaseUrl } from '../types';
import { problemService } from '../services/problemService';
import { useToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownEditor from '../components/MarkdownEditor';

const ProblemCreate: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const { problemId: editProblemId } = useParams<{ problemId: string }>();
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(true);
  const [problemId, setProblemId] = useState<number | null>(null);
  const draftCreatedRef = useRef(false);
  const isEditMode = !!editProblemId;

  // Form state
  const [formData, setFormData] = useState<ProblemCreateRequest>({
    title: '',
    description: '',
    timeLimitSec: 1.0,
    memoryLimitMb: 256,
    exampleTestCases: [{ input: '', output: '' }],
    testCaseUrls: [],
  });

  // Create draft problem on component mount or load existing problem for edit
  useEffect(() => {
    if (draftCreatedRef.current) return;

    const initializeProblem = async () => {
      try {
        setDraftLoading(true);
        draftCreatedRef.current = true;

        if (isEditMode && editProblemId) {
          // Edit mode: load existing problem
          const problem = await problemService.getMyProblem(
            parseInt(editProblemId)
          );
          setProblemId(problem.problemId || null);
          setFormData({
            title: problem.title || '',
            description: problem.description || '',
            timeLimitSec: problem.timeLimit || 1.0,
            memoryLimitMb: problem.memoryLimit || 256,
            exampleTestCases: problem.exampleTestCases || [
              { input: '', output: '' },
            ],
            testCaseUrls: problem.testCaseUrls || [],
          });
        } else {
          // Create mode: create new draft
          const response = await problemService.createDraftProblem();
          setProblemId(response.problemId);
        }
      } catch (error) {
        toast.error(
          isEditMode
            ? '문제 로딩 중 오류가 발생했습니다.'
            : '초안 생성 중 오류가 발생했습니다.'
        );
        navigate('/create-problem');
        draftCreatedRef.current = false;
      } finally {
        setDraftLoading(false);
      }
    };

    initializeProblem();
  }, [navigate, toast, isEditMode, editProblemId]);

  const handleInputChange = (field: keyof ProblemCreateRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExampleTestCaseChange = (
    index: number,
    field: keyof ExampleTestCase,
    value: string
  ) => {
    const updatedCases = [...formData.exampleTestCases];
    updatedCases[index] = { ...updatedCases[index], [field]: value };
    handleInputChange('exampleTestCases', updatedCases);
  };

  const addExampleTestCase = () => {
    handleInputChange('exampleTestCases', [
      ...formData.exampleTestCases,
      { input: '', output: '' },
    ]);
  };

  const removeExampleTestCase = (index: number) => {
    if (formData.exampleTestCases.length > 1) {
      const updatedCases = formData.exampleTestCases.filter(
        (_, i) => i !== index
      );
      handleInputChange('exampleTestCases', updatedCases);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!problemId) {
      throw new Error('문제 초안이 아직 생성되지 않았습니다.');
    }

    // 임시로 파일의 ObjectURL을 반환 (실제로는 presigned URL로 업로드 후 실제 URL 반환)
    // TODO: presigned URL 방식으로 업로드 구현
    return new Promise((resolve) => {
      setTimeout(() => {
        const objectUrl = URL.createObjectURL(file);
        console.log(
          `이미지 업로드 for problemId: ${problemId}, fileName: ${file.name}`
        );
        resolve(objectUrl);
      }, 1000); // 1초 지연으로 업로드 시뮬레이션
    });
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!problemId) {
      toast.error('문제 초안이 생성되지 않았습니다.');
      return;
    }

    try {
      setLoading(true);
      await problemService.saveDraftProblem(problemId, formData);
      toast.success('임시 저장이 완료되었습니다!');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || '임시 저장 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (draftLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? '문제 수정' : '새 문제 만들기'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isEditMode
            ? '기존 문제의 내용을 수정하여 업데이트하세요.'
            : '새로운 프로그래밍 문제를 생성하여 다른 사용자들과 공유하세요.'}
        </p>
      </div>

      <form onSubmit={handleSaveDraft} className="space-y-8">
        {/* 기본 정보 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">기본 정보</h2>

          {/* 제목 */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              문제 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="문제 제목을 입력하세요"
              maxLength={100}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/100 글자
            </p>
          </div>

          {/* 시간 제한과 메모리 제한 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="timeLimit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                시간 제한 (초) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="timeLimit"
                value={formData.timeLimitSec}
                onChange={(e) =>
                  handleInputChange('timeLimitSec', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <div>
              <label
                htmlFor="memoryLimit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                메모리 제한 (MB) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="memoryLimit"
                value={formData.memoryLimitMb}
                onChange={(e) =>
                  handleInputChange('memoryLimitMb', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* 문제 설명 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">문제 설명</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (마크다운 형식) <span className="text-red-500">*</span>
            </label>
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              onImageUpload={handleImageUpload}
              placeholder={`
문제에 대한 자세한 설명을 작성하세요.

## 입력
입력에 대한 설명을 작성하세요.

## 출력
출력에 대한 설명을 작성하세요.

## 제한사항
- 제한사항을 나열하세요.

## 예제 설명
예제에 대한 추가 설명이 있다면 작성하세요.`}
              rows={20}
              className="focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
            />
          </div>
        </div>

        {/* 예제 테스트케이스 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              예제 테스트케이스
            </h2>
            <button
              type="button"
              onClick={addExampleTestCase}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              예제 추가
            </button>
          </div>

          <div className="space-y-6">
            {formData.exampleTestCases.map((testCase, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">
                    예제 {index + 1}
                  </h3>
                  {formData.exampleTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExampleTestCase(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      입력
                    </label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) =>
                        handleExampleTestCaseChange(
                          index,
                          'input',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                      rows={4}
                      placeholder="예제 입력..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      출력
                    </label>
                    <textarea
                      value={testCase.output}
                      onChange={(e) =>
                        handleExampleTestCaseChange(
                          index,
                          'output',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                      rows={4}
                      placeholder="예제 출력..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 테스트케이스 파일 업로드 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            채점 테스트케이스 <span className="text-red-500">*</span>
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                테스트케이스 파일 업로드
              </p>
              <p className="text-sm text-gray-500 mt-2">
                최소 10개 이상의 테스트케이스 파일이 필요합니다.
              </p>
              <p className="text-sm text-gray-500">
                현재 업로드된 파일: {formData.testCaseUrls.length}개
              </p>
            </div>
            <button
              type="button"
              className="mt-4 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              파일 선택
            </button>
          </div>
        </div>

        {/* 제출 버튼들 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/create-problem')}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            임시 저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemCreate;
