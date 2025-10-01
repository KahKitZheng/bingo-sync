import { Copy, Share2 } from "lucide-react";
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
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
        {/* Room Header */}
        <div className="space-y-4 rounded border border-neutral-200 bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{roomDetails.roomName}</h1>
              <p className="text-sm text-neutral-500">
                Share the room code to let friends join
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded bg-neutral-100 px-4 py-2">
                <span className="text-xl font-bold tracking-wider">
                  {roomDetails.roomCode}
                </span>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(roomDetails.roomCode)
                }
                className="rounded border border-neutral-200 p-2 hover:bg-neutral-50"
                title="Copy room code"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: roomDetails.roomName,
                    text: `Join my bingo game! Room code: ${roomDetails.roomCode}`,
                  });
                }}
                className="rounded border border-neutral-200 p-2 hover:bg-neutral-50"
                title="Share room"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-6 border-t border-neutral-200 pt-4 text-sm">
            <div>
              <p className="font-medium text-neutral-600">Template</p>
              <p className="mt-1">{roomDetails.template}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Grid Size</p>
              <p className="mt-1">
                {roomDetails.gridSize}×{roomDetails.gridSize}
              </p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Players</p>
              <p className="mt-1">
                {players.length} / {roomDetails.maxPlayers}
              </p>
            </div>
            <div>
              <p className="font-medium text-neutral-600">Ready</p>
              <p className="mt-1">
                {readyCount} / {players.length}
              </p>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-4 rounded border border-neutral-200 bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Players</h2>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 text-sm font-semibold">
                    {getInitials(player.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{player.name}</p>
                      {player.isHost && (
                        <span className="text-sm" title="Host">
                          👑
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
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
        <div className="space-y-4 rounded border border-neutral-200 bg-white p-4 shadow">
          <div>
            <h2 className="text-xl font-semibold">Ready to start?</h2>
            <p className="text-sm text-neutral-500">
              {isHost
                ? allReady
                  ? "All players are ready! Start the game when you're ready."
                  : "Waiting for all players to be ready..."
                : "Waiting for host to start the game..."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleReady}
              className={`rounded px-6 py-2 font-medium ${
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
                className="rounded bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                Start Game
              </button>
            )}

            <button
              onClick={onLeaveRoom}
              className="rounded border border-red-300 px-6 py-2 font-medium text-red-600 hover:bg-red-50"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LobbyView;
