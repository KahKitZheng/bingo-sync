import Layout from "../Layout";
import type { Player, RoomDetails } from "../../types/game";

type LobbyViewProps = {
  error: string | null;
  roomDetails: RoomDetails;
  players: Player[];
  currentPlayer: Player | undefined;
  isHost: boolean;
  allReady: boolean;
  readyCount: number;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function LobbyView(props: LobbyViewProps) {
  const {
    error,
    roomDetails,
    players,
    currentPlayer,
    isHost,
    allReady,
    readyCount,
    onToggleReady,
    onStartGame,
    onLeaveRoom,
  } = props;

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
                  onClick={onToggleReady}
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
                    onClick={onStartGame}
                    disabled={!allReady}
                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                  >
                    Start Game
                  </button>
                )}

                <button
                  onClick={onLeaveRoom}
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

export default LobbyView;
