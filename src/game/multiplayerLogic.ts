import type { Card } from '../types/game';
import type { 
  MultiplayerGameState, 
  Player,
  GameMode 
} from '../types/multiplayer';
import type { DifficultyLevel } from '../types/difficulty';
import { DIFFICULTY_CONFIGS } from '../types/difficulty';
import { generateGameId } from '../utils/localStorage';
import { generateDifficultyOptimizedBoard, optimizeBoardForDifficulty } from './difficultyManager';
import { isValidSet, hasValidSet } from './setValidation';
import type { PlayerConfig } from '../components/multiplayer/GameModeSelector';

/**
 * Initialize a new multiplayer game
 */
export function initializeMultiplayerGame(
  mode: GameMode,
  players: PlayerConfig[],
  difficulty: DifficultyLevel
): MultiplayerGameState {
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const { board, remainingDeck } = generateDifficultyOptimizedBoard(difficultyConfig);
  
  // Create player objects
  const gamePlayers: Player[] = players.map((config, index) => ({
    id: `player-${index}`,
    name: config.name,
    color: config.color,
    score: 0,
    setsFound: 0,
    mistakes: 0,
    isConnected: true,
    selectedCards: []
  }));
  
  return {
    sessionId: generateGameId(),
    deck: remainingDeck,
    board,
    selectedCards: [],
    foundSets: [],
    score: 0,
    hints: difficultyConfig.hintsAllowed,
    startTime: 0,
    timerState: 'not-started',
    pausedTime: 0,
    initialDeckSize: 81,
    isGameOver: false,
    gameMode: mode,
    players: gamePlayers,
    difficulty: difficultyConfig,
    multiplayerSettings: mode === 'multi' ? {
      mode: 'competitive'
    } : undefined,
    roundNumber: 1,
    gameStartTime: Date.now()
  };
}

/**
 * Handle card selection in multiplayer mode
 */
export function selectMultiplayerCard(
  gameState: MultiplayerGameState,
  card: Card,
  playerIndex: number
): MultiplayerGameState {
  const { gameMode, timerState, players } = gameState;
  
  // Single player mode - use regular logic
  if (gameMode === 'single') {
    return selectCardSinglePlayer(gameState, card);
  }
  
  // Get current player's selection
  const player = players[playerIndex];
  const playerSelectedCards = player.selectedCards || [];
  
  // Start game timer on first card selection
  let newGameState = gameState;
  if (timerState === 'not-started') {
    newGameState = {
      ...gameState,
      startTime: Date.now(),
      timerState: 'running'
    };
  }
  
  // Handle card selection/deselection for this player
  const isAlreadySelected = playerSelectedCards.includes(card.id);
  let newPlayerSelectedCards: string[];
  
  if (isAlreadySelected) {
    // Deselect card
    newPlayerSelectedCards = playerSelectedCards.filter(id => id !== card.id);
  } else if (playerSelectedCards.length >= 3) {
    // Replace selection if already have 3
    newPlayerSelectedCards = [card.id];
  } else {
    // Add to selection
    newPlayerSelectedCards = [...playerSelectedCards, card.id];
  }
  
  // Update player's selection
  const updatedPlayers = [...newGameState.players];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    selectedCards: newPlayerSelectedCards
  };
  
  // Check if player has selected 3 cards
  if (newPlayerSelectedCards.length === 3) {
    const selectedCardObjects = newPlayerSelectedCards
      .map(id => newGameState.board.find(c => c.id === id))
      .filter(Boolean) as Card[];
    
    if (selectedCardObjects.length === 3) {
      const [card1, card2, card3] = selectedCardObjects;
      if (isValidSet(card1, card2, card3)) {
        return handleMultiplayerValidSet(
          { ...newGameState, players: updatedPlayers },
          selectedCardObjects,
          playerIndex
        );
      } else {
        return handleMultiplayerWrongGuess(
          { ...newGameState, players: updatedPlayers },
          playerIndex
        );
      }
    }
  }
  
  return {
    ...newGameState,
    players: updatedPlayers,
    selectedCards: [] // Keep global selectedCards empty for multiplayer
  };
}

/**
 * Handle a valid set found in multiplayer
 */
function handleMultiplayerValidSet(
  gameState: MultiplayerGameState,
  foundSet: Card[],
  playerIndex: number
): MultiplayerGameState {
  const { board, deck, foundSets, players, difficulty } = gameState;
  
  // Update player score and clear their selection
  const updatedPlayers = [...players];
  const basePoints = 1;
  const points = Math.round(basePoints * difficulty.scoreMultiplier);
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    score: updatedPlayers[playerIndex].score + points,
    setsFound: updatedPlayers[playerIndex].setsFound + 1,
    selectedCards: [] // Clear selection after valid set
  };
  
  // Remove found set from board
  let newBoard = board.filter(card => !foundSet.some(setCard => setCard.id === card.id));
  let newDeck = [...deck];
  
  // Add new cards based on difficulty
  while (newBoard.length < difficulty.initialBoardSize && newDeck.length > 0) {
    newBoard.push(newDeck.shift()!);
  }
  
  // Optimize board for difficulty
  const optimized = optimizeBoardForDifficulty(newBoard, newDeck, difficulty);
  newBoard = optimized.board;
  newDeck = optimized.deck;
  
  // Check if game is over
  const isGameOver = newDeck.length === 0 && !hasValidSet(newBoard);
  
  return {
    ...gameState,
    board: newBoard,
    deck: newDeck,
    selectedCards: [],
    foundSets: [...foundSets, foundSet],
    players: updatedPlayers,
    score: gameState.score + points,
    isGameOver
  };
}

/**
 * Handle wrong guess in multiplayer
 */
function handleMultiplayerWrongGuess(
  gameState: MultiplayerGameState,
  playerIndex: number
): MultiplayerGameState {
  const { players, difficulty } = gameState;
  
  // Update player mistakes, apply penalty, and clear selection
  const updatedPlayers = [...players];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    mistakes: updatedPlayers[playerIndex].mistakes + 1,
    score: difficulty.wrongGuessPenalty > 0
      ? Math.max(0, updatedPlayers[playerIndex].score - difficulty.wrongGuessPenalty)
      : updatedPlayers[playerIndex].score,
    selectedCards: [] // Clear selection after wrong guess
  };
  
  return {
    ...gameState,
    selectedCards: [],
    players: updatedPlayers
  };
}


/**
 * Handle single player card selection (fallback)
 */
function selectCardSinglePlayer(gameState: MultiplayerGameState, card: Card): MultiplayerGameState {
  const { selectedCards, timerState } = gameState;
  
  // Start timer on first click
  const newGameState = timerState === 'not-started' 
    ? { ...gameState, startTime: Date.now(), timerState: 'running' as const }
    : gameState;
  
  // Handle selection/deselection
  const isAlreadySelected = selectedCards.some(c => c.id === card.id);
  if (isAlreadySelected) {
    return {
      ...newGameState,
      selectedCards: selectedCards.filter(c => c.id !== card.id)
    };
  }
  
  if (selectedCards.length >= 3) {
    return {
      ...newGameState,
      selectedCards: [card]
    };
  }
  
  const newSelectedCards = [...selectedCards, card];
  
  // Check for valid set
  if (newSelectedCards.length === 3) {
    const [card1, card2, card3] = newSelectedCards;
    if (isValidSet(card1, card2, card3)) {
      // Handle valid set for single player
      // This would use the regular single player logic
      return newGameState; // Simplified for now
    }
  }
  
  return {
    ...newGameState,
    selectedCards: newSelectedCards
  };
}

