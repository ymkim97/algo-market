import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  type?: 'text' | 'card' | 'list';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  className = '',
  type = 'text',
}) => {
  if (type === 'card') {
    return (
      <div
        className={`bg-white shadow rounded-lg p-6 animate-pulse ${className}`}
      >
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="mt-4 flex space-x-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
