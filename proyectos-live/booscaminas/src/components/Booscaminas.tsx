import { useCallback, useEffect, useMemo, useState } from "react";

import { Cell } from "./Cell";

export interface Casilla {
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
      .map((_, position) => ({
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

  // TODO: Remove more params and dependencies to improve simplicity.
  function revealCell(
    pos: number,
    gameState: Casilla[],
    pumpkins: number[],
    getSurroundingCells: (position: number) => number[],
    visited = new Set<number>(),
  ): Casilla[] {
    if (visited.has(pos)) return gameState;

    visited.add(pos);
    const surroundingCells = getSurroundingCells(pos);
    const nearPumpkins = surroundingCells.filter((cell) => pumpkins.includes(cell));

    const newGameState = [...gameState];

    newGameState[pos] = {
      ...newGameState[pos],
      activated: true,
      nearPumpkins: nearPumpkins.length,
    };

    if (!nearPumpkins.length) {
      surroundingCells.forEach((cell) => {
        newGameState.splice(
          0,
          newGameState.length,
          ...revealCell(cell, newGameState, pumpkins, getSurroundingCells, visited),
        );
      });
    }

    return newGameState;
  }

  function handleClick(position: number) {
    console.log(position);
    if (!gameState.pumpkins.includes(position)) {
      const newStateGrid = revealCell(
        position,
        gameState.initialGameState,
        gameState.pumpkins,
        getSurroundingCells,
      );

      setGameState({
        ...gameState,
        initialGameState: newStateGrid,
      });
    } else {
      const gameOverSound = new Audio("../../public/boo.mp3");

      gameOverSound.play();
    }
  }

  return (
    <div className={`grid grid-cols-${gridDimension} gap-1`}>
      {gameState.initialGameState.map((cell) => (
        <Cell cellInfo={cell} onClick={handleClick} />
      ))}
    </div>
  );
};
