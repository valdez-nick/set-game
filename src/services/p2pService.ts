import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { MultiplayerGameState, Player } from '../types/multiplayer';

// P2P Message types
export type P2PMessage = 
  | { type: 'PLAYER_JOINED'; player: Player; peerId: string }
  | { type: 'GAME_STARTED'; state: MultiplayerGameState }
  | { type: 'CARD_SELECTED'; cardId: string; playerId: string }
  | { type: 'TURN_COMPLETE'; nextPlayer: number }
  | { type: 'GAME_STATE_UPDATE'; state: MultiplayerGameState }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'REQUEST_STATE' }
  | { type: 'PING' }
  | { type: 'PONG' };

export interface P2PPlayer extends Player {
  peerId: string;
  connection?: DataConnection;
  latency?: number;
}

type StateUpdateCallback = (state: MultiplayerGameState) => void;
type PlayerUpdateCallback = (players: P2PPlayer[]) => void;
type ConnectionCallback = (connected: boolean, error?: string) => void;

export class P2PGameService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private isHost: boolean = false;
  private hostId: string | null = null;
  private gameState: MultiplayerGameState | null = null;
  private players: P2PPlayer[] = [];
  private myPeerId: string = '';
  private myPlayerId: string = '';
  
  // Callbacks
  private stateUpdateCallbacks: StateUpdateCallback[] = [];
  private playerUpdateCallbacks: PlayerUpdateCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  
  // Latency tracking
  private pingIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private pingTimestamps: Map<string, number> = new Map();

  constructor() {
    // Initialize with a custom server or use the default
    this.peer = new Peer({
      // Can add custom STUN/TURN servers here for better connectivity
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    this.setupPeerHandlers();
  }

  private setupPeerHandlers() {
    if (!this.peer) return;

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      console.log('My peer ID:', id);
    });

    this.peer.on('connection', (conn) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.notifyConnectionCallbacks(false, err.message);
    });
  }

  private handleIncomingConnection(conn: DataConnection) {
    console.log('Incoming connection from:', conn.peer);
    
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      
      // If we're host, send current game state
      if (this.isHost && this.gameState) {
        conn.send({ type: 'GAME_STARTED', state: this.gameState });
      }
      
      this.setupConnectionHandlers(conn);
      this.startPingInterval(conn.peer);
    });
  }

  private setupConnectionHandlers(conn: DataConnection) {
    conn.on('data', (data: any) => {
      this.handleMessage(data as P2PMessage, conn.peer);
    });

    conn.on('close', () => {
      this.handlePlayerDisconnect(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.handlePlayerDisconnect(conn.peer);
    });
  }

  private handleMessage(message: P2PMessage, fromPeerId: string) {
    switch (message.type) {
      case 'PLAYER_JOINED':
        if (this.isHost) {
          this.handlePlayerJoined(message.player, fromPeerId);
        }
        break;
        
      case 'GAME_STATE_UPDATE':
        if (!this.isHost) {
          this.gameState = message.state;
          this.notifyStateCallbacks(message.state);
        }
        break;
        
      case 'CARD_SELECTED':
        if (this.isHost) {
          this.handleCardSelection(message.cardId, message.playerId);
        }
        break;
        
      case 'REQUEST_STATE':
        if (this.isHost && this.gameState) {
          const conn = this.connections.get(fromPeerId);
          conn?.send({ type: 'GAME_STATE_UPDATE', state: this.gameState });
        }
        break;
        
      case 'PING':
        const conn = this.connections.get(fromPeerId);
        conn?.send({ type: 'PONG' });
        break;
        
      case 'PONG':
        this.handlePong(fromPeerId);
        break;
    }
  }

  // Host methods
  async createRoom(playerName: string, gameState: MultiplayerGameState): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'));
        return;
      }

      this.isHost = true;
      this.hostId = this.myPeerId;
      this.gameState = gameState;
      
      // Add self as first player
      this.myPlayerId = 'player-0';
      this.players = [{
        ...gameState.players[0],
        peerId: this.myPeerId,
        name: playerName
      }];
      
      this.notifyConnectionCallbacks(true);
      resolve(this.myPeerId);
    });
  }

  async joinRoom(hostId: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'));
        return;
      }

      const conn = this.peer.connect(hostId, { reliable: true });
      
      conn.on('open', () => {
        this.hostId = hostId;
        this.connections.set(hostId, conn);
        this.setupConnectionHandlers(conn);
        
        // Send join message
        const player: Player = {
          id: `player-${Date.now()}`,
          name: playerName,
          color: '#3B82F6', // Will be assigned by host
          score: 0,
          setsFound: 0,
          mistakes: 0,
          isConnected: true
        };
        
        this.myPlayerId = player.id;
        conn.send({ type: 'PLAYER_JOINED', player, peerId: this.myPeerId });
        
        this.startPingInterval(hostId);
        this.notifyConnectionCallbacks(true);
        resolve();
      });
      
      conn.on('error', (err) => {
        reject(err);
      });
      
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });
  }

  private handlePlayerJoined(player: Player, peerId: string) {
    if (!this.isHost || !this.gameState) return;
    
    // Assign player color based on index
    const playerColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];
    const playerIndex = this.players.length;
    
    const p2pPlayer: P2PPlayer = {
      ...player,
      color: playerColors[playerIndex % playerColors.length],
      peerId,
      connection: this.connections.get(peerId)
    };
    
    this.players.push(p2pPlayer);
    
    // Update game state
    this.gameState = {
      ...this.gameState,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        score: p.score,
        setsFound: p.setsFound,
        mistakes: p.mistakes,
        isConnected: p.isConnected
      }))
    };
    
    // Broadcast updated state to all players
    this.broadcastState();
    this.notifyPlayerCallbacks(this.players);
  }

  private handlePlayerDisconnect(peerId: string) {
    this.connections.delete(peerId);
    this.stopPingInterval(peerId);
    
    if (this.isHost) {
      // Mark player as disconnected
      const player = this.players.find(p => p.peerId === peerId);
      if (player) {
        player.isConnected = false;
        this.notifyPlayerCallbacks(this.players);
        this.broadcastState();
      }
    } else if (peerId === this.hostId) {
      // Host disconnected
      this.notifyConnectionCallbacks(false, 'Host disconnected');
      this.disconnect();
    }
  }

  private handleCardSelection(cardId: string, playerId: string) {
    // This will be implemented by the game logic
    // The host validates and updates the game state
    console.log('Card selected:', cardId, 'by player:', playerId);
  }

  broadcastState() {
    if (!this.isHost || !this.gameState) return;
    
    const message: P2PMessage = { type: 'GAME_STATE_UPDATE', state: this.gameState };
    
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
    
    // Also notify local callbacks
    this.notifyStateCallbacks(this.gameState);
  }

  sendCardSelection(cardId: string) {
    if (!this.myPlayerId) return;
    
    const message: P2PMessage = {
      type: 'CARD_SELECTED',
      cardId,
      playerId: this.myPlayerId
    };
    
    if (this.isHost) {
      // Handle locally
      this.handleCardSelection(cardId, this.myPlayerId);
    } else {
      // Send to host
      const hostConn = this.connections.get(this.hostId!);
      hostConn?.send(message);
    }
  }

  // Latency management
  private startPingInterval(peerId: string) {
    const interval = setInterval(() => {
      const conn = this.connections.get(peerId);
      if (conn && conn.open) {
        this.pingTimestamps.set(peerId, Date.now());
        conn.send({ type: 'PING' });
      }
    }, 5000); // Ping every 5 seconds
    
    this.pingIntervals.set(peerId, interval);
  }

  private stopPingInterval(peerId: string) {
    const interval = this.pingIntervals.get(peerId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(peerId);
    }
  }

  private handlePong(peerId: string) {
    const timestamp = this.pingTimestamps.get(peerId);
    if (timestamp) {
      const latency = Date.now() - timestamp;
      const player = this.players.find(p => p.peerId === peerId);
      if (player) {
        player.latency = latency;
        this.notifyPlayerCallbacks(this.players);
      }
    }
  }

  // Callbacks
  onStateUpdate(callback: StateUpdateCallback) {
    this.stateUpdateCallbacks.push(callback);
  }

  onPlayerUpdate(callback: PlayerUpdateCallback) {
    this.playerUpdateCallbacks.push(callback);
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
  }

  private notifyStateCallbacks(state: MultiplayerGameState) {
    this.stateUpdateCallbacks.forEach(cb => cb(state));
  }

  private notifyPlayerCallbacks(players: P2PPlayer[]) {
    this.playerUpdateCallbacks.forEach(cb => cb(players));
  }

  private notifyConnectionCallbacks(connected: boolean, error?: string) {
    this.connectionCallbacks.forEach(cb => cb(connected, error));
  }

  // Utility methods
  disconnect() {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    
    this.pingIntervals.forEach(interval => clearInterval(interval));
    this.pingIntervals.clear();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    this.isHost = false;
    this.hostId = null;
    this.gameState = null;
    this.players = [];
  }

  getMyPeerId(): string {
    return this.myPeerId;
  }

  getIsHost(): boolean {
    return this.isHost;
  }

  getPlayers(): P2PPlayer[] {
    return this.players;
  }

  updateGameState(state: MultiplayerGameState) {
    if (this.isHost) {
      this.gameState = state;
      this.broadcastState();
    }
  }
}

// Singleton instance
export const p2pService = new P2PGameService();