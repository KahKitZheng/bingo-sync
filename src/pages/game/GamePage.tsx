import { useCallback, useState } from "react";
import Layout from "../../components/Layout";
import Select from "react-select";
import usePartySocket from "partysocket/react";

const host = import.meta.env.PROD
  ? "https://not-a-wordle.kahkitzheng.partykit.dev/"
  : "http://localhost:1999";

// Generate a random room code
const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
}

interface RoomDetails {
  roomCode: string;
  roomName: string;
  template: string;
  gridSize: number;
  maxPlayers: number;
}

const GamePage = () => {
  const [gameGridSize, setGameGridSize] = useState(5);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // Create room form
  const [createRoomName, setCreateRoomName] = useState("");
  const [createPlayerName, setCreatePlayerName] = useState("");

  // Join room form
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");

  // Pending action to send when socket connects
  const [pendingAction, setPendingAction] = useState<{
    type: "create" | "join";
    data: any;
  } | null>(null);

  // Game state
  const [inLobby, setInLobby] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = usePartySocket({
    host,
    room: roomId || "test",
    onOpen() {
      console.log("✅ Connected to room:", roomId);
      setIsConnected(true);
      setError(null);

      // Send pending action if any
      if (pendingAction) {
        console.log(
          "📤 Sending pending action:",
          pendingAction.type,
          pendingAction.data,
        );
        socket.send(JSON.stringify(pendingAction.data));
        setPendingAction(null);
      }
    },
    onClose() {
      console.log("Disconnected from room");
      setIsConnected(false);
    },
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
        console.log("Good bye.");
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

          case "game-started":
            // Handle game start
            console.log("Game started!");
            break;

          case "error":
            setError(message.message || "An error occurred");
            break;

          default:
            console.log("Received message:", message);
        }
      } catch (e) {
        console.log("Non-JSON message:", event.data);
      }
    },
  });

  const handleCreateRoom = useCallback(() => {
    if (!createPlayerName.trim()) {
      setError("Please enter your name");
      return;
    }

    const newRoomCode = generateRoomCode();

    // Set pending action before connecting
    setPendingAction({
      type: "create",
      data: {
        type: "create-room",
        roomName: createRoomName || `Room ${newRoomCode}`,
        gridSize: gameGridSize,
        playerName: createPlayerName,
        timestamp: Date.now(),
      },
    });

    // This will trigger socket reconnection to new room
    setRoomId(newRoomCode);
  }, [createPlayerName, createRoomName, gameGridSize]);

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
  }, [joinPlayerName, joinRoomCode]);

  const handleToggleReady = useCallback(() => {
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    if (currentPlayer) {
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
    if (currentPlayer?.isHost) {
      socket.send(
        JSON.stringify({
          type: "start-game",
          timestamp: Date.now(),
        }),
      );
    }
  }, [socket, currentPlayerId, players]);

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
    setRoomId(null);
    setIsConnected(false);
    setInLobby(false);
    setRoomDetails(null);
    setPlayers([]);
    setCurrentPlayerId(null);
    setPendingAction(null);
    setCreateRoomName("");
    setCreatePlayerName("");
    setJoinRoomCode("");
    setJoinPlayerName("");
    setError(null);
  }, [socket]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;
  const readyCount = players.filter((p) => p.isReady).length;
  const allReady = players.length > 0 && players.every((p) => p.isReady);

  // If in lobby, show room details
  if (inLobby && roomDetails) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl space-y-6">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Room Header */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <svg
                    className="h-6 w-6 text-neutral-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">
                    {roomDetails.roomName}
                  </h1>
                  <p className="text-sm text-neutral-500">
                    Share the room code with friends to let them join
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2">
                  <span className="text-2xl font-bold tracking-wider">
                    {roomDetails.roomCode}
                  </span>
                </div>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(roomDetails.roomCode)
                  }
                  className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                  title="Copy room code"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: roomDetails.roomName,
                      text: `Join my bingo game! Room code: ${roomDetails.roomCode}`,
                    });
                  }}
                  className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                  title="Share room"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-8 border-t border-neutral-200 pt-4">
              <div>
                <p className="text-sm font-medium text-neutral-600">Template</p>
                <p className="mt-1 font-medium">{roomDetails.template}</p>
                <p className="text-sm text-neutral-500">
                  {roomDetails.gridSize}x{roomDetails.gridSize} grid
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Players</p>
                <p className="mt-1 font-medium">
                  {players.length} / {roomDetails.maxPlayers}
                </p>
                <p className="text-sm text-neutral-500">
                  {readyCount} ready to play
                </p>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Players in Room{" "}
                <span className="text-neutral-500">
                  {players.length} / {roomDetails.maxPlayers}
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 font-semibold">
                      {getInitials(player.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{player.name}</p>
                        {player.isHost && (
                          <span className="text-yellow-500" title="Host">
                            👑
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">
                        {player.isReady ? "Ready to play" : "Not ready"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {player.isReady ? (
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        Ready
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600">
                        Waiting
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center gap-2 text-neutral-600">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p>
                    {isHost
                      ? allReady
                        ? "All players are ready! Start the game when you're ready."
                        : "Waiting for all players to be ready..."
                      : "Waiting for host to start the game..."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleToggleReady}
                    className={`rounded-lg px-6 py-2 font-medium ${
                      currentPlayer?.isReady
                        ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                        : "bg-black text-white hover:bg-neutral-800"
                    }`}
                  >
                    {currentPlayer?.isReady ? "Not Ready" : "Ready"}
                  </button>

                  {isHost && (
                    <button
                      onClick={handleStartGame}
                      disabled={!allReady}
                      className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                    >
                      Start Game
                    </button>
                  )}

                  <button
                    onClick={handleLeaveRoom}
                    className="rounded-lg border border-red-300 px-6 py-2 font-medium text-red-600 hover:bg-red-50"
                  >
                    Leave Room
                  </button>
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Toggle Ready Status
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4 rounded border border-neutral-200 p-4">
          <h2 className="text-xl font-semibold">Create new room</h2>
          <p className="text-sm text-gray-600">
            Set up a new multiplayer bingo room
          </p>

          <div>
            <p className="mb-1 text-sm font-medium">Room name (optional)</p>
            <input
              type="text"
              value={createRoomName}
              onChange={(e) => setCreateRoomName(e.target.value)}
              className="w-full rounded border border-gray-200 p-2 text-sm placeholder:text-sm"
              placeholder="My Bingo Game"
              disabled={roomId !== null}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Select template</p>
            <Select
              styles={{
                option: (provided, state) => ({
                  ...provided,
                  fontSize: "0.875rem",
                  backgroundColor: state.isSelected
                    ? "#c7d2fe"
                    : state.isFocused
                      ? "#e0e7ff"
                      : "white",
                  color: "black",
                }),
                control: (provided) => ({
                  ...provided,
                  fontSize: "0.875rem",
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: "none",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  fontSize: "0.875rem",
                }),
              }}
              value={{
                value: gameGridSize,
                label: `${gameGridSize}x${gameGridSize} (${gameGridSize * gameGridSize} cells)`,
              }}
              options={[
                { value: 3, label: "3x3 (9 cells)" },
                { value: 4, label: "4x4 (16 cells)" },
                { value: 5, label: "5x5 (25 cells)" },
              ]}
              onChange={(option) => {
                if (option) setGameGridSize(option.value);
              }}
              isSearchable={false}
              isDisabled={roomId !== null}
              menuPortalTarget={document.body}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Your name</p>
            <input
              type="text"
              value={createPlayerName}
              onChange={(e) => setCreatePlayerName(e.target.value)}
              className="w-full rounded border border-gray-200 bg-white p-2 text-sm placeholder:text-sm"
              placeholder="Enter your name"
              disabled={roomId !== null}
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={roomId !== null || !createPlayerName.trim()}
            className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {roomId ? "Creating..." : "Create Room"}
          </button>
        </div>

        <div className="space-y-4 rounded border border-neutral-200 p-4">
          <h2 className="text-xl font-semibold">Join Existing Room</h2>
          <p className="text-sm text-gray-600">
            Enter the room code to join an existing game
          </p>

          <div>
            <p className="mb-1 text-sm font-medium">Room code</p>
            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              className="w-full rounded border border-gray-200 p-2 text-sm placeholder:text-sm"
              placeholder="e.g. AB12CD"
              maxLength={6}
              disabled={roomId !== null}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Your name</p>
            <input
              type="text"
              value={joinPlayerName}
              onChange={(e) => setJoinPlayerName(e.target.value)}
              className="w-full rounded border border-gray-200 p-2 text-sm placeholder:text-sm"
              placeholder="John Doe"
              disabled={roomId !== null}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={
              roomId !== null || !joinPlayerName.trim() || !joinRoomCode.trim()
            }
            className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {roomId ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
