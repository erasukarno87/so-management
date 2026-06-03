// Login page for SO-Management
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!username || !password) {
      setLocalError('Please enter username and password');
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">SO-Management</h1>
          <p className="text-slate-400">Delivery System</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign In</h2>

          {(localError || error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Default credentials:</p>
            <p className="font-mono text-slate-700">admin / Admin@123456!</p>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm">
          v2.0.0
        </div>
      </div>
    </div>
  );
}

export default Login;