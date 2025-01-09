import { useCallback, useEffect, useMemo, useState } from "react";

interface Casilla {
  position: number;
  isPumpkin: boolean;
  activated: boolean;
  nearPumpkins: number;
}

interface BooscaminasProp {
  gridDimension?: number;
  pumpkins?: number;
  enableFlags?: boolean;
}

export const Booscaminas = ({
  pumpkins = 20,
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
        isPumpkin: pumpkinsInitialState.includes(position),
        activated: false,
        nearPumpkins: 0,
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

  function handleClick(position: number) {
    // if (!initialGameState.pumpkins.includes(position)) {
    // }

    const newCells = { ...gameState };

    function revealCell(pos: number, visited = new Set<number>(), grid: typeof initialGameState) {
      if (visited.has(pos)) return;
      visited.add(pos);

      const surroundingCells = getSurroundingCells(pos);
      const nearPumpkins = surroundingCells.filter((cell) => gameState.pumpkins.includes(cell));

      grid.initialGameState[pos] = {
        ...grid.initialGameState[pos],
        activated: true,
        nearPumpkins: nearPumpkins.length,
      };

      if (!nearPumpkins.length) {
        surroundingCells.forEach((cell) => revealCell(cell, visited, newCells));
      }
    }

    revealCell(position);
    setGameState(newCells);
  }

  return (
    <div className={`grid grid-cols-${gridDimension} gap-1`}>
      {gameState.initialGameState.map((grid, i) => (
        <div
          key={i}
          className={`flex justify-center items-center w-[50px] h-[50px] border border-orange-400`}
          onClick={() => handleClick(grid.position)}
        >
          {!grid.activated ? "X" : (grid.nearPumpkins ?? "")}
        </div>
      ))}
    </div>
  );
};
