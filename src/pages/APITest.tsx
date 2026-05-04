import { useState } from 'react';
import { locationService } from '@/services/location.service';
import { authService } from '@/services/auth.service';
import { bookingService } from '@/services/booking.service';

type TestResult = {
  status: 'success' | 'error';
  count?: number;
  data?: unknown;
  user?: { email?: string; role?: string };
  message?: string;
};

type TestResults = Record<string, TestResult>;

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';

export default function APITest() {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: TestResults = {};

    try {
      const locations = await locationService.getAll();
      results.locations = { status: 'success', count: locations.length, data: locations };
    } catch (error) {
      results.locations = { status: 'error', message: getErrorMessage(error) };
    }

    try {
      const loginData = await authService.login({ email: 'admin@anvoyages.vn', password: 'Admin@123456' });
      localStorage.setItem('access_token', loginData.access_token);
      results.login = { status: 'success', user: loginData.user };
    } catch (error) {
      results.login = { status: 'error', message: getErrorMessage(error) };
    }

    try {
      const profile = await authService.getProfile();
      results.profile = { status: 'success', data: profile };
    } catch (error) {
      results.profile = { status: 'error', message: getErrorMessage(error) };
    }

    try {
      const stats = await bookingService.getStats();
      results.bookingStats = { status: 'success', data: stats };
    } catch (error) {
      results.bookingStats = { status: 'error', message: getErrorMessage(error) };
    }

    setTestResults(results);
    setTesting(false);
  };

  const results = Object.values(testResults);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Backend API Connection Test</h1>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="mb-2 font-semibold">Backend API URL:</h2>
        <code className="rounded bg-blue-100 px-2 py-1 text-sm">
          {import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}
        </code>
      </div>

      <button
        onClick={runTests}
        disabled={testing}
        className="mb-6 rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {testing ? 'Testing...' : 'Run All Tests'}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Test Results:</h2>
          {Object.entries(testResults).map(([name, result]) => (
            <div
              key={name}
              className={`rounded-lg border p-4 ${result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <h3 className="mb-2 font-semibold">{name}</h3>
              {result.status === 'success' ? (
                <pre className="overflow-auto rounded bg-green-100 p-2 text-xs">
                  {JSON.stringify(result.data ?? result.user ?? { count: result.count }, null, 2)}
                </pre>
              ) : (
                <p className="text-red-800">Error: {result.message}</p>
              )}
            </div>
          ))}

          <div className="mt-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold">Summary:</h3>
            <p>Passed: {results.filter((result) => result.status === 'success').length} / {results.length}</p>
            {results.every((result) => result.status === 'success') && (
              <p className="mt-2 font-semibold text-green-600">All tests passed. Backend is connected.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
