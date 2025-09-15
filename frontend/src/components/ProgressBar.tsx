import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  /** 로딩 상태 */
  loading: boolean;
  /** 커스텀 진행률 (0-100), 제공하지 않으면 자동 애니메이션 */
  progress?: number;
  /** 진행률 바 색상 */
  color?: 'indigo' | 'blue' | 'green' | 'red';
  /** 배경 색상 */
  backgroundColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  loading,
  progress,
  color = 'indigo',
  backgroundColor = 'bg-gray-200',
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimatedProgress(0);
      return;
    }

    if (progress !== undefined) {
      // 커스텀 진행률이 제공된 경우
      setAnimatedProgress(progress);
    } else {
      // 자동 애니메이션: 0 -> 30 -> 60 -> 90 -> 100
      const steps = [0, 30, 60, 90, 100];
      let currentStep = 0;

      setAnimatedProgress(steps[0]);

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setAnimatedProgress(steps[currentStep]);
        } else {
          clearInterval(interval);
        }
      }, 300); // 300ms마다 진행

      return () => clearInterval(interval);
    }
  }, [loading, progress]);

  if (!loading) {
    return null;
  }

  const colorClasses = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  return (
    <div className={`fixed top-0 left-0 w-full h-1 ${backgroundColor} z-50`}>
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out`}
        style={{ width: `${animatedProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
