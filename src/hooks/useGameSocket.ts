import usePartySocket from "partysocket/react";
import type {
  Player,
  RoomDetails,
  PlayerGameState,
  Winner,
  PendingAction,
} from "../types/game";
import type { BingoItem } from "../types/bingo";
import { checkWinningLines } from "../utils";

const host = import.meta.env.PROD
  ? "https://not-a-wordle.kahkitzheng.partykit.dev/"
  : "http://localhost:1999";

type UseGameSocketProps = {
  roomId: string | null;
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
  setError: (error: string | null) => void;
  setInLobby: (inLobby: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setGameEnded: (ended: boolean) => void;
  setCurrentPlayerId: (id: string | null) => void;
  setRoomDetails: (details: RoomDetails | null) => void;
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  setPlayerStates: (
    states:
      | Map<string, PlayerGameState>
      | ((prev: Map<string, PlayerGameState>) => Map<string, PlayerGameState>),
  ) => void;
  setWinningLines: (
    lines:
      | Map<string, number[][]>
      | ((prev: Map<string, number[][]>) => Map<string, number[][]>),
  ) => void;
  setGameStartTime: (time: number | null) => void;
  setWinner: (winner: Winner | null) => void;
  roomDetails: RoomDetails | null;
};

export function useGameSocket(props: UseGameSocketProps) {
  const {
    roomId,
    pendingAction,
    setPendingAction,
    setError,
    setInLobby,
    setGameStarted,
    setGameEnded,
    setCurrentPlayerId,
    setRoomDetails,
    setPlayers,
    setPlayerStates,
    setWinningLines,
    setGameStartTime,
    setWinner,
    roomDetails,
  } = props;

  const socket = usePartySocket({
    host,
    room: roomId || "test",
    onOpen() {
      setError(null);

      // Send pending action if any
      if (pendingAction) {
        socket.send(JSON.stringify(pendingAction.data));
        setPendingAction(null);
      }
    },
    onClose() {},
    onError(event) {
      console.error("Socket error:", event);
      setError("Connection error. Please try again.");
    },
    onMessage(event) {
      if (event.data === "slowdown") {
        console.log("Cool down. You're sending too many messages.");
        return;
      }

      if (event.data === "goaway") {
        socket.close();
        setError("Disconnected from server.");
        return;
      }

      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "room-created":
            setInLobby(true);
            setCurrentPlayerId(message.playerId);
            setRoomDetails({
              roomCode: message.roomCode,
              roomName: message.roomName,
              template: message.template || "Office Meeting Bingo",
              gridSize: message.gridSize,
              maxPlayers: message.maxPlayers || 8,
            });
            setPlayers(message.players || []);
            break;

          case "player-joined":
            setInLobby(true);
            setCurrentPlayerId(message.playerId);
            setRoomDetails(message.roomDetails);
            setPlayers(message.players || []);
            break;

          case "players-updated":
            setPlayers(message.players || []);
            break;

          case "player-ready-changed":
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === message.playerId
                  ? { ...p, isReady: message.isReady }
                  : p,
              ),
            );
            break;

          case "game-started": {
            setGameStarted(true);
            setInLobby(false);
            setGameStartTime(Date.now());

            // Initialize player states from server
            const newPlayerStates = new Map<string, PlayerGameState>();
            const newWinningLines = new Map<string, number[][]>();

            message.playerStates.forEach(
              (state: {
                playerId: string;
                playerName: string;
                bingoItems: BingoItem[];
                markedCells: number[];
              }) => {
                const markedCells = new Set<number>(state.markedCells);
                newPlayerStates.set(state.playerId, {
                  playerId: state.playerId,
                  playerName: state.playerName,
                  bingoItems: state.bingoItems,
                  markedCells,
                });

                // Check initial winning lines (in case FREE is pre-marked)
                const markedArray = Array.from(markedCells);
                const lines = checkWinningLines(
                  markedArray,
                  roomDetails?.gridSize || 5,
                );
                newWinningLines.set(state.playerId, lines);
              },
            );
            setPlayerStates(newPlayerStates);
            setWinningLines(newWinningLines);
            break;
          }

          case "cell-marked": {
            // Update player states
            setPlayerStates((prev) => {
              const newStates = new Map(prev);
              const playerState = newStates.get(message.playerId);
              if (!playerState) return prev;

              const newMarkedCells = new Set(playerState.markedCells);
              if (message.marked) {
                newMarkedCells.add(message.cellIndex);
              } else {
                newMarkedCells.delete(message.cellIndex);
              }

              const updatedPlayerState = {
                ...playerState,
                markedCells: newMarkedCells,
              };
              newStates.set(message.playerId, updatedPlayerState);

              // Check for winning lines
              const markedArray = Array.from(newMarkedCells);
              const lines = checkWinningLines(
                markedArray,
                roomDetails!.gridSize,
              );

              // Update winning lines in a separate state update
              setWinningLines((prevLines) => {
                const newLines = new Map(prevLines);
                newLines.set(message.playerId, lines);
                return newLines;
              });

              return newStates;
            });
            break;
          }

          case "game-ended":
            setGameEnded(true);
            setWinner(message.winner);
            break;

          case "error":
            console.error("❌ Server error:", message.message);
            setError(message.message || "An error occurred");
            break;

          default:
            console.log("⚠️ Unhandled message type:", message.type);
        }
      } catch {
        console.log("📝 Non-JSON message:", event.data);
      }
    },
  });

  return socket;
}
