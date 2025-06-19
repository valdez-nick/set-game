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
  isConnected: boolean; // For future online play
  selectedCards?: string[]; // Track each player's current selection
}

export type GameMode = 'single' | 'multi';
export type MultiplayerMode = 'competitive' | 'team' | 'elimination';

export interface MultiplayerSettings {
  mode: MultiplayerMode;
  maxScore?: number;        // Points to win
  teamAssignments?: number[]; // Player indices for teams
}

export interface MultiplayerGameState extends GameState {
  gameMode: GameMode;
  players: Player[];
  difficulty: DifficultyConfig;
  multiplayerSettings?: MultiplayerSettings;
  roundNumber: number;
  gameStartTime: number;
}

// Events for multiplayer interactions
export type MultiplayerEvent = 
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'SET_FOUND'; playerIndex: number; cards: string[] }
  | { type: 'WRONG_GUESS'; playerIndex: number; cards: string[] }
  | { type: 'GAME_OVER'; winners: number[] };

// Team play types
export interface Team {
  id: string;
  name: string;
  playerIndices: number[];
  score: number;
  color: string;
}

