// Type definitions for multiplayer functionality

import type { GameState } from './game';
import type { DifficultyConfig } from './difficulty';

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  setsFound: number;
  mistakes: number;
  isActive: boolean;
  isConnected: boolean; // For future online play
}

export interface TurnInfo {
  currentPlayerIndex: number;
  turnStartTime: number;
  turnDuration: number;
  timeRemaining: number;
  canSteal: boolean; // If current player makes mistake
}

export type GameMode = 'single' | 'multi';
export type MultiplayerMode = 'competitive' | 'team' | 'elimination';

export interface MultiplayerSettings {
  mode: MultiplayerMode;
  maxScore?: number;        // Points to win
  enableSteal: boolean;     // Allow stealing on wrong guess
  enableTurnTimer: boolean; // Use turn timer
  teamAssignments?: number[]; // Player indices for teams
}

export interface MultiplayerGameState extends GameState {
  gameMode: GameMode;
  players: Player[];
  currentTurn: TurnInfo | null;
  difficulty: DifficultyConfig;
  multiplayerSettings?: MultiplayerSettings;
  roundNumber: number;
  gameStartTime: number;
}

// Events for multiplayer interactions
export type MultiplayerEvent = 
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'TURN_STARTED'; playerIndex: number }
  | { type: 'TURN_ENDED'; playerIndex: number; reason: 'timeout' | 'set_found' | 'wrong_guess' }
  | { type: 'SET_FOUND'; playerIndex: number; cards: string[] }
  | { type: 'WRONG_GUESS'; playerIndex: number; cards: string[] }
  | { type: 'STEAL_ATTEMPT'; playerIndex: number }
  | { type: 'GAME_OVER'; winners: number[] };

// Team play types
export interface Team {
  id: string;
  name: string;
  playerIndices: number[];
  score: number;
  color: string;
}

// Turn result for processing
export interface TurnResult {
  successful: boolean;
  pointsEarned: number;
  nextPlayerIndex: number;
  gameOver: boolean;
  message?: string;
}