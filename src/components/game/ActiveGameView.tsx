import Layout from "../Layout";
import BingoCard from "../BingoCard";
import GameHeader from "./GameHeader";
import PlayerCardSmall from "./PlayerCardSmall";
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
      <div className="space-y-4">
        <GameHeader
          roomName={roomDetails.roomName}
          roomCode={roomDetails.roomCode}
          elapsedTime={elapsedTime}
          isHost={isHost}
          onEndGame={onEndGame}
          onLeaveRoom={onLeaveRoom}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Player's Card */}
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
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
          </div>

          {/* Other Players' Cards */}
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">
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
      </div>
    </Layout>
  );
}

export default ActiveGameView;
