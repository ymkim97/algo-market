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
  const [testCaseUploading, setTestCaseUploading] = useState(false);
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [outputFiles, setOutputFiles] = useState<File[]>([]);
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

    try {
      const imageUrl = await problemService.uploadImage(file, problemId);
      return imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  // 중복 파일명 체크 함수
  const checkDuplicateFiles = (
    newFiles: File[],
    existingFiles: File[] = []
  ) => {
    const duplicates: string[] = [];
    const existingNames = existingFiles.map((f) => f.name);

    newFiles.forEach((file) => {
      if (existingNames.includes(file.name)) {
        duplicates.push(file.name);
      }
    });

    // 기존 업로드된 파일들과도 중복 체크
    const uploadedFileNames: string[] = [];
    formData.testCaseUrls.forEach((testCase) => {
      const inputFileName = testCase.input?.split('/').pop();
      const outputFileName = testCase.output?.split('/').pop();
      if (inputFileName) uploadedFileNames.push(inputFileName);
      if (outputFileName) uploadedFileNames.push(outputFileName);
    });

    newFiles.forEach((file) => {
      if (uploadedFileNames.includes(file.name)) {
        duplicates.push(file.name);
      }
    });

    return Array.from(new Set(duplicates)); // 중복 제거
  };

  // 입력 파일 선택 핸들러
  const handleInputFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const duplicates = checkDuplicateFiles(newFiles, outputFiles);

      if (duplicates.length > 0) {
        toast.error(`중복된 파일명이 있습니다: ${duplicates.join(', ')}`);
        event.target.value = '';
        return;
      }

      setInputFiles(newFiles);
    }
    event.target.value = '';
  };

  // 출력 파일 선택 핸들러
  const handleOutputFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const duplicates = checkDuplicateFiles(newFiles, inputFiles);

      if (duplicates.length > 0) {
        toast.error(`중복된 파일명이 있습니다: ${duplicates.join(', ')}`);
        event.target.value = '';
        return;
      }

      setOutputFiles(newFiles);
    }
    event.target.value = '';
  };

  // 테스트케이스 쌍 업로드 핸들러
  const handleTestCasePairUpload = async () => {
    if (!problemId) {
      toast.error('문제 초안이 아직 생성되지 않았습니다.');
      return;
    }

    if (inputFiles.length === 0 || outputFiles.length === 0) {
      toast.error('입력 파일과 출력 파일을 모두 선택해주세요.');
      return;
    }

    if (inputFiles.length !== outputFiles.length) {
      toast.error('입력 파일과 출력 파일의 개수가 일치해야 합니다.');
      return;
    }

    setTestCaseUploading(true);

    try {
      const newTestCases: TestCaseUrl[] = [];

      for (let i = 0; i < inputFiles.length; i++) {
        const inputFile = inputFiles[i];
        const outputFile = outputFiles[i];

        // 입력 파일 업로드
        const inputUrl = await problemService.uploadTestCase(
          inputFile,
          problemId
        );
        // 출력 파일 업로드
        const outputUrl = await problemService.uploadTestCase(
          outputFile,
          problemId
        );

        newTestCases.push({
          input: inputUrl,
          output: outputUrl,
        });
      }

      // Update testCaseUrls in formData
      const updatedTestCaseUrls = [...formData.testCaseUrls, ...newTestCases];
      handleInputChange('testCaseUrls', updatedTestCaseUrls);

      toast.success(
        `${inputFiles.length}쌍의 테스트케이스가 업로드되었습니다.`
      );

      // 파일 목록 초기화
      setInputFiles([]);
      setOutputFiles([]);
    } catch (error: any) {
      console.error('Test case upload failed:', error);
      toast.error(
        error.message || '테스트케이스 업로드 중 오류가 발생했습니다.'
      );
    } finally {
      setTestCaseUploading(false);
    }
  };

  // 테스트케이스 쌍 삭제 핸들러
  const removeTestCasePair = (index: number) => {
    const updatedTestCases = formData.testCaseUrls.filter(
      (_, i) => i !== index
    );
    handleInputChange('testCaseUrls', updatedTestCases);
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

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              입력 파일과 출력 파일을 쌍으로 업로드해주세요. 파일명은 매칭
              순서대로 배치됩니다.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 입력 파일은 .in 확장자, 출력 파일은 .out 확장자를 사용하세요.
            </p>
          </div>

          {/* 파일 업로드 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 입력 파일 업로드 */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-blue-400"
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
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  입력 파일
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {inputFiles.length}개 선택됨
                </p>
                <input
                  type="file"
                  accept=".txt,.in"
                  onChange={handleInputFileSelect}
                  className="hidden"
                  id="input-file-upload"
                  multiple
                />
                <label
                  htmlFor="input-file-upload"
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer inline-block"
                >
                  입력 파일 선택
                </label>
              </div>
            </div>

            {/* 출력 파일 업로드 */}
            <div className="border-2 border-dashed border-green-300 rounded-lg p-6">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-green-400"
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
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  출력 파일
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {outputFiles.length}개 선택됨
                </p>
                <input
                  type="file"
                  accept=".txt,.out"
                  onChange={handleOutputFileSelect}
                  className="hidden"
                  id="output-file-upload"
                  multiple
                />
                <label
                  htmlFor="output-file-upload"
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 cursor-pointer inline-block"
                >
                  출력 파일 선택
                </label>
              </div>
            </div>
          </div>

          {/* 선택된 파일 목록 */}
          {(inputFiles.length > 0 || outputFiles.length > 0) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                선택된 파일 목록
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-blue-700 mb-2">
                    입력 파일 ({inputFiles.length}개)
                  </h4>
                  <div className="space-y-1">
                    {inputFiles.map((file, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {index + 1}. {file.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-green-700 mb-2">
                    출력 파일 ({outputFiles.length}개)
                  </h4>
                  <div className="space-y-1">
                    {outputFiles.map((file, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {index + 1}. {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={handleTestCasePairUpload}
              disabled={
                testCaseUploading ||
                inputFiles.length === 0 ||
                outputFiles.length === 0
              }
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                testCaseUploading ||
                inputFiles.length === 0 ||
                outputFiles.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {testCaseUploading ? (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  업로드 중...
                </div>
              ) : (
                '테스트케이스 업로드'
              )}
            </button>
          </div>

          {/* 업로드된 테스트케이스 쌍 목록 */}
          {formData.testCaseUrls.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  업로드된 테스트케이스 ({formData.testCaseUrls.length}쌍)
                </h3>
                <span className="text-xs text-gray-500">
                  문제 공개를 위해서는 최소 10쌍이상이 필요합니다.
                </span>
              </div>
              <div className="space-y-3">
                {formData.testCaseUrls.map((testCase, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700">
                        #{index + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="flex items-center">
                          <span className="text-xs text-blue-600 font-medium mr-2">
                            입력:
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {testCase.input?.split('/').pop() || '파일명 없음'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-green-600 font-medium mr-2">
                            출력:
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {testCase.output?.split('/').pop() || '파일명 없음'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestCasePair(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
