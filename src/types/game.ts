// Type definitions for the Set card game

export type CardNumber = 1 | 2 | 3;
export type CardShape = 'diamond' | 'oval' | 'squiggle';
export type CardShading = 'solid' | 'striped' | 'outline';
export type CardColor = 'red' | 'green' | 'purple';

export interface Card {
  id: string;
  number: CardNumber;
  shape: CardShape;
  shading: CardShading;
  color: CardColor;
}

export type TimerState = 'not-started' | 'running' | 'paused';

export interface GameState {
  sessionId: string;
  deck: Card[];
  board: Card[];
  selectedCards: Card[];
  foundSets: Card[][];
  score: number;
  hints: number;
  startTime: number;
  timerState: TimerState;
  pausedTime: number;
  initialDeckSize: number;
  isGameOver: boolean;
}

export interface PlayerStats {
  setsFound: number;
  hintsUsed: number;
  timeElapsed: number;
  bestTime?: number;
}