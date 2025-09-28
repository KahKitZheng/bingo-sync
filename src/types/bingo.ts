export type Template = {
  id: number;
  name: string;
  description?: string;
  size: number;
  items: BingoItem[];
  created_at: string;
};

export type BingoItem = {
  id: string;
  text: string;
  included: boolean;
};
