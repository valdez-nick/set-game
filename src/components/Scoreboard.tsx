import React, { useState, useMemo } from 'react';
import type { SortConfig, ScoreboardFilters } from '../types/scoreboard';
import { 
  getFilteredResults, 
  calculateStats, 
  getPersonalRecords,
  formatTime, 
  formatDate 
} from '../utils/localStorage';

interface ScoreboardProps {
  onBackToGame: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ onBackToGame }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'date', 
    direction: 'desc' 
  });
  
  const [filters, setFilters] = useState<ScoreboardFilters>({
    completedOnly: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Get data
  const results = useMemo(() => {
    return getFilteredResults(filters, sortConfig);
  }, [filters, sortConfig]);

  const stats = useMemo(() => calculateStats(), []);
  const records = useMemo(() => getPersonalRecords(), []);

  // Handle sorting
  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Filter results by search term
  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    
    const term = searchTerm.toLowerCase();
    return results.filter(result => 
      formatDate(result.date).toLowerCase().includes(term) ||
      result.setsFound.toString().includes(term) ||
      formatTime(result.completionTime).includes(term)
    );
  }, [results, searchTerm]);

  const getSortIcon = (field: SortConfig['field']) => {
    if (sortConfig.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-purple-800">
            Chace's Scoreboard 🏆
          </h1>
          <button
            onClick={onBackToGame}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Back to Game
          </button>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalGames}</div>
            <div className="text-sm text-gray-600">Total Games</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completedGames}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.highestScore}</div>
            <div className="text-sm text-gray-600">Best Score</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600">
              {stats.bestTime > 0 ? formatTime(stats.bestTime) : '--:--'}
            </div>
            <div className="text-sm text-gray-600">Best Time</div>
          </div>
        </div>

        {/* Personal Records */}
        {records.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Personal Records 🌟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {records.map((record) => (
                <div key={record.type} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
                  <div className="text-lg font-semibold text-yellow-800">{record.description}</div>
                  <div className="text-sm text-yellow-600">{formatDate(record.date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.completedOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, completedOnly: e.target.checked }))}
                  className="rounded"
                />
                Completed Games Only
              </label>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredResults.length} of {stats.totalGames} games
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">No games yet!</h3>
              <p>Start playing to see your scores here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Rank</th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-purple-800 cursor-pointer hover:bg-purple-100"
                      onClick={() => handleSort('date')}
                    >
                      Date {getSortIcon('date')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-purple-800 cursor-pointer hover:bg-purple-100"
                      onClick={() => handleSort('setsFound')}
                    >
                      Score {getSortIcon('setsFound')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-purple-800 cursor-pointer hover:bg-purple-100"
                      onClick={() => handleSort('completionTime')}
                    >
                      Time {getSortIcon('completionTime')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-purple-800 cursor-pointer hover:bg-purple-100"
                      onClick={() => handleSort('hintsUsed')}
                    >
                      Hints {getSortIcon('hintsUsed')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResults.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {getRankIcon(index)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(result.date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-bold text-lg text-purple-600">
                          {result.setsFound}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {result.completionTime > 0 ? formatTime(result.completionTime) : '--:--'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          result.hintsUsed === 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.hintsUsed === 0 ? 'Perfect! 🌟' : `${result.hintsUsed} hints`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          result.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {result.completed ? '✅ Complete' : '⏸️ Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        {stats.totalGames > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageHints}</div>
              <div className="text-sm text-gray-600">Avg Hints Per Game</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-2xl font-bold text-green-600">{stats.perfectGames}</div>
              <div className="text-sm text-gray-600">Perfect Games (No Hints)</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageTime > 0 ? formatTime(stats.averageTime) : '--:--'}
              </div>
              <div className="text-sm text-gray-600">Average Completion Time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;