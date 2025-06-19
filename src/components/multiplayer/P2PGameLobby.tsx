import React, { useState, useEffect } from 'react';
import { p2pService, P2PPlayer } from '../../services/p2pService';
import type { DifficultyLevel } from '../../types/difficulty';

interface P2PGameLobbyProps {
  onStartGame: (isHost: boolean) => void;
  onCancel: () => void;
  difficulty: DifficultyLevel;
  maxPlayers: number;
}

const P2PGameLobby: React.FC<P2PGameLobbyProps> = ({ 
  onStartGame, 
  onCancel,
  difficulty,
  maxPlayers
}) => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [hostId, setHostId] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [players, setPlayers] = useState<P2PPlayer[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    // Setup callbacks
    p2pService.onPlayerUpdate((updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    p2pService.onConnectionChange((connected, error) => {
      setConnectionStatus(connected ? 'connected' : 'error');
      if (error) setErrorMessage(error);
    });

    // Get peer ID when ready
    const checkPeerId = setInterval(() => {
      const id = p2pService.getMyPeerId();
      if (id) {
        setMyPeerId(id);
        clearInterval(checkPeerId);
      }
    }, 100);

    return () => {
      clearInterval(checkPeerId);
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim() || !myPeerId) return;
    
    setIsCreatingRoom(true);
    try {
      // Create a dummy game state for now - will be replaced with actual game creation
      const dummyGameState: any = {
        players: [{
          id: 'player-0',
          name: playerName,
          color: '#3B82F6',
          score: 0,
          setsFound: 0,
          mistakes: 0,
          isActive: true,
          isConnected: true
        }],
        gameMode: 'multi',
        difficulty: { level: difficulty }
      };
      
      const roomId = await p2pService.createRoom(playerName, dummyGameState);
      setMode('create');
      setConnectionStatus('connected');
    } catch (error) {
      setErrorMessage('Failed to create room');
      setConnectionStatus('error');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !hostId.trim()) return;
    
    setIsJoiningRoom(true);
    try {
      await p2pService.joinRoom(hostId, playerName);
      setMode('join');
      setConnectionStatus('connected');
    } catch (error) {
      setErrorMessage('Failed to join room. Check the Game ID and try again.');
      setConnectionStatus('error');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleStartGame = () => {
    if (p2pService.getIsHost() && players.length >= 2) {
      onStartGame(true);
    }
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(myPeerId);
  };

  if (!mode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-purple-800 mb-6">Online Multiplayer</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCreateRoom}
              disabled={!playerName.trim() || !myPeerId || isCreatingRoom}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isCreatingRoom ? 'Creating...' : 'Create Game Room'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                placeholder="Enter Game ID to join"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 mb-2"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !hostId.trim() || isJoiningRoom}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isJoiningRoom ? 'Joining...' : 'Join Game Room'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            onClick={onCancel}
            className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">
          {mode === 'create' ? 'Game Room Created' : 'Joined Game Room'}
        </h2>

        {mode === 'create' && (
          <div className="mb-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Your Game ID:</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono font-bold text-purple-800 break-all">
                  {myPeerId}
                </code>
                <button
                  onClick={copyGameId}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Share this ID with friends to let them join your game!
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Connected Players ({players.length}/{maxPlayers})
          </h3>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.peerId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium">{player.name}</span>
                  {index === 0 && (
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      Host
                    </span>
                  )}
                </div>
                {player.latency !== undefined && (
                  <span className="text-xs text-gray-500">
                    {player.latency}ms
                  </span>
                )}
              </div>
            ))}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="p-3 bg-gray-50 rounded-lg text-gray-400 text-center"
              >
                Waiting for player...
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {p2pService.getIsHost() ? (
            <>
              <button
                onClick={handleStartGame}
                disabled={players.length < 2}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Start Game ({players.length}/2 minimum)
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="flex-1 text-center">
              <div className="py-3 text-gray-600">
                Waiting for host to start the game...
              </div>
              <button
                onClick={onCancel}
                className="w-full py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                Leave Room
              </button>
            </div>
          )}
        </div>

        {connectionStatus === 'error' && errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default P2PGameLobby;