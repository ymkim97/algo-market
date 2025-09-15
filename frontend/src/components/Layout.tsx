import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToastContext } from '../context/ToastContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    toast.success('로그아웃되었습니다.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  Algo Market
                </Link>
              </div>
              {isAuthenticated && (
                <div className="ml-6 flex space-x-8">
                  <Link
                    to="/problems"
                    className="text-gray-900 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    문제 목록
                  </Link>
                  <Link
                    to="/submissions"
                    className="text-gray-900 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    내 제출
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 text-sm">
                    안녕하세요, {currentUser?.username}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
