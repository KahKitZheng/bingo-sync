import { Clock } from "lucide-react";
import Layout from "../Layout";
import BingoCard from "../BingoCard";
import PlayerCardSmall from "./PlayerCardSmall";
import { formatTime } from "../../utils";
import type { RoomDetails, PlayerGameState } from "../../types/game";

type ActiveGameViewProps = {
  roomDetails: RoomDetails;
  elapsedTime: number;
  isHost: boolean;
  currentPlayerId: string | null;
  playerStates: Map<string, PlayerGameState>;
  winningLines: Map<string, number[][]>;
  onEndGame: () => void;
  onLeaveRoom: () => void;
  onCellClick: (cellIndex: number) => void;
};

export function ActiveGameView(props: ActiveGameViewProps) {
  const {
    roomDetails,
    elapsedTime,
    isHost,
    currentPlayerId,
    playerStates,
    winningLines,
    onEndGame,
    onLeaveRoom,
    onCellClick,
  } = props;

  const currentPlayerState = playerStates.get(currentPlayerId || "");
  const otherPlayerStates = Array.from(playerStates.values()).filter(
    (state) => state.playerId !== currentPlayerId,
  );
  const currentPlayerLines = winningLines.get(currentPlayerId || "") || [];

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl space-y-4">
        {/* Game Header */}
        <div className="flex items-center justify-between rounded border border-neutral-200 bg-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-semibold">{roomDetails.roomName}</h1>
            <div className="mt-1 flex items-center gap-4 text-sm text-neutral-500">
              <span>Room: {roomDetails.roomCode}</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isHost && (
              <button
                onClick={onEndGame}
                className="rounded bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
              >
                End Game
              </button>
            )}
            <button
              onClick={onLeaveRoom}
              className="rounded border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Current Player's Card */}
          <div className="space-y-4 rounded border border-neutral-200 bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Card</h2>
              <div className="text-sm">
                <span className="font-semibold text-emerald-600">
                  {currentPlayerLines.length}
                </span>{" "}
                <span className="text-neutral-500">
                  {currentPlayerLines.length === 1 ? "line" : "lines"}
                </span>
              </div>
            </div>
            {currentPlayerState && (
              <BingoCard
                grid={currentPlayerState.bingoItems}
                gridSize={roomDetails.gridSize}
                markedCells={currentPlayerState.markedCells}
                onCellClick={onCellClick}
                winningLines={currentPlayerLines}
              />
            )}
          </div>

          {/* Other Players' Cards */}
          <div className="space-y-4 rounded border border-neutral-200 bg-white p-4 shadow">
            <h2 className="text-xl font-semibold">
              Other Players ({otherPlayerStates.length})
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {otherPlayerStates.map((playerState) => {
                const playerLines =
                  winningLines.get(playerState.playerId) || [];
                return (
                  <PlayerCardSmall
                    key={playerState.playerId}
                    playerName={playerState.playerName}
                    gridSize={roomDetails.gridSize}
                    bingoItems={playerState.bingoItems}
                    markedCells={playerState.markedCells}
                    winningLines={playerLines}
                  />
                );
              })}
              {otherPlayerStates.length === 0 && (
                <p className="col-span-2 text-center text-sm text-neutral-500">
                  No other players yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ActiveGameView;
