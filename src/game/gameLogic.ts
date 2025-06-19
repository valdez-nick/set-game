import type { Card, GameState } from '../types/game';
import { generateDeck } from './deck';
import { isValidSet, hasValidSet } from './setValidation';
import { saveGameResult, generateGameId } from '../utils/localStorage';
import type { GameResult } from '../types/scoreboard';

const INITIAL_BOARD_SIZE = 12;
const MAX_BOARD_SIZE = 21;

export function initializeGame(): GameState {
  const deck = generateDeck();
  const initialDeckSize = deck.length;
  const board = deck.splice(0, INITIAL_BOARD_SIZE);
  
  // Ensure there's at least one valid set on the initial board
  while (!hasValidSet(board) && deck.length >= 3) {
    // Add 3 more cards if no valid set exists
    board.push(...deck.splice(0, 3));
  }
  
  return {
    sessionId: generateGameId(),
    deck,
    board,
    selectedCards: [],
    foundSets: [],
    score: 0,
    hints: 3,
    startTime: 0,
    timerState: 'not-started',
    pausedTime: 0,
    initialDeckSize,
    isGameOver: false
  };
}

export function selectCard(gameState: GameState, card: Card): GameState {
  const { selectedCards, timerState } = gameState;
  
  // Start timer on first card click
  const newGameState = timerState === 'not-started' 
    ? { ...gameState, startTime: Date.now(), timerState: 'running' as const }
    : gameState;
  
  // If card is already selected, deselect it
  const isAlreadySelected = selectedCards.some(c => c.id === card.id);
  if (isAlreadySelected) {
    return {
      ...newGameState,
      selectedCards: selectedCards.filter(c => c.id !== card.id)
    };
  }
  
  // If we already have 3 cards selected, replace the selection
  if (selectedCards.length >= 3) {
    return {
      ...newGameState,
      selectedCards: [card]
    };
  }
  
  // Add card to selection
  const newSelectedCards = [...selectedCards, card];
  
  // If we now have 3 cards, check if it's a valid set
  if (newSelectedCards.length === 3) {
    const [card1, card2, card3] = newSelectedCards;
    if (isValidSet(card1, card2, card3)) {
      return handleValidSet(newGameState, newSelectedCards);
    }
  }
  
  return {
    ...newGameState,
    selectedCards: newSelectedCards
  };
}

function handleValidSet(gameState: GameState, foundSet: Card[]): GameState {
  const { board, deck, foundSets, score } = gameState;
  
  // Remove the found set from the board
  const newBoard = board.filter(card => !foundSet.some(setCard => setCard.id === card.id));
  
  // Add new cards from the deck if available and board is below 12 cards
  while (newBoard.length < INITIAL_BOARD_SIZE && deck.length > 0) {
    newBoard.push(deck.shift()!);
  }
  
  // Check if game is over (no more valid sets and no more cards in deck)
  const isGameOver = deck.length === 0 && !hasValidSet(newBoard);
  
  const newGameState = {
    ...gameState,
    board: newBoard,
    deck: [...deck],
    selectedCards: [],
    foundSets: [...foundSets, foundSet],
    score: score + 1,
    isGameOver
  };
  
  // Save game result if game is completed
  if (isGameOver) {
    saveCurrentGameResult(newGameState);
  }
  
  return newGameState;
}

export function addMoreCards(gameState: GameState): GameState {
  const { board, deck } = gameState;
  
  // Don't add more cards if board is already at max size or deck is empty
  if (board.length >= MAX_BOARD_SIZE || deck.length < 3) {
    return gameState;
  }
  
  // Add 3 more cards
  const newCards = deck.splice(0, 3);
  
  return {
    ...gameState,
    board: [...board, ...newCards],
    deck: [...deck]
  };
}

export function useHint(gameState: GameState): { gameState: GameState; hint?: Card[] } {
  const { hints, board } = gameState;
  
  if (hints <= 0) {
    return { gameState };
  }
  
  // Find a valid set to hint
  const validSets = findAllValidSets(board);
  if (validSets.length === 0) {
    return { gameState };
  }
  
  // Return the first valid set as a hint
  return {
    gameState: {
      ...gameState,
      hints: hints - 1
    },
    hint: validSets[0]
  };
}

function findAllValidSets(board: Card[]): Card[][] {
  const sets: Card[][] = [];
  
  for (let i = 0; i < board.length - 2; i++) {
    for (let j = i + 1; j < board.length - 1; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isValidSet(board[i], board[j], board[k])) {
          sets.push([board[i], board[j], board[k]]);
        }
      }
    }
  }
  
  return sets;
}

export function pauseTimer(gameState: GameState): GameState {
  if (gameState.timerState !== 'running') {
    return gameState;
  }
  
  return {
    ...gameState,
    timerState: 'paused',
    pausedTime: gameState.pausedTime + (Date.now() - gameState.startTime)
  };
}

export function resumeTimer(gameState: GameState): GameState {
  if (gameState.timerState !== 'paused') {
    return gameState;
  }
  
  return {
    ...gameState,
    timerState: 'running',
    startTime: Date.now()
  };
}

// Save current game state as a result
export function saveCurrentGameResult(gameState: GameState): void {
  const { 
    sessionId, 
    foundSets, 
    hints, 
    startTime, 
    timerState, 
    pausedTime, 
    initialDeckSize, 
    isGameOver 
  } = gameState;
  
  // Only save if the timer has started (user has played)
  if (timerState === 'not-started') {
    return;
  }
  
  // Calculate total elapsed time
  let completionTime = 0;
  if (timerState === 'running') {
    completionTime = Math.floor((Date.now() - startTime + pausedTime) / 1000);
  } else if (timerState === 'paused') {
    completionTime = Math.floor(pausedTime / 1000);
  }
  
  const hintsUsed = 3 - hints; // Calculate hints used
  
  const gameResult: GameResult = {
    id: sessionId,
    date: new Date(),
    setsFound: foundSets.length,
    completionTime,
    hintsUsed,
    totalCards: initialDeckSize,
    completed: isGameOver
  };
  
  saveGameResult(gameResult);
}