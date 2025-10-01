import type * as Party from "partykit/server";

import type { BingoItem } from "./bingo";

// Frontend types
export type Player = {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
};

export type RoomDetails = {
  roomCode: string;
  roomName: string;
  template: string;
  gridSize: number;
  maxPlayers: number;
};

export type PlayerGameState = {
  playerId: string;
  playerName: string;
  bingoItems: BingoItem[];
  markedCells: Set<number>;
};

export type Winner = {
  playerId: string;
  playerName: string;
  linesCount: number;
};

export type PendingAction = {
  type: "create" | "join";
  data: {
    type: string;
    roomName?: string;
    gridSize?: number;
    playerName: string;
    templateName?: string;
    templateItems?: BingoItem[];
    timestamp: number;
  };
};

// Server types (Party)
export type ServerPlayer = {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  connection: Party.Connection;
};

export type ServerPlayerGameState = {
  playerId: string;
  playerName: string;
  bingoItems: BingoItem[];
  markedCells: number[];
};

export type RoomState = {
  roomCode: string;
  roomName: string;
  gridSize: number;
  maxPlayers: number;
  template: string;
  templateItems: BingoItem[];
  players: Map<string, ServerPlayer>;
  gameStarted: boolean;
  playerGameStates: Map<string, ServerPlayerGameState>;
};

export type CreateRoomData = {
  roomName?: string;
  gridSize?: number;
  playerName: string;
  templateName?: string;
  templateItems?: BingoItem[];
};

export type JoinRoomData = {
  playerName: string;
};

export type ToggleReadyData = {
  playerId: string;
  isReady: boolean;
};

export type MarkCellData = {
  cellIndex: number;
  marked: boolean;
};
