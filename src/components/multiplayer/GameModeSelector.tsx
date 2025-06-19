import React, { useState } from 'react';
import type { DifficultyLevel } from '../../types/difficulty';

interface GameModeSelectorProps {
  onStartGame: (mode: 'single' | 'multi', players: PlayerConfig[], difficulty: DifficultyLevel) => void;
  onCancel: () => void;
}

export interface PlayerConfig {
  name: string;
  color: string;
}

const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']; // Blue, Red, Green, Yellow

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onStartGame, onCancel }) => {
  const [selectedMode, setSelectedMode] = useState<'single' | 'multi' | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'Player 1', color: PLAYER_COLORS[0] },
    { name: 'Player 2', color: PLAYER_COLORS[1] },
    { name: 'Player 3', color: PLAYER_COLORS[2] },
    { name: 'Player 4', color: PLAYER_COLORS[3] },
  ]);

  const handleModeSelect = (mode: 'single' | 'multi') => {
    setSelectedMode(mode);
    if (mode === 'single') {
      setPlayers([{ name: 'Chace', color: PLAYER_COLORS[0] }]);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    if (selectedMode) {
      const activePlayers = selectedMode === 'single' 
        ? [players[0]] 
        : players.slice(0, playerCount);
      onStartGame(selectedMode, activePlayers, difficulty);
    }
  };

  const getDifficultyDescription = (level: DifficultyLevel) => {
    switch (level) {
      case 'easy':
        return 'More sets available • Visual hints • 45s turns • 5 hints';
      case 'normal':
        return 'Standard gameplay • 30s turns • 3 hints';
      case 'hard':
        return 'Fewer sets • No visual hints • 20s turns • No hints';
      case 'expert':
        return 'Minimal sets • Penalties • 15s turns • No hints';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">
            Welcome to Set! 💜
          </h2>

          {/* Mode Selection */}
          {!selectedMode && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Choose Game Mode</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleModeSelect('single')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <div className="text-4xl mb-2">🎮</div>
                  <div className="text-lg font-semibold">Single Player</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Play solo and track your progress
                  </div>
                </button>
                <button
                  onClick={() => handleModeSelect('multi')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <div className="text-4xl mb-2">👥</div>
                  <div className="text-lg font-semibold">Multiplayer</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Compete with 2-4 players
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Configuration */}
          {selectedMode && (
            <div className="space-y-6">
              {/* Difficulty Selection */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Select Difficulty</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['easy', 'normal', 'hard', 'expert'] as DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        difficulty === level 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {level === 'easy' && '🟢'}
                        {level === 'normal' && '🟡'}
                        {level === 'hard' && '🔴'}
                        {level === 'expert' && '🟣'}
                      </div>
                      <div className="font-semibold capitalize">{level}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {getDifficultyDescription(difficulty)}
                </div>
              </div>

              {/* Multiplayer Configuration */}
              {selectedMode === 'multi' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Number of Players</h3>
                  <div className="flex gap-3 mb-4">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setPlayerCount(num)}
                        className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                          playerCount === num 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {num} Players
                      </button>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Player Names</h3>
                  <div className="space-y-3">
                    {Array.from({ length: playerCount }, (_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: PLAYER_COLORS[i] }}
                        />
                        <input
                          type="text"
                          value={players[i].name}
                          onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                          placeholder={`Player ${i + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Player Name */}
              {selectedMode === 'single' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Player Name</h3>
                  <input
                    type="text"
                    value={players[0].name}
                    onChange={(e) => handlePlayerNameChange(0, e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameModeSelector;