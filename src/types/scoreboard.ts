// Type definitions for scoreboard and game results tracking

export interface GameResult {
  id: string;
  date: Date;
  setsFound: number;
  completionTime: number; // in seconds
  hintsUsed: number;
  totalCards: number; // initial deck size
  completed: boolean;
  difficulty?: 'easy' | 'normal' | 'hard'; // for future expansion
}

export interface ScoreboardStats {
  totalGames: number;
  completedGames: number;
  averageTime: number;
  bestTime: number;
  highestScore: number;
  totalSets: number;
  averageHints: number;
  perfectGames: number; // games completed without hints
}

export type SortField = 'date' | 'setsFound' | 'completionTime' | 'hintsUsed';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface ScoreboardFilters {
  completedOnly: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minScore?: number;
  maxTime?: number;
}

export interface PersonalRecord {
  type: 'fastest' | 'highest_score' | 'no_hints' | 'most_sets';
  value: number;
  gameId: string;
  date: Date;
  description: string;
}