import type { Card } from '../types/game';
import type { 
  MultiplayerGameState, 
  Player, 
  TurnInfo,
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
    isActive: index === 0, // First player starts
    isConnected: true
  }));
  
  // Initialize turn info for multiplayer
  const turnInfo: TurnInfo | null = mode === 'multi' ? {
    currentPlayerIndex: 0,
    turnStartTime: 0, // Will be set when first card is clicked
    turnDuration: difficultyConfig.turnDuration,
    timeRemaining: difficultyConfig.turnDuration,
    canSteal: false
  } : null;
  
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
    currentTurn: turnInfo,
    difficulty: difficultyConfig,
    multiplayerSettings: mode === 'multi' ? {
      mode: 'competitive',
      enableSteal: true,
      enableTurnTimer: true
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
  const { selectedCards, gameMode, currentTurn, timerState } = gameState;
  
  // Single player mode - use regular logic
  if (gameMode === 'single') {
    return selectCardSinglePlayer(gameState, card);
  }
  
  // Multiplayer validations
  if (!currentTurn || currentTurn.currentPlayerIndex !== playerIndex) {
    return gameState; // Not this player's turn
  }
  
  // Start turn timer on first card selection
  let newGameState = gameState;
  if (timerState === 'not-started') {
    newGameState = {
      ...gameState,
      startTime: Date.now(),
      timerState: 'running',
      currentTurn: {
        ...currentTurn,
        turnStartTime: Date.now()
      }
    };
  }
  
  // Handle card selection/deselection
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
      return handleMultiplayerValidSet(newGameState, newSelectedCards, playerIndex);
    } else {
      return handleMultiplayerWrongGuess(newGameState, playerIndex);
    }
  }
  
  return {
    ...newGameState,
    selectedCards: newSelectedCards
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
  
  // Update player score
  const updatedPlayers = [...players];
  const basePoints = 1;
  const points = Math.round(basePoints * difficulty.scoreMultiplier);
  updatedPlayers[playerIndex].score += points;
  updatedPlayers[playerIndex].setsFound += 1;
  
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
  
  // Move to next player's turn (if not game over)
  const nextPlayerIndex = isGameOver ? playerIndex : (playerIndex + 1) % players.length;
  const newTurn = gameState.currentTurn ? {
    ...gameState.currentTurn,
    currentPlayerIndex: nextPlayerIndex,
    turnStartTime: Date.now(),
    canSteal: false
  } : null;
  
  // Update active player
  const newPlayers = updatedPlayers.map((p, i) => ({
    ...p,
    isActive: i === nextPlayerIndex
  }));
  
  return {
    ...gameState,
    board: newBoard,
    deck: newDeck,
    selectedCards: [],
    foundSets: [...foundSets, foundSet],
    players: newPlayers,
    currentTurn: newTurn,
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
  const { players, difficulty, currentTurn } = gameState;
  
  // Update player mistakes and apply penalty
  const updatedPlayers = [...players];
  updatedPlayers[playerIndex].mistakes += 1;
  
  if (difficulty.wrongGuessPenalty > 0) {
    updatedPlayers[playerIndex].score = Math.max(
      0, 
      updatedPlayers[playerIndex].score - difficulty.wrongGuessPenalty
    );
  }
  
  // Enable steal mode if configured
  const newTurn = currentTurn && gameState.multiplayerSettings?.enableSteal ? {
    ...currentTurn,
    canSteal: true
  } : currentTurn;
  
  return {
    ...gameState,
    selectedCards: [],
    players: updatedPlayers,
    currentTurn: newTurn
  };
}

/**
 * Handle turn timeout in multiplayer
 */
export function handleTurnTimeout(gameState: MultiplayerGameState): MultiplayerGameState {
  const { players, currentTurn } = gameState;
  
  if (!currentTurn || gameState.gameMode === 'single') return gameState;
  
  // Move to next player
  const nextPlayerIndex = (currentTurn.currentPlayerIndex + 1) % players.length;
  const newPlayers = players.map((p, i) => ({
    ...p,
    isActive: i === nextPlayerIndex
  }));
  
  const newTurn: TurnInfo = {
    currentPlayerIndex: nextPlayerIndex,
    turnStartTime: Date.now(),
    turnDuration: currentTurn.turnDuration,
    timeRemaining: currentTurn.turnDuration,
    canSteal: false
  };
  
  return {
    ...gameState,
    selectedCards: [],
    players: newPlayers,
    currentTurn: newTurn
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

/**
 * Get current player turn time remaining
 */
export function getTurnTimeRemaining(gameState: MultiplayerGameState): number {
  const { currentTurn, timerState } = gameState;
  
  if (!currentTurn || gameState.gameMode === 'single' || timerState !== 'running') {
    return 0;
  }
  
  const elapsed = Math.floor((Date.now() - currentTurn.turnStartTime) / 1000);
  return Math.max(0, currentTurn.turnDuration - elapsed);
}