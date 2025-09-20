import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
            className="px-4 py-3 prose prose-sm max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4"
            style={{ minHeight: `${rows * 1.5}rem` }}
          >
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-0">{children}</li>,
                  table: ({ children }) => (
                    <table className="min-w-full divide-y divide-gray-300 mb-4">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-indigo-500 pl-4 italic bg-gray-50 py-2 mb-4">
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mt-8 mb-6 text-gray-900">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-3 text-gray-900">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-semibold mt-4 mb-2 text-gray-900">
                      {children}
                    </h4>
                  ),
                  h5: ({ children }) => (
                    <h5 className="text-sm font-semibold mt-3 mb-2 text-gray-900">
                      {children}
                    </h5>
                  ),
                  h6: ({ children }) => (
                    <h6 className="text-xs font-semibold mt-3 mb-2 text-gray-700">
                      {children}
                    </h6>
                  ),
                  code: ({ children, className }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';

                    if (language) {
                      return (
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={language}
                          PreTag="div"
                          className="mb-4 rounded-lg text-sm"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    }

                    return (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {value}
              </ReactMarkdown>
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
