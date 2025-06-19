import React from 'react';
import type { MultiplayerGameState } from '../../types/multiplayer';

interface MultiplayerStatsProps {
  gameState: MultiplayerGameState;
}

const MultiplayerStats: React.FC<MultiplayerStatsProps> = ({ gameState }) => {
  const { players, gameMode } = gameState;
  
  if (gameMode === 'single') return null;
  
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-4">
      {/* Game Status */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-purple-800">
              Multiplayer Mode - Race to Find Sets!
            </span>
          </div>
          
          {/* Deck Status */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Cards Remaining: {gameState.deck.length}
            </span>
            <span className="text-sm text-gray-600">
              Sets Found: {gameState.foundSets.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Player Scores */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className="relative p-3 rounded-lg border-2 border-gray-200 transition-all hover:border-purple-300"
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