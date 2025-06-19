import React, { useEffect, useState } from 'react';
import type { GameState } from '../types/game';

interface GameStatsProps {
  gameState: GameState;
  onNewGame: () => void;
  onAddCards: () => void;
  onUseHint: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onViewScoreboard: () => void;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  gameState, 
  onNewGame, 
  onAddCards, 
  onUseHint,
  onPauseTimer,
  onResumeTimer,
  onViewScoreboard
}) => {
  const { foundSets, deck, hints, startTime, timerState, pausedTime, isGameOver } = gameState;
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!isGameOver && timerState === 'running') {
      const interval = setInterval(() => {
        const currentTime = Math.floor((Date.now() - startTime + pausedTime) / 1000);
        setElapsedTime(currentTime);
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (timerState === 'paused') {
      // Keep the elapsed time static when paused
      setElapsedTime(Math.floor(pausedTime / 1000));
    }
  }, [startTime, pausedTime, timerState, isGameOver]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Welcome message for Chace */}
          <div className="text-2xl font-bold text-purple-600">
            Welcome, Chace! 💜
          </div>
          
          {/* Game stats */}
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Sets Found</div>
              <div className="text-2xl font-bold">{foundSets.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Cards Left</div>
              <div className="text-2xl font-bold">{deck.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Time {timerState === 'not-started' ? '⏱️' : timerState === 'paused' ? '⏸️' : '▶️'}
              </div>
              <div className="text-2xl font-bold">
                {timerState === 'not-started' ? '--:--' : formatTime(elapsedTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Hints Left</div>
              <div className="text-2xl font-bold">{hints}</div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={onNewGame}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            New Game
          </button>
          <button
            onClick={onAddCards}
            disabled={deck.length < 3}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300"
          >
            Add 3 Cards
          </button>
          <button
            onClick={onUseHint}
            disabled={hints === 0}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-300"
          >
            Hint ({hints})
          </button>
          {timerState !== 'not-started' && !isGameOver && (
            <button
              onClick={timerState === 'running' ? onPauseTimer : onResumeTimer}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {timerState === 'running' ? '⏸️ Pause' : '▶️ Resume'}
            </button>
          )}
          <button
            onClick={onViewScoreboard}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            🏆 Scoreboard
          </button>
        </div>
        
        {/* Game over message */}
        {isGameOver && (
          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <div className="text-xl font-bold text-purple-800">
              Congratulations! 🎉
            </div>
            <div className="text-purple-700">
              You found all {foundSets.length} sets in {formatTime(elapsedTime)}!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;