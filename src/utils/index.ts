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
