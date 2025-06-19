// Type definitions for difficulty system

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';

export interface DifficultyConfig {
  level: DifficultyLevel;
  minSets: number;              // Minimum sets to maintain on board
  maxSets: number;              // Maximum sets allowed on board
  initialBoardSize: number;     // Starting number of cards
  maxBoardSize: number;         // Maximum cards on board
  turnDuration: number;         // Seconds per turn (multiplayer)
  hintsAllowed: number;         // Number of hints available
  wrongGuessPenalty: number;    // Points lost for wrong guess
  scoreMultiplier: number;      // Score multiplication factor
  visualAssist: boolean;        // Show subtle hints on cards
  requireUniqueFeatures: boolean; // For expert mode complexity
}

// Predefined difficulty configurations
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: 'easy',
    minSets: 4,
    maxSets: 8,
    initialBoardSize: 12,
    maxBoardSize: 12,
    turnDuration: 45,
    hintsAllowed: 5,
    wrongGuessPenalty: 0,
    scoreMultiplier: 0.5,
    visualAssist: true,
    requireUniqueFeatures: false
  },
  normal: {
    level: 'normal',
    minSets: 1,
    maxSets: 5,
    initialBoardSize: 12,
    maxBoardSize: 15,
    turnDuration: 30,
    hintsAllowed: 3,
    wrongGuessPenalty: 0,
    scoreMultiplier: 1.0,
    visualAssist: false,
    requireUniqueFeatures: false
  },
  hard: {
    level: 'hard',
    minSets: 1,
    maxSets: 2,
    initialBoardSize: 15,
    maxBoardSize: 18,
    turnDuration: 20,
    hintsAllowed: 0,
    wrongGuessPenalty: 1,
    scoreMultiplier: 1.5,
    visualAssist: false,
    requireUniqueFeatures: false
  },
  expert: {
    level: 'expert',
    minSets: 1,
    maxSets: 1,
    initialBoardSize: 18,
    maxBoardSize: 21,
    turnDuration: 15,
    hintsAllowed: 0,
    wrongGuessPenalty: 2,
    scoreMultiplier: 2.0,
    visualAssist: false,
    requireUniqueFeatures: true
  }
};

// Challenge mode types
export type ChallengeMode = 'speed_run' | 'survival' | 'pattern_master' | 'memory';

export interface ChallengeConfig {
  mode: ChallengeMode;
  name: string;
  description: string;
  targetSets?: number;      // For speed run
  lives?: number;           // For survival
  allowedPatterns?: string[]; // For pattern master
  flipDelay?: number;       // For memory mode (seconds)
}