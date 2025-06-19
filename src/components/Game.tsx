import React, { useState, useEffect } from 'react';
import type { GameState, Card } from '../types/game';
import { initializeGame, selectCard, addMoreCards, useHint, pauseTimer, resumeTimer } from '../game/gameLogic';
import GameBoard from './GameBoard';
import GameStats from './GameStats';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [hintedCards, setHintedCards] = useState<Card[]>([]);
  
  // Clear hints after 3 seconds
  useEffect(() => {
    if (hintedCards.length > 0) {
      const timer = setTimeout(() => {
        setHintedCards([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hintedCards]);
  
  const handleCardClick = (card: Card) => {
    const newGameState = selectCard(gameState, card);
    setGameState(newGameState);
    
    // Clear hints when a card is clicked
    if (hintedCards.length > 0) {
      setHintedCards([]);
    }
  };
  
  const handleNewGame = () => {
    setGameState(initializeGame());
    setHintedCards([]);
  };
  
  const handleAddCards = () => {
    const newGameState = addMoreCards(gameState);
    setGameState(newGameState);
  };
  
  const handleUseHint = () => {
    const { gameState: newGameState, hint } = useHint(gameState);
    setGameState(newGameState);
    if (hint) {
      setHintedCards(hint);
    }
  };
  
  const handlePauseTimer = () => {
    const newGameState = pauseTimer(gameState);
    setGameState(newGameState);
  };
  
  const handleResumeTimer = () => {
    const newGameState = resumeTimer(gameState);
    setGameState(newGameState);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-8">
          Set Card Game
        </h1>
        
        <GameStats
          gameState={gameState}
          onNewGame={handleNewGame}
          onAddCards={handleAddCards}
          onUseHint={handleUseHint}
          onPauseTimer={handlePauseTimer}
          onResumeTimer={handleResumeTimer}
        />
        
        <GameBoard
          gameState={gameState}
          onCardClick={handleCardClick}
          hintedCards={hintedCards}
        />
        
        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3">How to Play</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Find sets of 3 cards where each feature is either all the same or all different</li>
            <li>• Features: Number (1-3), Shape (diamond, oval, squiggle), Shading (solid, striped, outline), and Color (red, green, purple)</li>
            <li>• Click cards to select them - when you select 3 cards, they'll automatically be checked</li>
            <li>• Timer starts when you click your first card - you can pause and resume anytime!</li>
            <li>• Use hints if you're stuck, or add more cards if no sets are visible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Game;