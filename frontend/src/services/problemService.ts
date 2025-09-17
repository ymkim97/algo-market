import {
  Problem,
  ProblemListResponse,
  ProblemCreateRequest,
  InitiateUploadRequest,
  InitiateUploadResponse,
} from '../types';
import api from './api';

export const problemService = {
  // Get all problems with pagination
  getProblems: async (
    page: number = 0,
    size: number = 20
  ): Promise<ProblemListResponse> => {
    const response = await api.get<ProblemListResponse>(
      `/problems?page=${page}&size=${size}`
    );
    return response;
  },

  // Get problem by problemNumber
  getProblem: async (problemNumber: number): Promise<Problem> => {
    const response = await api.get<Problem>(`/problems/${problemNumber}`);
    return response;
  },

  // Search problems (백엔드에서 지원하는 경우)
  searchProblems: async (
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProblemListResponse> => {
    const response = await api.get<ProblemListResponse>(
      `/problems/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response;
  },

  // Get my problems (problems created by the current user)
  getMyProblems: async (page: number = 0): Promise<ProblemListResponse> => {
    const response = await api.get<ProblemListResponse>(
      `/problems/my?page=${page}&size=10`
    );
    return response;
  },

  // Create a new problem
  createProblem: async (
    problemData: ProblemCreateRequest
  ): Promise<Problem> => {
    const response = await api.post<Problem>('/problems', problemData);
    return response;
  },

  // Create a draft problem (minimal info, returns problemId)
  createDraftProblem: async (): Promise<{ problemId: number }> => {
    const response = await api.post<{ problemId: number }>('/problems', {
      title: null,
      description: '',
      timeLimitSec: 1.0,
      memoryLimitMb: 256,
      exampleTestCases: [],
      testCaseUrls: [],
    });
    return response;
  },

  // Save draft problem
  saveDraftProblem: async (
    problemId: number,
    problemData: ProblemCreateRequest
  ): Promise<Problem> => {
    const response = await api.put<Problem>('/problems/draft', {
      problemId,
      ...problemData,
    });
    return response;
  },

  // Get my problem for editing
  getMyProblem: async (problemId: number): Promise<Problem> => {
    const response = await api.get<Problem>(`/problems/my/${problemId}`);
    return response;
  },

  // Image upload functions
  initiateUpload: async (
    request: InitiateUploadRequest
  ): Promise<InitiateUploadResponse> => {
    const response = await api.post<InitiateUploadResponse>(
      '/problems/initiate-upload',
      request
    );
    return response;
  },

  uploadImage: async (file: File, problemId: number): Promise<string> => {
    // Get presigned URL
    const fileSizeKiloBytes = Math.ceil(file.size / 1024);
    const uploadResponse = await problemService.initiateUpload({
      originalFileName: file.name,
      fileSizeKiloBytes,
      problemId,
    });

    // Upload to presigned URL
    const uploadResult = await fetch(uploadResponse.presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'x-amz-meta-originalfilename': file.name,
        'x-amz-meta-filesizekilobytes': fileSizeKiloBytes.toString(),
        'x-amz-meta-problemid': problemId.toString(),
      },
      mode: 'cors',
    });

    if (!uploadResult.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    // Extract path from presigned URL and combine with base URL
    const presignedUrl = new URL(uploadResponse.presignedUrl);
    const imagePath = presignedUrl.pathname; // e.g., "/problems/1/images/f5aede3f-ff72-4bfb-be96-61517216eb85-data.svg"
    const finalImageUrl = `https://storage.algomarket.site${imagePath}`;

    return finalImageUrl;
  },

  // Test case upload function
  uploadTestCase: async (file: File, problemId: number): Promise<string> => {
    try {
      // Get presigned URL for test case
      const fileSizeKiloBytes = Math.ceil(file.size / 1024);
      console.log('Test case file info:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeKB: fileSizeKiloBytes,
      });

      const uploadResponse = await problemService.initiateUpload({
        originalFileName: file.name,
        fileSizeKiloBytes,
        problemId,
      });

      console.log('Test case presigned URL response:', uploadResponse);

      // Upload to presigned URL
      const uploadResult = await fetch(uploadResponse.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'x-amz-meta-originalfilename': file.name,
          'x-amz-meta-filesizekilobytes': fileSizeKiloBytes.toString(),
          'x-amz-meta-problemid': problemId.toString(),
        },
        mode: 'cors',
      });

      console.log('Test case upload result:', {
        status: uploadResult.status,
        statusText: uploadResult.statusText,
      });

      if (!uploadResult.ok) {
        const errorText = await uploadResult
          .text()
          .catch(() => 'Unable to read error text');
        console.error('Test case upload failed:', {
          status: uploadResult.status,
          error: errorText,
        });
        throw new Error(
          `테스트케이스 업로드에 실패했습니다. Status: ${uploadResult.status}`
        );
      }

      // Extract path from presigned URL and combine with base URL
      const presignedUrl = new URL(uploadResponse.presignedUrl);
      const testCasePath = presignedUrl.pathname;
      const finalTestCaseUrl = `https://storage.algomarket.site${testCasePath}`;

      return finalTestCaseUrl;
    } catch (error) {
      console.error('Test case upload error details:', error);
      throw error;
    }
  },

  // Publish problem
  publishProblem: async (problemId: number): Promise<void> => {
    await api.put<void>(`/problems/publish/${problemId}`);
  },
};
