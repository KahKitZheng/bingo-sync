import { useCallback, useContext, useEffect, useState } from "react";
import FormColumn from "../../components/FormColumn";
import BingoCard from "../../components/BingoCard";
import Select from "react-select";
import { RefreshCcw, Trash2 } from "lucide-react";
import { SupabaseContext } from "../../contexts/Supabase/SupabaseContext";
import type { BingoItem, Template } from "../../types/bingo";
import { randomId } from "../../utils";
import { mockBingoItems } from "../../data/data";

const BingoTemplateEditorPage = () => {
  const { supabase } = useContext(SupabaseContext);

  const [items, setItems] = useState<BingoItem[]>(mockBingoItems);
  const [gridSize, setGridSize] = useState(5);
  const [bingoItems, setBingoItems] = useState<string[]>([]);
  const [markedCells, setMarkedCells] = useState<Set<number>>(new Set());
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const [templateName, setTemplateName] = useState("");

  const [newItem, setNewItem] = useState("");

  function checkWinningLines(
    markedIndices: number[],
    gridSize: number,
  ): number[][] {
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
  }

  const generateBingoCard = useCallback(() => {
    const includedItems = items.filter((item) => item.included);
    const cellCount = gridSize * gridSize;
    const needsFreeSpace = gridSize % 2 === 1;
    const availableSlots = needsFreeSpace ? cellCount - 1 : cellCount;

    const shuffled = [...includedItems].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled
      .slice(0, availableSlots)
      .map((item) => item.text);

    if (needsFreeSpace) {
      const centerIndex = Math.floor(cellCount / 2);
      selectedItems.splice(centerIndex, 0, "FREE");
    }

    setBingoItems(selectedItems);
    setMarkedCells(
      needsFreeSpace ? new Set([Math.floor(cellCount / 2)]) : new Set(),
    );
    setWinningLines([]);
  }, [gridSize, items]);

  const addItem = () => {
    if (newItem.trim() && !items.some((item) => item.text === newItem.trim())) {
      setItems([
        ...items,
        { id: randomId(), text: newItem.trim(), included: true },
      ]);
      setNewItem("");
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const saveTemplate = async () => {
    const payload: Template = {
      id: randomId(),
      name: templateName.trim(),
      size: gridSize,
      items: items,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("Template").upsert([payload]);

    if (error) {
      console.error("Error saving template:", error);
    } else {
      console.log("Template saved successfully:", data);
    }
  };

  useEffect(() => {
    generateBingoCard();
  }, [generateBingoCard]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-4xl font-bold">
          <span className="text-indigo-500">Bingo</span> card maker
        </h1>
        <button onClick={saveTemplate}>Save</button>
      </div>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
        <FormColumn
          title="Your bingo card"
          description="Customize your bingo card"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bingo-card-name"
                className="mb-1 block text-sm font-medium"
              >
                Bingo card name
              </label>
              <input
                id="bingo-card-name"
                className="w-full rounded border border-gray-200 p-2 placeholder:text-sm"
                type="text"
                placeholder="Enter a name for your bingo card"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="bingo-card-name"
                className="mb-1 block text-sm font-medium"
              >
                Grid size
              </label>
              <Select
                styles={{
                  option: (provided, state) => ({
                    ...provided,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected
                      ? "bg-indigo-300"
                      : "white" /* text-sm */,
                    color: "black",
                  }),
                  control: (provided) => ({
                    ...provided,
                    fontSize: "0.875rem" /* text-sm */,
                  }),
                  indicatorSeparator: (provided) => ({
                    ...provided,
                    display: "none",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    fontSize: "0.875rem" /* text-sm */,
                  }),
                }}
                value={{
                  value: gridSize,
                  label: `${gridSize}x${gridSize} (${
                    gridSize * gridSize
                  } cells)`,
                }}
                options={[
                  { value: 3, label: "3x3 (9 cells)" },
                  { value: 4, label: "4x4 (16 cells)" },
                  { value: 5, label: "5x5 (25 cells)" },
                ]}
                onChange={(option) => {
                  if (option) setGridSize(option.value);
                }}
                isDisabled
                isSearchable={false}
                menuPortalTarget={document.body}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="mb-1 block text-sm font-medium">
                  Bingo card preview{" "}
                  <span className="text-gray-500">
                    (items will be randomized once the game starts)
                  </span>
                </p>
                <button
                  className="cursor-pointer p-2"
                  onClick={generateBingoCard}
                  title="Regenerate bingo card"
                >
                  <RefreshCcw size={12} />
                </button>
              </div>

              <BingoCard
                grid={bingoItems}
                gridSize={gridSize}
                markedCells={markedCells}
                winningLines={winningLines}
                onCellClick={(index) => {
                  const newMarkedCells = new Set(markedCells);
                  if (newMarkedCells.has(index)) {
                    newMarkedCells.delete(index);
                  } else {
                    newMarkedCells.add(index);
                  }
                  setMarkedCells(newMarkedCells);
                  // Check for winning lines
                  const markedArray = Array.from(newMarkedCells);
                  const lines = checkWinningLines(markedArray, gridSize);
                  setWinningLines(lines);
                }}
              />
            </div>
          </div>
        </FormColumn>

        <FormColumn
          title="Manage your options"
          description={`Add or remove items for your bingo cards (${items.length} included of ${
            gridSize * gridSize
          } total).`}
        >
          <div>
            <p className="mb-1 block text-sm font-medium">Add new bingo item</p>
            <div className="mb-4 flex gap-2">
              <input
                className="w-full rounded border border-gray-200 p-2 placeholder:text-sm"
                type="text"
                placeholder="Enter a bingo item"
                value={newItem}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <button
                className="flex cursor-pointer items-center justify-center rounded border-gray-200 bg-indigo-400 px-4 text-2xl text-white transition hover:bg-indigo-500"
                onClick={addItem}
              >
                +
              </button>
            </div>
          </div>
          <div>
            <p className="mb-1 block text-sm font-medium">Bingo items</p>
            <ol className="grid flex-col gap-2 overflow-y-auto lg:grid-cols-2">
              {items.map((item, index) => (
                <li
                  key={`item-${index}`}
                  className="flex justify-between rounded border border-neutral-200 bg-neutral-50 p-2"
                >
                  <span className="text-xs">
                    {index + 1}. {item.text}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-destructive cursor-pointer p-1 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </FormColumn>
      </div>
    </div>
  );
};

export default BingoTemplateEditorPage;
