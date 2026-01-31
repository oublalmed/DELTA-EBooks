import React, { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

interface AnalyticsData {
  userStats: { date: string; new_users: number }[];
  readingStats: { date: string; sessions: number; total_time: number }[];
  adStats: { date: string; impressions: number }[];
  topBooks: { id: string; title: string; reads: number }[];
}

const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getAnalytics(period);
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMaxValue = (arr: { value: number }[]) => Math.max(...arr.map(i => i.value), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-stone-400">
        Failed to load analytics data
      </div>
    );
  }

  // Calculate totals
  const totalNewUsers = data.userStats.reduce((acc, d) => acc + d.new_users, 0);
  const totalSessions = data.readingStats.reduce((acc, d) => acc + d.sessions, 0);
  const totalReadingTime = data.readingStats.reduce((acc, d) => acc + d.total_time, 0);
  const totalImpressions = data.adStats.reduce((acc, d) => acc + d.impressions, 0);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-stone-500">Period:</span>
        {[7, 30, 90].map(days => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === days ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {days} Days
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-3xl font-bold text-blue-600">{totalNewUsers}</p>
          <p className="text-sm text-stone-500">New Users</p>
          <p className="text-xs text-stone-400 mt-1">Last {period} days</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-3xl font-bold text-green-600">{totalSessions}</p>
          <p className="text-sm text-stone-500">Reading Sessions</p>
          <p className="text-xs text-stone-400 mt-1">Last {period} days</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-3xl font-bold text-purple-600">{formatTime(totalReadingTime)}</p>
          <p className="text-sm text-stone-500">Total Reading Time</p>
          <p className="text-xs text-stone-400 mt-1">Last {period} days</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-3xl font-bold text-amber-600">{totalImpressions.toLocaleString()}</p>
          <p className="text-sm text-stone-500">Ad Impressions</p>
          <p className="text-xs text-stone-400 mt-1">Last {period} days</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">New User Registrations</h3>
          <div className="h-48 flex items-end gap-1">
            {data.userStats.length === 0 ? (
              <p className="text-stone-400 text-sm w-full text-center">No data available</p>
            ) : (
              data.userStats.map((day, i) => {
                const max = getMaxValue(data.userStats.map(d => ({ value: d.new_users })));
                const height = (day.new_users / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <span className="text-xs text-stone-400 mb-1 opacity-0 group-hover:opacity-100">
                        {day.new_users}
                      </span>
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                    {i % Math.ceil(data.userStats.length / 7) === 0 && (
                      <span className="text-xs text-stone-400 mt-2">{new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Reading Sessions Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Reading Sessions</h3>
          <div className="h-48 flex items-end gap-1">
            {data.readingStats.length === 0 ? (
              <p className="text-stone-400 text-sm w-full text-center">No data available</p>
            ) : (
              data.readingStats.map((day, i) => {
                const max = getMaxValue(data.readingStats.map(d => ({ value: d.sessions })));
                const height = (day.sessions / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <span className="text-xs text-stone-400 mb-1 opacity-0 group-hover:opacity-100">
                        {day.sessions}
                      </span>
                      <div
                        className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                    {i % Math.ceil(data.readingStats.length / 7) === 0 && (
                      <span className="text-xs text-stone-400 mt-2">{new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ad Impressions Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Ad Impressions</h3>
          <div className="h-48 flex items-end gap-1">
            {data.adStats.length === 0 ? (
              <p className="text-stone-400 text-sm w-full text-center">No data available</p>
            ) : (
              data.adStats.map((day, i) => {
                const max = getMaxValue(data.adStats.map(d => ({ value: d.impressions })));
                const height = (day.impressions / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <span className="text-xs text-stone-400 mb-1 opacity-0 group-hover:opacity-100">
                        {day.impressions}
                      </span>
                      <div
                        className="w-full bg-amber-500 rounded-t transition-all hover:bg-amber-600"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                    {i % Math.ceil(data.adStats.length / 7) === 0 && (
                      <span className="text-xs text-stone-400 mt-2">{new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Books */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Top Books by Reads</h3>
          {data.topBooks.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No reading data available</p>
          ) : (
            <div className="space-y-3">
              {data.topBooks.map((book, i) => {
                const max = data.topBooks[0]?.reads || 1;
                const width = (book.reads / max) * 100;
                return (
                  <div key={book.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-stone-700 truncate flex-1">{book.title}</span>
                      <span className="text-sm font-medium text-stone-800 ml-2">{book.reads}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Export Note */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <p className="text-sm text-stone-600">
          <strong>Note:</strong> Analytics data is updated in real-time based on user activity. 
          For detailed reports or custom date ranges, you can export the data from the database directly.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsView;
