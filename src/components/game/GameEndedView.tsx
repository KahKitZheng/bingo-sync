import { formatTime } from "../../utils";
import Layout from "../Layout";

type GameEndedViewProps = {
  winner: {
    playerName: string;
    linesCount: number;
  };
  elapsedTime: number;
  onLeaveRoom: () => void;
};

export function GameEndedView(props: GameEndedViewProps) {
  const { winner, elapsedTime, onLeaveRoom } = props;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">Game Over!</h1>
          <div className="mb-6 text-6xl">🏆</div>
          <h2 className="mb-2 text-2xl font-semibold text-emerald-600">
            {winner.playerName} Wins!
          </h2>
          <p className="mb-6 text-lg text-neutral-600">
            with {winner.linesCount} completed{" "}
            {winner.linesCount === 1 ? "line" : "lines"}
          </p>
          <div className="mb-6 text-neutral-500">
            Game duration: {formatTime(elapsedTime)}
          </div>
          <button
            onClick={onLeaveRoom}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-neutral-800"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default GameEndedView;
