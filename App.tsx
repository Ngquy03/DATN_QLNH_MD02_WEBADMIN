
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = useCallback((newToken: string) => {
    try {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
    } catch (error) {
      console.error("Could not write to localStorage:", error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error("Could not remove from localStorage:", error);
    }
    setToken(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
