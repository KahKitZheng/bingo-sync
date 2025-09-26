import { useState } from "react";
import { bingoItems } from "../../data/data";
import FormColumn from "../../components/FormColumn";

const CreateBingoCardPage = () => {
  const [gridSize, setGridSize] = useState(5);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">
        <span className="text-indigo-500">Bingo</span> card maker
      </h1>
      <div className="grid grid-cols-[2fr_3fr] gap-8">
        <div className="flex flex-col gap-8">
          <FormColumn title="Bingo card settings">
            <div>test</div>
          </FormColumn>
          <FormColumn title="Your bingo card">
            <div className="grid auto-rows-fr w-full gap-2">
              {Array.from({ length: gridSize }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-[repeat(auto-fit,minmax(50px,1fr))] gap-2"
                >
                  {Array.from({ length: gridSize }).map((_, colIndex) => (
                    <button
                      key={colIndex}
                      className="border-2 border-indigo-200 bg-indigo-50 w-full flex items-center justify-center rounded-lg hover:bg-indigo-200 hover:border-indigo-300"
                    >
                      {rowIndex === Math.floor(gridSize / 2) &&
                      colIndex === Math.floor(gridSize / 2) ? (
                        <span className="text-sm font-bold">FREE</span>
                      ) : (
                        <span className="text-sm font-medium text-center p-[6px]">
                          {
                            bingoItems[
                              (rowIndex * gridSize + colIndex) %
                                bingoItems.length
                            ]
                          }
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </FormColumn>
        </div>

        <FormColumn
          title="Manage your options"
          description={`Add or remove items for your bingo cards (25 included of ${
            gridSize * gridSize
          } total).`}
        >
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-2">
              <input
                className="border border-gray-200 px-4 py-2 rounded w-full"
                type="text"
                placeholder="Enter a bingo item"
              />
              <button className="border border-gray-200 px-2 rounded">+</button>
            </div>
          </div>

          <div className="grid grid-cols-2 flex-col gap-2 overflow-y-auto">
            {bingoItems.map((item) => (
              <div
                key={item}
                className="flex justify-between border border-neutral-200 px-4 py-2 rounded bg-neutral-50"
              >
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </FormColumn>
      </div>
    </div>
  );
};

export default CreateBingoCardPage;
