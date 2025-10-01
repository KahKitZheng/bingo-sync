import { useCallback, useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../../contexts/Supabase/SupabaseContext";
import type {
  Player,
  RoomDetails,
  PlayerGameState,
  Winner,
  PendingAction,
} from "../../types/game";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useGameActions } from "../../hooks/useGameActions";
import InitialView from "../../components/game/InitialView";
import LobbyView from "../../components/game/LobbyView";
import ActiveGameView from "../../components/game/ActiveGameView";
import GameEndedView from "../../components/game/GameEndedView";

const GamePage = () => {
  const { templates } = useContext(SupabaseContext);

  // Room state
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // Create room form
  const [createRoomName, setCreateRoomName] = useState("");
  const [createPlayerName, setCreatePlayerName] = useState("");

  // Join room form
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");

  // Pending action
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  // Game state
  const [inLobby, setInLobby] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Game play state
  const [playerStates, setPlayerStates] = useState<
    Map<string, PlayerGameState>
  >(new Map());
  const [winningLines, setWinningLines] = useState<Map<string, number[][]>>(
    new Map(),
  );
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameStartTime && !gameEnded) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStartTime, gameEnded]);

  // Set default template when templates load
  useEffect(() => {
    if (templates.length > 0 && selectedTemplate === null) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  // Reset all game state
  const resetState = useCallback(() => {
    setRoomId(null);
    setInLobby(false);
    setGameStarted(false);
    setGameEnded(false);
    setWinner(null);
    setGameStartTime(null);
    setElapsedTime(0);
    setRoomDetails(null);
    setPlayers([]);
    setPlayerStates(new Map());
    setWinningLines(new Map());
    setCurrentPlayerId(null);
    setPendingAction(null);
    setSelectedTemplate(null);
    setCreateRoomName("");
    setCreatePlayerName("");
    setJoinRoomCode("");
    setJoinPlayerName("");
    setError(null);
  }, []);

  // Socket connection
  const socket = useGameSocket({
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
  });

  // Game actions
  const {
    handleCreateRoom,
    handleJoinRoom,
    handleToggleReady,
    handleStartGame,
    handleEndGame,
    handleCellClick,
    handleLeaveRoom,
  } = useGameActions({
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
  });

  // Derived state
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;
  const readyCount = players.filter((p) => p.isReady).length;
  const allReady = players.length > 0 && players.every((p) => p.isReady);

  // Game ended view
  if (gameEnded && winner && roomDetails) {
    return (
      <GameEndedView
        winner={winner}
        elapsedTime={elapsedTime}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // Game view - show bingo cards
  if (gameStarted && roomDetails) {
    return (
      <ActiveGameView
        roomDetails={roomDetails}
        elapsedTime={elapsedTime}
        isHost={isHost}
        currentPlayerId={currentPlayerId}
        playerStates={playerStates}
        winningLines={winningLines}
        onEndGame={handleEndGame}
        onLeaveRoom={handleLeaveRoom}
        onCellClick={handleCellClick}
      />
    );
  }

  // Lobby view
  if (inLobby && roomDetails) {
    return (
      <LobbyView
        error={error}
        roomDetails={roomDetails}
        players={players}
        currentPlayer={currentPlayer}
        isHost={isHost}
        allReady={allReady}
        readyCount={readyCount}
        onToggleReady={handleToggleReady}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // Initial view - create or join room
  return (
    <InitialView
      error={error}
      roomId={roomId}
      templates={templates}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      createRoomName={createRoomName}
      setCreateRoomName={setCreateRoomName}
      createPlayerName={createPlayerName}
      setCreatePlayerName={setCreatePlayerName}
      joinRoomCode={joinRoomCode}
      setJoinRoomCode={setJoinRoomCode}
      joinPlayerName={joinPlayerName}
      setJoinPlayerName={setJoinPlayerName}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
    />
  );
};

export default GamePage;
