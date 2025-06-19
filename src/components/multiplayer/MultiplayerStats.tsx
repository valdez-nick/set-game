import React, { useEffect, useState } from 'react';
import type { MultiplayerGameState } from '../../types/multiplayer';
import { getTurnTimeRemaining } from '../../game/multiplayerLogic';

interface MultiplayerStatsProps {
  gameState: MultiplayerGameState;
  onTimeOut?: () => void;
}

const MultiplayerStats: React.FC<MultiplayerStatsProps> = ({ gameState, onTimeOut }) => {
  const { players, currentTurn, gameMode } = gameState;
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    if (gameMode === 'single' || !currentTurn) return;
    
    const interval = setInterval(() => {
      const remaining = getTurnTimeRemaining(gameState);
      setTimeRemaining(remaining);
      
      if (remaining === 0 && onTimeOut) {
        onTimeOut();
      }
    }, 100); // Update more frequently for smoother countdown
    
    return () => clearInterval(interval);
  }, [gameState, currentTurn, gameMode, onTimeOut]);
  
  if (gameMode === 'single') return null;
  
  const activePlayer = players.find(p => p.isActive);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-4">
      {/* Active Player and Timer */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: activePlayer?.color }}
            />
            <span className="text-lg font-semibold">
              {activePlayer?.name}'s Turn
            </span>
            {currentTurn?.canSteal && (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Steal Mode Active!
              </span>
            )}
          </div>
          
          {/* Turn Timer */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Time:</span>
            <div className={`
              text-2xl font-bold font-mono
              ${timeRemaining <= 5 ? 'text-red-600 animate-pulse' : 'text-gray-800'}
            `}>
              0:{timeRemaining.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Scores */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${player.isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
              `}
            >
              {/* Rank Badge */}
              {index === 0 && player.score > 0 && (
                <div className="absolute -top-2 -right-2 text-xl">
                  👑
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-semibold text-sm truncate">
                  {player.name}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{player.score}</div>
                <div className="text-xs text-gray-600">
                  {player.setsFound} sets • {player.mistakes} mistakes
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerStats;