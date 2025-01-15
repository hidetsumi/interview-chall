import { useEffect, useMemo, useState } from "react";

import { Casilla } from "../components/Booscaminas";

interface Props {
  gridDimension: number;
  pumpkins: number;
  enableFlags: boolean;
}

export const useBooscaminas = ({
  gridDimension = 10,
  pumpkins = 20,
  enableFlags = false,
}: Props) => {
  const initialGameState = useMemo(() => {
    const pumpkinsInitialState = [...Array(Math.pow(gridDimension, 2)).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, pumpkins);

    const gridState = new Array(gridDimension * gridDimension).fill(0).map((_, position) => ({
      position,
      isPumpkin: pumpkinsInitialState.includes(position),
      activated: false,
      nearPumpkins: 0,
      flagged: false,
    }));

    return { gridState, pumpkins: pumpkinsInitialState };
  }, [gridDimension, pumpkins]);

  const [gameState, setGameState] = useState<{ gridState: Casilla[]; pumpkins: number[] }>(
    initialGameState,
  );

  useEffect(() => {
    setGameState(initialGameState);
  }, [initialGameState]);

  function revealCell(
    pos: number,
    gameState: Casilla[],
    pumpkins: number[],
    visited = new Set<number>(),
  ): Casilla[] {
    function getSurroundingCells(position: number) {
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
    }

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
          ...revealCell(cell, newGameState, pumpkins, visited),
        );
      });
    }

    return newGameState;
  }

  const flagCell = (
    position: number,
    gameState: typeof initialGameState.gridState,
  ): typeof initialGameState.gridState => {
    return gameState.map((cell, i) =>
      i === position ? { ...cell, flagged: !cell.flagged } : cell,
    );
  };

  const handleClick = (position: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!gameState.pumpkins.includes(position)) {
      const flagClick = e.nativeEvent.button === 2;
      const newStateGrid = !flagClick
        ? revealCell(position, gameState.gridState, gameState.pumpkins)
        : flagCell(position, gameState.gridState);

      setGameState({
        ...gameState,
        gridState: newStateGrid,
      });
    } else {
      const gameOverSound = new Audio("../../public/boo.mp3");

      gameOverSound.play();
    }
  };

  return { gameState, handleClick };
};
