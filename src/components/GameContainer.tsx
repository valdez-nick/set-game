import React, { useState, useEffect } from 'react';
import type { Card } from '../types/game';
import type { MultiplayerGameState } from '../types/multiplayer';
import type { DifficultyLevel } from '../types/difficulty';
import { initializeMultiplayerGame, selectMultiplayerCard } from '../game/multiplayerLogic';
import { addMoreCards, useHint, pauseTimer, resumeTimer, saveCurrentGameResult } from '../game/gameLogic';
import { getVisualHints } from '../game/difficultyManager';
import GameBoard from './GameBoard';
import GameStats from './GameStats';
import MultiplayerStats from './multiplayer/MultiplayerStats';
import GameModeSelector from './multiplayer/GameModeSelector';
import type { PlayerConfig } from './multiplayer/GameModeSelector';
import HamburgerMenu from './navigation/HamburgerMenu';
import Scoreboard from './Scoreboard';
import P2PGameLobby from './multiplayer/P2PGameLobby';

const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [hintedCards, setHintedCards] = useState<Card[]>([]);
  const [visualHints, setVisualHints] = useState<Set<string>>(new Set());
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showP2PLobby, setShowP2PLobby] = useState(false);
  const [onlineDifficulty, setOnlineDifficulty] = useState<DifficultyLevel>('normal');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Initialize with mode selector
  useEffect(() => {
    if (!gameState && !showModeSelector) {
      setShowModeSelector(true);
    }
  }, [gameState, showModeSelector]);

  // Update visual hints for easy mode
  useEffect(() => {
    if (gameState && gameState.difficulty.visualAssist) {
      const hints = getVisualHints(gameState.board, gameState.difficulty);
      setVisualHints(hints);
    } else {
      setVisualHints(new Set());
    }
  }, [gameState?.board, gameState?.difficulty]);

  // Clear hints after timeout
  useEffect(() => {
    if (hintedCards.length > 0) {
      const timer = setTimeout(() => {
        setHintedCards([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hintedCards]);


  // Start new game with selected mode
  const handleStartGame = (
    mode: 'single' | 'multi',
    players: PlayerConfig[],
    difficulty: DifficultyLevel
  ) => {
    const newGameState = initializeMultiplayerGame(mode, players, difficulty);
    setGameState(newGameState);
    setShowModeSelector(false);
    setCurrentPlayerIndex(0);
  };

  // Handle online game mode selection
  const handleStartOnlineGame = (difficulty: DifficultyLevel) => {
    setOnlineDifficulty(difficulty);
    setShowModeSelector(false);
    setShowP2PLobby(true);
  };

  // Handle P2P game start
  const handleP2PGameStart = () => {
    // For now, we'll initialize a multiplayer game
    // In a full implementation, this would sync with other players
    const players: PlayerConfig[] = [
      { name: 'Player 1', color: '#3B82F6' },
      { name: 'Player 2', color: '#EF4444' }
    ];
    const newGameState = initializeMultiplayerGame('multi', players, onlineDifficulty);
    setGameState(newGameState);
    setShowP2PLobby(false);
    setCurrentPlayerIndex(0);
  };

  // Handle P2P lobby cancel
  const handleP2PLobbyCancel = () => {
    setShowP2PLobby(false);
    setShowModeSelector(true);
  };

  // Handle card click with multiplayer support
  const handleCardClick = (card: Card) => {
    if (!gameState) return;

    const playerIndex = gameState.gameMode === 'single' ? 0 : currentPlayerIndex;
    const newGameState = selectMultiplayerCard(gameState, card, playerIndex);
    setGameState(newGameState);

    // Clear hints when card is clicked
    if (hintedCards.length > 0) {
      setHintedCards([]);
    }

  };

  // Handle new game
  const handleNewGame = () => {
    if (gameState) {
      // Save current game state
      saveCurrentGameResult(gameState);
    }
    setShowModeSelector(true);
    setGameState(null);
    setHintedCards([]);
  };

  // Handle add cards
  const handleAddCards = () => {
    if (!gameState) return;
    const newGameState = addMoreCards(gameState) as MultiplayerGameState;
    setGameState(newGameState);
  };

  // Handle use hint
  const handleUseHint = () => {
    if (!gameState) return;
    const { gameState: newGameState, hint } = useHint(gameState);
    setGameState(newGameState as MultiplayerGameState);
    if (hint) {
      setHintedCards(hint);
    }
  };

  // Handle pause/resume
  const handlePauseTimer = () => {
    if (!gameState) return;
    const newGameState = pauseTimer(gameState) as MultiplayerGameState;
    setGameState(newGameState);
  };

  const handleResumeTimer = () => {
    if (!gameState) return;
    const newGameState = resumeTimer(gameState) as MultiplayerGameState;
    setGameState(newGameState);
  };

  // Handle view scoreboard
  const handleViewScoreboard = () => {
    if (gameState) {
      saveCurrentGameResult(gameState);
    }
    setShowScoreboard(true);
  };

  const handleBackToGame = () => {
    setShowScoreboard(false);
  };

  // Handle game mode select from menu
  const handleGameModeSelect = () => {
    if (gameState) {
      saveCurrentGameResult(gameState);
    }
    setShowModeSelector(true);
  };

  // Show mode selector
  if (showModeSelector) {
    return (
      <GameModeSelector
        onStartGame={handleStartGame}
        onStartOnlineGame={handleStartOnlineGame}
        onCancel={() => {
          if (gameState) {
            setShowModeSelector(false);
          }
        }}
      />
    );
  }

  // Show P2P lobby
  if (showP2PLobby) {
    return (
      <P2PGameLobby
        onStartGame={handleP2PGameStart}
        onCancel={handleP2PLobbyCancel}
        difficulty={onlineDifficulty}
        maxPlayers={4}
      />
    );
  }

  // Show scoreboard
  if (showScoreboard) {
    return <Scoreboard onBackToGame={handleBackToGame} />;
  }

  // Show game
  if (!gameState) {
    return <div>Loading...</div>;
  }

  // Combine hinted cards with visual hints
  const allHintedCardIds = new Set([
    ...hintedCards.map(c => c.id),
    ...visualHints
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <HamburgerMenu
        onNewGame={handleNewGame}
        onGameModeSelect={handleGameModeSelect}
        onViewScoreboard={handleViewScoreboard}
        currentGameMode={gameState.gameMode}
        isGameActive={gameState.timerState !== 'not-started'}
      />

      <div className="container mx-auto py-8 pt-20">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-8">
          Set Card Game
        </h1>

        {/* Multiplayer Stats */}
        {gameState.gameMode === 'multi' && (
          <>
            <MultiplayerStats
              gameState={gameState}
            />
            {/* Player Selector for Local Multiplayer */}
            <div className="w-full max-w-6xl mx-auto px-4 mb-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Current Player:</span>
                  <div className="flex gap-2">
                    {gameState.players.map((player, index) => (
                      <button
                        key={player.id}
                        onClick={() => setCurrentPlayerIndex(index)}
                        className={`
                          px-4 py-2 rounded-lg font-medium transition-all
                          ${currentPlayerIndex === index 
                            ? 'text-white shadow-lg transform scale-105' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                        style={currentPlayerIndex === index ? {
                          backgroundColor: player.color
                        } : {}}
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Single Player Stats */}
        {gameState.gameMode === 'single' && (
          <GameStats
            gameState={gameState}
            onNewGame={handleNewGame}
            onAddCards={handleAddCards}
            onUseHint={handleUseHint}
            onPauseTimer={handlePauseTimer}
            onResumeTimer={handleResumeTimer}
            onViewScoreboard={handleViewScoreboard}
          />
        )}

        {/* Game Board */}
        <GameBoard
          gameState={gameState}
          onCardClick={handleCardClick}
          hintedCards={Array.from(allHintedCardIds)
            .map(id => gameState.board.find(c => c.id === id))
            .filter(Boolean) as Card[]}
        />

        {/* Instructions - Updated for difficulty */}
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3">How to Play</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Find sets of 3 cards where each feature is either all the same or all different</li>
            <li>• Features: Number (1-3), Shape (diamond, oval, squiggle), Shading (solid, striped, outline), and Color (red, green, purple)</li>
            <li>• Click cards to select them - when you select 3 cards, they'll automatically be checked</li>
            {gameState.gameMode === 'multi' && (
              <>
                <li>• All players play simultaneously - race to find sets!</li>
                <li>• Each player's selections show in their color</li>
                <li>• Score multiplier: {gameState.difficulty.scoreMultiplier}x for {gameState.difficulty.level} difficulty</li>
              </>
            )}
            {gameState.gameMode === 'single' && (
              <>
                <li>• Timer starts when you click your first card - you can pause and resume anytime!</li>
                <li>• Use hints if you're stuck, or add more cards if no sets are visible</li>
              </>
            )}
            <li>• Check your progress and compete with yourself on the scoreboard!</li>
          </ul>
          
          {/* Difficulty Info */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-800">
              <span className="font-semibold">Difficulty: </span>
              <span className="capitalize">{gameState.difficulty.level}</span>
              {gameState.difficulty.level === 'easy' && ' - Visual hints enabled! 🟢'}
              {gameState.difficulty.level === 'expert' && ' - Maximum challenge! 🟣'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameContainer;