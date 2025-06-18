import type { Card } from '../types/game';

// Check if three cards form a valid set
export function isValidSet(card1: Card, card2: Card, card3: Card): boolean {
  // For each feature, it must be either all the same or all different
  const isNumberValid = areAllSameOrAllDifferent(card1.number, card2.number, card3.number);
  const isShapeValid = areAllSameOrAllDifferent(card1.shape, card2.shape, card3.shape);
  const isShadingValid = areAllSameOrAllDifferent(card1.shading, card2.shading, card3.shading);
  const isColorValid = areAllSameOrAllDifferent(card1.color, card2.color, card3.color);

  return isNumberValid && isShapeValid && isShadingValid && isColorValid;
}

// Helper function to check if three values are all the same or all different
function areAllSameOrAllDifferent<T>(a: T, b: T, c: T): boolean {
  return (a === b && b === c) || (a !== b && b !== c && a !== c);
}

// Find all valid sets on the current board
export function findAllSets(board: Card[]): Card[][] {
  const sets: Card[][] = [];
  
  // Check all combinations of 3 cards
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

// Check if there's at least one valid set on the board
export function hasValidSet(board: Card[]): boolean {
  return findAllSets(board).length > 0;
}