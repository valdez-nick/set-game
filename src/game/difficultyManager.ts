import type { Card } from '../types/game';
import type { DifficultyConfig } from '../types/difficulty';
import { generateDeck, shuffleDeck } from './deck';
import { findAllSets } from './setValidation';

/**
 * Generates a board optimized for the specified difficulty level
 */
export function generateDifficultyOptimizedBoard(
  config: DifficultyConfig,
  deckCards?: Card[]
): { board: Card[]; remainingDeck: Card[] } {
  const deck = deckCards || generateDeck();
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    
    // Take cards for initial board
    const boardSize = config.initialBoardSize;
    const testBoard = deck.slice(0, boardSize);
    const testDeck = deck.slice(boardSize);
    
    // Count sets on this board
    const sets = findAllSets(testBoard);
    const setCount = sets.length;
    
    // Check if this board meets difficulty requirements
    if (setCount >= config.minSets && setCount <= config.maxSets) {
      // Additional validation for expert mode
      if (config.requireUniqueFeatures && !hasGoodFeatureDistribution(testBoard)) {
        // Shuffle and try again
        shuffleDeck(deck);
        continue;
      }
      
      return {
        board: testBoard,
        remainingDeck: testDeck
      };
    }
    
    // Shuffle and try again
    shuffleDeck(deck);
  }
  
  // Fallback: return a board even if it doesn't perfectly match requirements
  console.warn(`Could not generate perfect board for ${config.level} difficulty after ${maxAttempts} attempts`);
  return {
    board: deck.slice(0, config.initialBoardSize),
    remainingDeck: deck.slice(config.initialBoardSize)
  };
}

/**
 * Adjusts an existing board to better match difficulty requirements
 */
export function optimizeBoardForDifficulty(
  board: Card[],
  deck: Card[],
  config: DifficultyConfig
): { board: Card[]; deck: Card[] } {
  const currentSets = findAllSets(board);
  const setCount = currentSets.length;
  
  // If we have too many sets for hard/expert mode
  if (setCount > config.maxSets && deck.length > 0) {
    // Try to replace cards that are part of multiple sets
    const cardSetCounts = countCardSetParticipation(board, currentSets);
    const sortedCards = board
      .map((card, index) => ({ card, index, count: cardSetCounts.get(card.id) || 0 }))
      .sort((a, b) => b.count - a.count);
    
    // Replace cards that participate in the most sets
    for (const { index } of sortedCards.slice(0, 3)) {
      if (deck.length > 0) {
        board[index] = deck.shift()!;
      }
    }
  }
  
  // If we have too few sets for easy mode
  if (setCount < config.minSets && deck.length > 0) {
    // Try to add cards that would create more sets
    const potentialCards = findCardsToCreateSets(board, deck.slice(0, 20));
    for (const card of potentialCards.slice(0, 3)) {
      if (board.length < config.maxBoardSize) {
        board.push(card);
        deck = deck.filter(c => c.id !== card.id);
      }
    }
  }
  
  return { board, deck };
}

/**
 * Counts how many sets each card participates in
 */
function countCardSetParticipation(board: Card[], sets: Card[][]): Map<string, number> {
  const counts = new Map<string, number>();
  
  for (const card of board) {
    counts.set(card.id, 0);
  }
  
  for (const set of sets) {
    for (const card of set) {
      counts.set(card.id, (counts.get(card.id) || 0) + 1);
    }
  }
  
  return counts;
}

/**
 * Finds cards from deck that would create new sets with board cards
 */
function findCardsToCreateSets(board: Card[], candidates: Card[]): Card[] {
  const cardsWithPotential: { card: Card; setPotential: number }[] = [];
  
  for (const candidate of candidates) {
    let setPotential = 0;
    
    // Check all pairs of board cards
    for (let i = 0; i < board.length - 1; i++) {
      for (let j = i + 1; j < board.length; j++) {
        // Check if candidate would complete a set with this pair
        const thirdCard = findThirdCardForSet(board[i], board[j]);
        if (thirdCard && cardsMatch(candidate, thirdCard)) {
          setPotential++;
        }
      }
    }
    
    if (setPotential > 0) {
      cardsWithPotential.push({ card: candidate, setPotential });
    }
  }
  
  // Sort by potential and return top candidates
  return cardsWithPotential
    .sort((a, b) => b.setPotential - a.setPotential)
    .map(item => item.card);
}

/**
 * Calculates what the third card should be to complete a set
 */
function findThirdCardForSet(card1: Card, card2: Card): Partial<Card> | null {
  return {
    number: completeFeature(card1.number, card2.number) as any,
    shape: completeFeature(card1.shape, card2.shape) as any,
    shading: completeFeature(card1.shading, card2.shading) as any,
    color: completeFeature(card1.color, card2.color) as any
  };
}

/**
 * Determines what the third feature should be to complete a set
 */
function completeFeature<T>(f1: T, f2: T): T | null {
  if (f1 === f2) return f1; // All same
  
  // All different - need to find the third option
  // This is a simplified version - in practice you'd have the full logic
  return null; // Would return the third option
}

/**
 * Checks if two cards match (ignoring ID)
 */
function cardsMatch(card1: Card, card2: Partial<Card>): boolean {
  return card1.number === card2.number &&
         card1.shape === card2.shape &&
         card1.shading === card2.shading &&
         card1.color === card2.color;
}

/**
 * Checks if board has good feature distribution for expert mode
 */
function hasGoodFeatureDistribution(board: Card[]): boolean {
  // Count occurrences of each feature
  const numberCounts = new Map<number, number>();
  const shapeCounts = new Map<string, number>();
  const shadingCounts = new Map<string, number>();
  const colorCounts = new Map<string, number>();
  
  for (const card of board) {
    numberCounts.set(card.number, (numberCounts.get(card.number) || 0) + 1);
    shapeCounts.set(card.shape, (shapeCounts.get(card.shape) || 0) + 1);
    shadingCounts.set(card.shading, (shadingCounts.get(card.shading) || 0) + 1);
    colorCounts.set(card.color, (colorCounts.get(card.color) || 0) + 1);
  }
  
  // Check that no feature is too dominant
  const maxAllowed = Math.ceil(board.length * 0.6);
  
  for (const [, count] of numberCounts) {
    if (count > maxAllowed) return false;
  }
  for (const [, count] of shapeCounts) {
    if (count > maxAllowed) return false;
  }
  for (const [, count] of shadingCounts) {
    if (count > maxAllowed) return false;
  }
  for (const [, count] of colorCounts) {
    if (count > maxAllowed) return false;
  }
  
  return true;
}

/**
 * Provides visual hints for easy mode
 */
export function getVisualHints(board: Card[], config: DifficultyConfig): Set<string> {
  const hintedCardIds = new Set<string>();
  
  if (!config.visualAssist) return hintedCardIds;
  
  // Find all sets and mark cards that are part of sets
  const sets = findAllSets(board);
  const cardParticipation = countCardSetParticipation(board, sets);
  
  // Hint cards that participate in the most sets
  const sortedCards = Array.from(cardParticipation.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Hint top 3 cards
  
  for (const [cardId] of sortedCards) {
    hintedCardIds.add(cardId);
  }
  
  return hintedCardIds;
}