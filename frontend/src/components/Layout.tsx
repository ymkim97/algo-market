import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToastContext } from '../context/ToastContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      <nav className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-semibold text-white">
              AlgoMarket
            </Link>
            <div className="hidden items-center space-x-2 md:flex">
              {[
                { label: '문제 목록', to: '/problems' },
                { label: '출제하기', to: '/create-problem' },
              ].map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow'
                        : 'text-indigo-100 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm font-medium text-indigo-50 md:inline">
                  안녕하세요, {currentUser?.username}님
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-full border border-white/30 px-3 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-indigo-700"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-indigo-100 hover:bg-white/20 hover:text-white"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50"
                >
                  회원가입
                </Link>
              </>
            )}
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
