import { useCallback, useEffect, useMemo, useState } from "react";

import { Casilla } from "../components/Booscaminas";

interface Props {
  gridDimension: number;
  pumpkins: number;
  enableFlags: boolean;
}

interface GameState {
  gridState: Casilla[];
  pumpkins: number[];
}

// Estas funciones van fuera ya que no dependen del estado ni props del hook
const createPumpkinsPositions = (totalCells: number, pumpkinsCount: number): number[] => {
  return [...Array(totalCells).keys()].sort(() => Math.random() - 0.5).slice(0, pumpkinsCount);
};

const createCell = (position: number, pumpkinsPositions: number[]): Casilla => ({
  position,
  isPumpkin: pumpkinsPositions.includes(position),
  activated: false,
  nearPumpkins: 0,
  flagged: false,
});

export const useBooscaminas = ({
  gridDimension = 10,
  pumpkins = 20,
  enableFlags = true,
}: Props) => {
  const totalCells = useMemo(() => Math.pow(gridDimension, 2), [gridDimension]);

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

  const createInitialState = useCallback((): GameState => {
    const pumpkinsPositions = createPumpkinsPositions(totalCells, pumpkins);
    const gridState = Array.from({ length: totalCells }, (_, position) =>
      createCell(position, pumpkinsPositions),
    );

    return {
      gridState,
      pumpkins: pumpkinsPositions,
    };
  }, [totalCells, pumpkins]);

  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const revealCell = useCallback(
    (
      pos: number,
      currentGameState: Casilla[],
      pumpkins: number[],
      visited = new Set<number>(),
    ): Casilla[] => {
      // Si ya visitamos esta celda, retornamos el estado sin cambios
      if (visited.has(pos)) return currentGameState;

      // Marcamos como visitada
      visited.add(pos);

      // Obtenemos las celdas adyacentes y contamos las bombas
      const surroundingCells = getSurroundingCells(pos);
      const nearPumpkins = surroundingCells.filter((cell) => pumpkins.includes(cell));

      // Creamos una copia del estado
      let newState = [...currentGameState];

      // Activamos la celda actual
      newState = newState.map((cell, index) =>
        index === pos
          ? {
              ...cell,
              activated: true,
              nearPumpkins: nearPumpkins.length,
            }
          : cell,
      );

      // Si no hay bombas cercanas, revelamos las celdas adyacentes
      if (nearPumpkins.length === 0) {
        surroundingCells.forEach((cellPos) => {
          // Solo si no está ya activada
          if (!newState[cellPos].activated) {
            newState = revealCell(cellPos, newState, pumpkins, visited);
          }
        });
      }

      return newState;
    },
    [getSurroundingCells],
  );

  // Memoizamos flagCell
  const flagCell = useCallback((position: number, currentGameState: Casilla[]): Casilla[] => {
    return currentGameState.map((cell, i) =>
      i === position ? { ...cell, flagged: !cell.flagged } : cell,
    );
  }, []);

  // Memoizamos el audio
  const playGameOverSound = useCallback(() => {
    const gameOverSound = new Audio("../../public/boo.mp3");

    return gameOverSound.play();
  }, []);

  // Memoizamos handleClick
  const handleClick = useCallback(
    (position: number, e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();

      const flagClick = e.nativeEvent.button === 2;

      const selectedHavePumpkin = gameState.pumpkins.includes(position);

      // GAME OVER
      selectedHavePumpkin && !flagClick && playGameOverSound();

      if (!selectedHavePumpkin || flagClick) {
        setGameState((prev) => ({
          ...prev,
          gridState:
            flagClick && enableFlags
              ? flagCell(position, prev.gridState)
              : prev.gridState[position].flagged
                ? prev.gridState
                : revealCell(position, prev.gridState, prev.pumpkins),
        }));
      }
    },
    [gameState.pumpkins, enableFlags, revealCell, flagCell, playGameOverSound],
  );

  // Añadimos reset por si lo necesitas
  const resetGame = useCallback(() => {
    setGameState(createInitialState());
  }, [createInitialState]);

  useEffect(() => {
    resetGame();
  }, [gridDimension, resetGame]);

  return {
    gameState,
    handleClick,
    resetGame, // Exportamos reset por si lo necesitas
  };
};
