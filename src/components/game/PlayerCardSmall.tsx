import BingoCard from "../BingoCard";
import type { BingoItem } from "../../types/bingo";

type PlayerCardSmallProps = {
  playerName: string;
  gridSize: number;
  bingoItems: BingoItem[];
  markedCells: Set<number>;
  winningLines: number[][];
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function PlayerCardSmall(props: PlayerCardSmallProps) {
  const { playerName, gridSize, bingoItems, markedCells, winningLines } = props;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300 text-xs font-semibold">
            {getInitials(playerName)}
          </div>
          <p className="text-sm font-medium">{playerName}</p>
        </div>
        <div className="text-xs text-neutral-500">
          <span className="font-semibold text-emerald-600">
            {winningLines.length}
          </span>{" "}
          {winningLines.length === 1 ? "line" : "lines"} • {markedCells.size}{" "}
          marked
        </div>
      </div>
      <BingoCard
        grid={bingoItems}
        gridSize={gridSize}
        markedCells={markedCells}
        hideText={true}
        winningLines={winningLines}
      />
    </div>
  );
}

export default PlayerCardSmall;
