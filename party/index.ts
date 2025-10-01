import type * as Party from "partykit/server";
import type { BingoItem } from "../src/types/bingo";
import type {
  ServerPlayer,
  RoomState,
  CreateRoomData,
  JoinRoomData,
  MarkCellData,
  ToggleReadyData,
} from "../src/types/game";
import { checkWinningLines } from "../src/utils";

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
    template: "BU Meeting",
    templateItems: [],
    players: new Map(),
    gameStarted: false,
    playerGameStates: new Map(),
  };

  onConnect(conn: Party.Connection) {
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

        case "mark-cell":
          this.handleMarkCell(sender, data);
          break;

        case "end-game":
          this.handleEndGame(sender);
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

  handleCreateRoom(sender: Party.Connection, data: CreateRoomData) {
    // Initialize room
    this.state.roomCode = this.room.id;
    this.state.roomName = data.roomName || `Room ${this.room.id}`;
    this.state.gridSize = data.gridSize || 5;
    this.state.template = data.templateName || "BU Meeting";
    this.state.templateItems = data.templateItems || this.generateBingoItems();

    // Add creator as first player and host
    const player: ServerPlayer = {
      id: sender.id,
      name: data.playerName,
      isReady: false,
      isHost: true,
      connection: sender,
    };

    this.state.players.set(sender.id, player);

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

  handleJoinRoom(sender: Party.Connection, data: JoinRoomData) {
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
    const player: ServerPlayer = {
      id: sender.id,
      name: data.playerName,
      isReady: false,
      isHost: false,
      connection: sender,
    };

    this.state.players.set(sender.id, player);

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

  handleToggleReady(sender: Party.Connection, data: ToggleReadyData) {
    const player = this.state.players.get(sender.id);
    if (!player) return;

    player.isReady = data.isReady;

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
      (player) => player.isReady,
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

    // Generate bingo cards for each player using template items
    const baseBingoItems =
      this.state.templateItems.length > 0
        ? this.state.templateItems
        : this.generateBingoItems();
    const cellCount = this.state.gridSize * this.state.gridSize;
    const needsFreeSpace = this.state.gridSize % 2 === 1;
    const centerIndex = Math.floor(cellCount / 2);

    this.state.players.forEach((player) => {
      // Filter: only included items, exclude FREE
      const itemsWithoutFree = baseBingoItems.filter(
        (item) => item.included && item.text !== "FREE",
      );

      // Ensure we have enough items
      const itemsNeeded = needsFreeSpace ? cellCount - 1 : cellCount;
      if (itemsWithoutFree.length < itemsNeeded) {
        console.error(
          `Not enough items! Need ${itemsNeeded}, have ${itemsWithoutFree.length}`,
        );
      }

      const shuffled = this.shuffleArray([...itemsWithoutFree]);

      let playerItems: BingoItem[];
      let initialMarkedCells: number[];

      if (needsFreeSpace) {
        // Take items needed minus one for FREE space
        const selectedItems = shuffled.slice(0, cellCount - 1);
        // Insert FREE at center
        selectedItems.splice(centerIndex, 0, {
          id: "free",
          text: "FREE",
          included: true,
        });
        playerItems = selectedItems;
        initialMarkedCells = [centerIndex]; // Auto-mark FREE space
      } else {
        playerItems = shuffled.slice(0, cellCount);
        initialMarkedCells = [];
      }

      this.state.playerGameStates.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        bingoItems: playerItems,
        markedCells: initialMarkedCells,
      });
    });

    // Broadcast game start with player states to all players
    this.broadcast({
      type: "game-started",
      playerStates: Array.from(this.state.playerGameStates.values()),
    });
  }

  handleMarkCell(sender: Party.Connection, data: MarkCellData) {
    const playerState = this.state.playerGameStates.get(sender.id);
    if (!playerState) return;

    if (data.marked) {
      if (!playerState.markedCells.includes(data.cellIndex)) {
        playerState.markedCells.push(data.cellIndex);
      }
    } else {
      playerState.markedCells = playerState.markedCells.filter(
        (index) => index !== data.cellIndex,
      );
    }

    // Broadcast to all players
    this.broadcast({
      type: "cell-marked",
      playerId: sender.id,
      cellIndex: data.cellIndex,
      marked: data.marked,
    });
  }

  handleEndGame(sender: Party.Connection) {
    const player = this.state.players.get(sender.id);
    if (!player?.isHost) {
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Only host can end the game",
        }),
      );
      return;
    }

    // Calculate lines for each player
    const playerScores: Array<{
      playerId: string;
      playerName: string;
      linesCount: number;
    }> = [];

    this.state.playerGameStates.forEach((playerState) => {
      const lines = checkWinningLines(
        playerState.markedCells,
        this.state.gridSize,
      );
      playerScores.push({
        playerId: playerState.playerId,
        playerName: playerState.playerName,
        linesCount: lines.length,
      });
    });

    // Find winner (most lines)
    const winner = playerScores.reduce((prev, current) =>
      current.linesCount > prev.linesCount ? current : prev,
    );

    // Broadcast game end to all players
    this.broadcast({
      type: "game-ended",
      winner,
      playerScores,
    });
  }

  handleLeaveRoom(sender: Party.Connection) {
    const player = this.state.players.get(sender.id);
    if (!player) return;

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
    this.handleLeaveRoom(connection);
  }

  // Helper methods
  getPlayersArray() {
    return Array.from(this.state.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      isReady: player.isReady,
      isHost: player.isHost,
    }));
  }

  generateBingoItems(): BingoItem[] {
    // Default bingo items - in production, these would come from the selected template
    const items = [
      "Someone's mic is on mute",
      "Can you see my screen?",
      "Sorry, I was on mute",
      "Let's take this offline",
      "Can everyone see the presentation?",
      "Sorry, you go ahead",
      "I have a hard stop at...",
      "Can you hear me?",
      "Someone joins late",
      "Technical difficulties",
      "Background noise",
      "FREE",
      "Let's circle back",
      "Can we get a recording?",
      "Anyone have questions?",
      "Is everyone here?",
      "Let's give it a few minutes",
      "Can you share that link?",
      "We're over time",
      "Child or pet appears",
      "Connection issues",
      "Sorry, I was multitasking",
      "Let's set up a follow-up",
      "Can you send that in chat?",
      "We lost you there",
    ];

    return items.map((text, index) => ({
      id: `item-${index}`,
      text,
      included: true,
    }));
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  broadcast(message: Record<string, unknown>) {
    const payload = JSON.stringify(message);
    this.state.players.forEach((player) => {
      player.connection.send(payload);
    });
  }

  broadcastToOthers(excludeId: string, message: Record<string, unknown>) {
    const payload = JSON.stringify(message);
    this.state.players.forEach((player) => {
      if (player.id !== excludeId) {
        player.connection.send(payload);
      }
    });
  }
}
