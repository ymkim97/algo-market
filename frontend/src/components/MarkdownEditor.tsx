import React, { useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>; // 이미지 업로드 핸들러
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = '마크다운으로 내용을 작성하세요...',
  rows = 15,
  className = '',
  onImageUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isUploading, setIsUploading] = useState(false);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return;

    try {
      setIsUploading(true);
      const imageUrl = await onImageUpload(file);

      // HTML img 태그로 삽입하여 크기 조절 가능하도록
      const imageMarkdown = `<img src="${imageUrl}" alt="${file.name}" style="width: 100%; height: auto;" />`;
      onChange(value + '\n' + imageMarkdown);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 입력 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    // input 값 초기화
    event.target.value = '';
  };

  // 간단한 마크다운 렌더링 함수 (실제 프로젝트에서는 marked나 remark를 사용하는 것을 권장)
  const renderMarkdown = (markdown: string): string => {
    let html = markdown
      // 헤더
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mt-6 mb-4">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>'
      )

      // 코드 블록
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$1</code></pre>'
      )

      // 인라인 코드
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>'
      )

      // 볼드
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

      // 이탤릭
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

      // 순서 없는 리스트
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')

      // 순서 있는 리스트
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')

      // 이미지 (링크보다 먼저 처리)
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 mx-auto block" style="max-height: 400px;" />'
      )

      // 링크
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-indigo-600 hover:text-indigo-800 underline">$1</a>'
      )

      // 줄바꿈
      .replace(/\n/g, '<br>');

    // 리스트 항목들을 ul/ol 태그로 감싸기
    html = html.replace(
      /((<li class="ml-4 list-disc">.*?<\/li>\s*)+)/g,
      '<ul class="space-y-1 mb-4">$1</ul>'
    );
    html = html.replace(
      /((<li class="ml-4 list-decimal">.*?<\/li>\s*)+)/g,
      '<ol class="space-y-1 mb-4">$1</ol>'
    );

    return html;
  };

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {/* 탭 헤더 */}
      <div className="flex justify-between border-b border-gray-200 bg-gray-50">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'write'
                ? 'border-indigo-500 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg
              className="w-4 h-4 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            작성
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg
              className="w-4 h-4 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            미리보기
          </button>
        </div>

        {/* 툴바 */}
        {activeTab === 'write' && onImageUpload && (
          <div className="flex items-center px-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
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
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  이미지
                </div>
              )}
            </label>
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="relative">
        {activeTab === 'write' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 resize-none"
            style={{ minHeight: `${rows * 1.5}rem` }}
          />
        ) : (
          <div
            className="px-4 py-3 prose prose-sm max-w-none"
            style={{ minHeight: `${rows * 1.5}rem` }}
          >
            {value.trim() ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            ) : (
              <p className="text-gray-500 italic">
                미리보기할 내용이 없습니다.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span>
              <code className="bg-gray-200 px-1 rounded"># 제목</code>
            </span>
            <span>
              <code className="bg-gray-200 px-1 rounded">**굵게**</code>
            </span>
            <span>
              <code className="bg-gray-200 px-1 rounded">*기울임*</code>
            </span>
            <span>
              <code className="bg-gray-200 px-1 rounded">`코드`</code>
            </span>
            <span>
              <code className="bg-gray-200 px-1 rounded">- 리스트</code>
            </span>
            <span>
              <code className="bg-gray-200 px-1 rounded">[링크](url)</code>
            </span>
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">이미지 크기 조절:</span>
            <code className="bg-gray-200 px-1 rounded ml-1">
              style="width: 300px;"
            </code>
            <code className="bg-gray-200 px-1 rounded ml-1">
              style="width: 50%;"
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
