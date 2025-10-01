import { useCallback } from "react";
import type PartySocket from "partysocket";
import type { Player, PlayerGameState, PendingAction } from "../types/game";
import type { Template } from "../types/bingo";

// Generate a random room code
export const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

type UseGameActionsProps = {
  socket: PartySocket | null;
  currentPlayerId: string | null;
  players: Player[];
  playerStates: Map<string, PlayerGameState>;
  createRoomName: string;
  createPlayerName: string;
  selectedTemplate: number | null;
  templates: Template[];
  joinPlayerName: string;
  joinRoomCode: string;
  setError: (error: string | null) => void;
  setRoomId: (id: string | null) => void;
  setPendingAction: (action: PendingAction | null) => void;
  resetState: () => void;
};

export function useGameActions(props: UseGameActionsProps) {
  const {
    socket,
    currentPlayerId,
    players,
    playerStates,
    createRoomName,
    createPlayerName,
    selectedTemplate,
    templates,
    joinPlayerName,
    joinRoomCode,
    setError,
    setRoomId,
    setPendingAction,
    resetState,
  } = props;

  const handleCreateRoom = useCallback(() => {
    if (!createPlayerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (selectedTemplate === null) {
      setError("Please select a template");
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) {
      setError("Invalid template selected");
      return;
    }

    const newRoomCode = generateRoomCode();

    // Set pending action before connecting
    setPendingAction({
      type: "create",
      data: {
        type: "create-room",
        roomName: createRoomName || `Room ${newRoomCode}`,
        gridSize: template.size,
        playerName: createPlayerName,
        templateName: template.name,
        templateItems: template.items,
        timestamp: Date.now(),
      },
    });

    // This will trigger socket reconnection to new room
    setRoomId(newRoomCode);
  }, [
    createPlayerName,
    createRoomName,
    selectedTemplate,
    templates,
    setError,
    setPendingAction,
    setRoomId,
  ]);

  const handleJoinRoom = useCallback(() => {
    if (!joinPlayerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!joinRoomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    const code = joinRoomCode.toUpperCase().trim();

    // Set pending action before connecting
    setPendingAction({
      type: "join",
      data: {
        type: "join-room",
        playerName: joinPlayerName,
        timestamp: Date.now(),
      },
    });

    // This will trigger socket reconnection to the room
    setRoomId(code);
  }, [joinPlayerName, joinRoomCode, setError, setPendingAction, setRoomId]);

  const handleToggleReady = useCallback(() => {
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    if (currentPlayer && socket) {
      socket.send(
        JSON.stringify({
          type: "toggle-ready",
          playerId: currentPlayerId,
          isReady: !currentPlayer.isReady,
          timestamp: Date.now(),
        }),
      );
    }
  }, [socket, currentPlayerId, players]);

  const handleStartGame = useCallback(() => {
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    if (currentPlayer?.isHost && socket) {
      socket.send(
        JSON.stringify({
          type: "start-game",
          timestamp: Date.now(),
        }),
      );
    }
  }, [socket, currentPlayerId, players]);

  const handleEndGame = useCallback(() => {
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    if (currentPlayer?.isHost && socket) {
      socket.send(
        JSON.stringify({
          type: "end-game",
          timestamp: Date.now(),
        }),
      );
    }
  }, [socket, currentPlayerId, players]);

  const handleCellClick = useCallback(
    (cellIndex: number) => {
      const currentPlayerState = playerStates.get(currentPlayerId || "");
      if (!currentPlayerState || !socket) return;

      const isMarked = currentPlayerState.markedCells.has(cellIndex);

      socket.send(
        JSON.stringify({
          type: "mark-cell",
          playerId: currentPlayerId,
          cellIndex,
          marked: !isMarked,
          timestamp: Date.now(),
        }),
      );
    },
    [socket, currentPlayerId, playerStates],
  );

  const handleLeaveRoom = useCallback(() => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "leave-room",
          timestamp: Date.now(),
        }),
      );
      socket.close();
    }
    resetState();
  }, [socket, resetState]);

  return {
    handleCreateRoom,
    handleJoinRoom,
    handleToggleReady,
    handleStartGame,
    handleEndGame,
    handleCellClick,
    handleLeaveRoom,
  };
}
