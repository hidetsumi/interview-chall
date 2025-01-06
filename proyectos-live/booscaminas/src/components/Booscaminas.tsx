import { useCallback, useEffect, useMemo, useState } from "react";

interface Casilla {
  position: number;
  active: boolean;
}

interface BooscaminasProp {
  gridDimension?: number;
  pumpkins?: number;
  enableFlags?: boolean;
}

export const Booscaminas = ({
  pumpkins = 10,
  enableFlags = false,
  gridDimension = 10,
}: BooscaminasProp) => {
  const initialGameState = useMemo(() => {
    const pumpkinsInitialState = [...Array(Math.pow(gridDimension, 2)).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, pumpkins);

    const initialGameState = new Array(gridDimension * gridDimension)
      .fill(0)
      .map((grid, position) => ({
        position,
        active: pumpkinsInitialState.includes(position),
      }));

    return { initialGameState, pumpkins: pumpkinsInitialState };
  }, [gridDimension, pumpkins]);

  const [gameState, setGameState] = useState<{ initialGameState: Casilla[]; pumpkins: number[] }>(
    initialGameState,
  );

  useEffect(() => {
    setGameState(initialGameState);
  }, [initialGameState]);

  const getSurroundingCells = useCallback(
    (position: number) => {
      const row = Math.floor(position / gridDimension);
      const col = position % gridDimension;

      const surrounding = [];

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;

          const newRow = row + i;
          const newCol = col + j;
          const newPos = newRow * gridDimension + newCol;

          if (newRow >= 0 && newRow < gridDimension && newCol >= 0 && newCol < gridDimension) {
            surrounding.push(newPos);
          }
        }
      }

      return surrounding;
    },

    [gridDimension],
  );

  const handleClickCell = (cellNumber: number) => {
    const surroundingCells = getSurroundingCells(cellNumber);

    console.log(initialGameState, "initialGameState");
    console.log(surroundingCells, "surrounding");
    console.log(cellNumber, "cellNumber");

    // const res = surroundingCells.some(r=> )
  };

  return (
    <div className={`grid grid-cols-${gridDimension} gap-1`}>
      {gameState.initialGameState.map((grid, i) => (
        <div
          key={i}
          className={`flex justify-center items-center w-[50px] h-[50px] border border-orange-400 ${grid.active ? "bg-orange-400" : ""}`}
          onClick={() => handleClickCell(grid.position)}
        >
          {grid.active} {grid.position}
        </div>
      ))}
    </div>
  );
};
