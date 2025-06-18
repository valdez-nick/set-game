import { Card, GameState } from '../types/game';
import { generateDeck } from './deck';
import { isValidSet, hasValidSet } from './setValidation';

const INITIAL_BOARD_SIZE = 12;
const MAX_BOARD_SIZE = 21;

export function initializeGame(): GameState {
  const deck = generateDeck();
  const board = deck.splice(0, INITIAL_BOARD_SIZE);
  
  // Ensure there's at least one valid set on the initial board
  while (!hasValidSet(board) && deck.length >= 3) {
    // Add 3 more cards if no valid set exists
    board.push(...deck.splice(0, 3));
  }
  
  return {
    deck,
    board,
    selectedCards: [],
    foundSets: [],
    score: 0,
    hints: 3,
    startTime: Date.now(),
    isGameOver: false
  };
}

export function selectCard(gameState: GameState, card: Card): GameState {
  const { selectedCards } = gameState;
  
  // If card is already selected, deselect it
  const isAlreadySelected = selectedCards.some(c => c.id === card.id);
  if (isAlreadySelected) {
    return {
      ...gameState,
      selectedCards: selectedCards.filter(c => c.id !== card.id)
    };
  }
  
  // If we already have 3 cards selected, replace the selection
  if (selectedCards.length >= 3) {
    return {
      ...gameState,
      selectedCards: [card]
    };
  }
  
  // Add card to selection
  const newSelectedCards = [...selectedCards, card];
  
  // If we now have 3 cards, check if it's a valid set
  if (newSelectedCards.length === 3) {
    const [card1, card2, card3] = newSelectedCards;
    if (isValidSet(card1, card2, card3)) {
      return handleValidSet(gameState, newSelectedCards);
    }
  }
  
  return {
    ...gameState,
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
  
  return {
    ...gameState,
    board: newBoard,
    deck: [...deck],
    selectedCards: [],
    foundSets: [...foundSets, foundSet],
    score: score + 1,
    isGameOver
  };
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