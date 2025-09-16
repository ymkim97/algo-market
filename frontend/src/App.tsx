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
import CreateProblem from './pages/CreateProblem';
import ProblemCreate from './pages/ProblemCreate';

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
            <Route path="create-problem" element={<CreateProblem />} />
            <Route path="create-problem/new" element={<ProblemCreate />} />
            <Route
              path="create-problem/edit/:problemId"
              element={<ProblemCreate />}
            />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
