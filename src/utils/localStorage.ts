import type { GameResult, ScoreboardStats, SortConfig, ScoreboardFilters, PersonalRecord } from '../types/scoreboard';

const STORAGE_KEY = 'set-game-results';
const VERSION_KEY = 'set-game-version';
const CURRENT_VERSION = '1.0.0';

// Initialize storage with version check
function initializeStorage(): void {
  const version = localStorage.getItem(VERSION_KEY);
  if (version !== CURRENT_VERSION) {
    // Handle migration in the future
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
}

// Save a game result
export function saveGameResult(result: GameResult): void {
  try {
    initializeStorage();
    const results = getAllGameResults();
    
    // Ensure the result has proper date format
    const resultToSave = {
      ...result,
      date: new Date(result.date)
    };
    
    results.push(resultToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Failed to save game result:', error);
  }
}

// Get all game results
export function getAllGameResults(): GameResult[] {
  try {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const results = JSON.parse(data);
    
    // Ensure dates are Date objects
    return results.map((result: any) => ({
      ...result,
      date: new Date(result.date)
    }));
  } catch (error) {
    console.error('Failed to load game results:', error);
    return [];
  }
}

// Get sorted and filtered results
export function getFilteredResults(
  filters: ScoreboardFilters,
  sort: SortConfig
): GameResult[] {
  const results = getAllGameResults();
  
  // Apply filters
  let filtered = results.filter(result => {
    if (filters.completedOnly && !result.completed) return false;
    
    if (filters.dateRange) {
      const resultDate = new Date(result.date);
      if (resultDate < filters.dateRange.start || resultDate > filters.dateRange.end) {
        return false;
      }
    }
    
    if (filters.minScore && result.setsFound < filters.minScore) return false;
    if (filters.maxTime && result.completionTime > filters.maxTime) return false;
    
    return true;
  });
  
  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'setsFound':
        comparison = a.setsFound - b.setsFound;
        break;
      case 'completionTime':
        comparison = a.completionTime - b.completionTime;
        break;
      case 'hintsUsed':
        comparison = a.hintsUsed - b.hintsUsed;
        break;
      default:
        comparison = 0;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
  
  return filtered;
}

// Calculate statistics
export function calculateStats(): ScoreboardStats {
  const results = getAllGameResults();
  const completed = results.filter(r => r.completed);
  
  if (results.length === 0) {
    return {
      totalGames: 0,
      completedGames: 0,
      averageTime: 0,
      bestTime: 0,
      highestScore: 0,
      totalSets: 0,
      averageHints: 0,
      perfectGames: 0
    };
  }
  
  const totalSets = results.reduce((sum, r) => sum + r.setsFound, 0);
  const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);
  const perfectGames = completed.filter(r => r.hintsUsed === 0).length;
  
  const completedTimes = completed.map(r => r.completionTime);
  const scores = results.map(r => r.setsFound);
  
  return {
    totalGames: results.length,
    completedGames: completed.length,
    averageTime: completed.length > 0 
      ? Math.round(completedTimes.reduce((sum, time) => sum + time, 0) / completed.length)
      : 0,
    bestTime: completed.length > 0 ? Math.min(...completedTimes) : 0,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    totalSets,
    averageHints: results.length > 0 
      ? Math.round((totalHints / results.length) * 10) / 10
      : 0,
    perfectGames
  };
}

// Get personal records
export function getPersonalRecords(): PersonalRecord[] {
  const results = getAllGameResults();
  const completed = results.filter(r => r.completed);
  const records: PersonalRecord[] = [];
  
  if (completed.length === 0) return records;
  
  // Fastest completion
  const fastestGame = completed.reduce((fastest, current) => 
    current.completionTime < fastest.completionTime ? current : fastest
  );
  
  records.push({
    type: 'fastest',
    value: fastestGame.completionTime,
    gameId: fastestGame.id,
    date: fastestGame.date,
    description: `Completed in ${formatTime(fastestGame.completionTime)}`
  });
  
  // Highest score
  const highestScoreGame = results.reduce((highest, current) =>
    current.setsFound > highest.setsFound ? current : highest
  );
  
  records.push({
    type: 'highest_score',
    value: highestScoreGame.setsFound,
    gameId: highestScoreGame.id,
    date: highestScoreGame.date,
    description: `${highestScoreGame.setsFound} sets found`
  });
  
  // Perfect game (no hints)
  const perfectGame = completed
    .filter(r => r.hintsUsed === 0)
    .sort((a, b) => a.completionTime - b.completionTime)[0];
  
  if (perfectGame) {
    records.push({
      type: 'no_hints',
      value: perfectGame.completionTime,
      gameId: perfectGame.id,
      date: perfectGame.date,
      description: `Perfect game in ${formatTime(perfectGame.completionTime)}`
    });
  }
  
  return records;
}

// Helper function to format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Generate unique ID for game results
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clear all data (for development/testing)
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VERSION_KEY);
}