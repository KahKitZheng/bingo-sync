import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const randomId = (length = 10) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const crypto = window.crypto;
  const array = new Uint32Array(length);

  return new Array(length)
    .fill(0)
    .map((_, index) =>
      possible.charAt(
        Math.floor(crypto.getRandomValues(array)[index] % possible.length),
      ),
    )
    .join("");
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const checkWinningLines = (
  markedIndices: number[],
  gridSize: number,
): number[][] => {
  const lines: number[][] = [];
  const markedSet = new Set(markedIndices);

  // Check rows
  for (let row = 0; row < gridSize; row++) {
    const rowIndices = Array.from(
      { length: gridSize },
      (_, col) => row * gridSize + col,
    );
    if (rowIndices.every((index) => markedSet.has(index))) {
      lines.push(rowIndices);
    }
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    const colIndices = Array.from(
      { length: gridSize },
      (_, row) => row * gridSize + col,
    );
    if (colIndices.every((index) => markedSet.has(index))) {
      lines.push(colIndices);
    }
  }

  // Check diagonals
  const diagonal1 = Array.from(
    { length: gridSize },
    (_, i) => i * gridSize + i,
  );
  if (diagonal1.every((index) => markedSet.has(index))) {
    lines.push(diagonal1);
  }

  const diagonal2 = Array.from(
    { length: gridSize },
    (_, i) => i * gridSize + (gridSize - 1 - i),
  );
  if (diagonal2.every((index) => markedSet.has(index))) {
    lines.push(diagonal2);
  }

  return lines;
};
