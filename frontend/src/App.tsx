import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import MyProblems from './pages/MyProblems';
import ProblemForm from './pages/ProblemForm';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/problems" replace />} />
            <Route path="problems" element={<ProblemList />} />
            <Route path="problems/:problemId" element={<ProblemDetail />} />
            <Route
              path="problems/draft/:problemId"
              element={<ProblemDetail />}
            />
            <Route path="create-problem" element={<MyProblems />} />
            <Route path="create-problem/new" element={<ProblemForm />} />
            <Route
              path="create-problem/edit/:problemId"
              element={<ProblemForm />}
            />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
