import type { BingoItem } from "../types/bingo";
import { cn } from "../utils";

type BingoCardProps = {
  grid: BingoItem[];
  gridSize: number;
  markedCells?: Set<number>;
  onCellClick?: (index: number) => void;
  winningLines?: number[][];
};

export function BingoCard(props: BingoCardProps) {
  const { grid, gridSize, markedCells, onCellClick, winningLines = [] } = props;

  const filledGrid = Array.from(
    { length: gridSize * gridSize },
    (_, i) => grid[i] || "",
  );

  const isWinningCell = (index: number): boolean => {
    return winningLines.some((line) => line.includes(index));
  };

  return (
    <div
      className="mx-auto grid aspect-square w-full auto-rows-[minmax(60px,1fr)] gap-2 md:auto-rows-[minmax(100px,1fr)] lg:auto-rows-fr"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
    >
      {filledGrid.map((item, index) => {
        const isMarked = markedCells?.has(index);
        const isFreeSpace = item.text === "FREE";
        const isWinning = isWinningCell(index);

        return (
          <button
            key={index}
            onClick={() => onCellClick?.(index)}
            className={cn(
              "relative flex items-center justify-center rounded-lg border-2 p-2 text-center text-[8px] font-medium transition-all duration-200 hover:scale-105 sm:text-xs",
              isMarked
                ? "border-emerald-700 bg-emerald-200 font-semibold text-emerald-700 shadow-lg ring-1"
                : "text-card-foreground hover:border-ring border-neutral-300 bg-neutral-50",
              isFreeSpace &&
                "border-emerald-700 bg-emerald-200 font-bold text-emerald-700",
              isWinning &&
                "ring-opacity-75 animate-pulse border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500",
            )}
            disabled={isFreeSpace}
          >
            {isWinning && (
              <div className="absolute -top-1 -right-1">
                <div className="h-3 w-3 animate-ping rounded-full bg-emerald-400"></div>
                <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-emerald-400"></div>
              </div>
            )}
            <span
              className={cn(
                "relative leading-tight text-balance",
                isMarked && !isFreeSpace && "opacity-75",
                isWinning && "font-bold",
              )}
            >
              {isMarked ? <s>{item.text}</s> : item.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BingoCard;
