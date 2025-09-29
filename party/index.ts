import type * as Party from "partykit/server";

interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  connection: Party.Connection;
}

interface RoomState {
  roomCode: string;
  roomName: string;
  gridSize: number;
  maxPlayers: number;
  template: string;
  players: Map<string, Player>;
  gameStarted: boolean;
}

export default class BingoServer implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: false,
  };

  constructor(readonly room: Party.Room) {}

  // Room state
  state: RoomState = {
    roomCode: "",
    roomName: "",
    gridSize: 5,
    maxPlayers: 8,
    template: "Office Meeting Bingo",
    players: new Map(),
    gameStarted: false,
  };

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`🔌 Player connected: ${conn.id}`);
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      console.log(`📥 Message from ${sender.id}:`, data.type);

      switch (data.type) {
        case "create-room":
          this.handleCreateRoom(sender, data);
          break;

        case "join-room":
          this.handleJoinRoom(sender, data);
          break;

        case "toggle-ready":
          this.handleToggleReady(sender, data);
          break;

        case "start-game":
          this.handleStartGame(sender);
          break;

        case "leave-room":
          this.handleLeaveRoom(sender);
          break;

        default:
          console.log("⚠️ Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      );
    }
  }

  handleCreateRoom(sender: Party.Connection, data: any) {
    // Initialize room
    this.state.roomCode = this.room.id;
    this.state.roomName = data.roomName || `Room ${this.room.id}`;
    this.state.gridSize = data.gridSize || 5;
    this.state.template = "Office Meeting Bingo";

    // Add creator as first player and host
    const player: Player = {
      id: sender.id,
      name: data.playerName,
      isReady: false,
      isHost: true,
      connection: sender,
    };

    this.state.players.set(sender.id, player);

    console.log(
      `🎉 Room created: ${this.state.roomCode} by ${data.playerName}`,
    );

    // Send confirmation to creator
    sender.send(
      JSON.stringify({
        type: "room-created",
        playerId: sender.id,
        roomCode: this.state.roomCode,
        roomName: this.state.roomName,
        gridSize: this.state.gridSize,
        maxPlayers: this.state.maxPlayers,
        template: this.state.template,
        players: this.getPlayersArray(),
      }),
    );
  }

  handleJoinRoom(sender: Party.Connection, data: any) {
    // Check if room is full
    if (this.state.players.size >= this.state.maxPlayers) {
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Room is full",
        }),
      );
      return;
    }

    // Check if game already started
    if (this.state.gameStarted) {
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Game already started",
        }),
      );
      return;
    }

    // Add player
    const player: Player = {
      id: sender.id,
      name: data.playerName,
      isReady: false,
      isHost: false,
      connection: sender,
    };

    this.state.players.set(sender.id, player);

    console.log(`👋 Player joined: ${data.playerName}`);

    // Send confirmation to joining player
    sender.send(
      JSON.stringify({
        type: "player-joined",
        playerId: sender.id,
        roomDetails: {
          roomCode: this.state.roomCode,
          roomName: this.state.roomName,
          template: this.state.template,
          gridSize: this.state.gridSize,
          maxPlayers: this.state.maxPlayers,
        },
        players: this.getPlayersArray(),
      }),
    );

    // Notify all other players
    this.broadcastToOthers(sender.id, {
      type: "players-updated",
      players: this.getPlayersArray(),
    });
  }

  handleToggleReady(sender: Party.Connection, data: any) {
    const player = this.state.players.get(sender.id);
    if (!player) return;

    player.isReady = data.isReady;
    console.log(`✓ ${player.name} ready status: ${player.isReady}`);

    // Broadcast to all players
    this.broadcast({
      type: "player-ready-changed",
      playerId: sender.id,
      isReady: player.isReady,
    });
  }

  handleStartGame(sender: Party.Connection) {
    const player = this.state.players.get(sender.id);
    if (!player?.isHost) {
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Only host can start the game",
        }),
      );
      return;
    }

    // Check if all players are ready
    const allReady = Array.from(this.state.players.values()).every(
      (p) => p.isReady,
    );

    if (!allReady) {
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Not all players are ready",
        }),
      );
      return;
    }

    this.state.gameStarted = true;
    console.log("🎮 Game starting!");

    // Broadcast game start to all players
    this.broadcast({
      type: "game-started",
    });
  }

  handleLeaveRoom(sender: Party.Connection) {
    const player = this.state.players.get(sender.id);
    if (!player) return;

    console.log(`👋 ${player.name} left the room`);

    // If host leaves, assign new host
    if (player.isHost && this.state.players.size > 1) {
      this.state.players.delete(sender.id);
      const newHost = Array.from(this.state.players.values())[0];
      if (newHost) {
        newHost.isHost = true;
      }
    } else {
      this.state.players.delete(sender.id);
    }

    // Notify remaining players
    this.broadcast({
      type: "players-updated",
      players: this.getPlayersArray(),
    });
  }

  onClose(connection: Party.Connection) {
    console.log(`🔌 Player disconnected: ${connection.id}`);
    this.handleLeaveRoom(connection);
  }

  // Helper methods
  getPlayersArray() {
    return Array.from(this.state.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      isReady: p.isReady,
      isHost: p.isHost,
    }));
  }

  broadcast(message: any) {
    const payload = JSON.stringify(message);
    this.state.players.forEach((player) => {
      player.connection.send(payload);
    });
  }

  broadcastToOthers(excludeId: string, message: any) {
    const payload = JSON.stringify(message);
    this.state.players.forEach((player) => {
      if (player.id !== excludeId) {
        player.connection.send(payload);
      }
    });
  }
}
