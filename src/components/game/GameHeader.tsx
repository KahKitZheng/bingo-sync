import { formatTime } from "../../utils";

type GameHeaderProps = {
  roomName: string;
  roomCode: string;
  elapsedTime: number;
  isHost: boolean;
  onEndGame: () => void;
  onLeaveRoom: () => void;
};

export function GameHeader(props: GameHeaderProps) {
  const { roomName, roomCode, elapsedTime, isHost, onEndGame, onLeaveRoom } =
    props;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{roomName}</h1>
        <p className="text-sm text-gray-600">
          Room: {roomCode} • Time: {formatTime(elapsedTime)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isHost && (
          <button
            onClick={onEndGame}
            className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            End Game
          </button>
        )}
        <button
          onClick={onLeaveRoom}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
}

export default GameHeader;
