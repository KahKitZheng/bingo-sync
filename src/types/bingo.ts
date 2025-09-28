export type Template = {
  id: string;
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
