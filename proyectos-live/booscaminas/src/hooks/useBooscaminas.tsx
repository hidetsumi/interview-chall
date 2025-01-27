import { useCallback, useEffect, useMemo, useState } from "react";

import { Casilla } from "../components/Booscaminas";

interface Props {
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

export const useBooscaminas = ({ pumpkins = 20, enableFlags = true }: Props) => {
  const DEFAULT_GRID_DIMENSION = 10;

  const getSurroundingCells = useCallback(
    (position: number) => {
      const row = Math.floor(position / DEFAULT_GRID_DIMENSION);
      const col = position % DEFAULT_GRID_DIMENSION;

      const surrounding = [];

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;

          const newRow = row + i;
          const newCol = col + j;
          const newPos = newRow * DEFAULT_GRID_DIMENSION + newCol;

          if (
            newRow >= 0 &&
            newRow < DEFAULT_GRID_DIMENSION &&
            newCol >= 0 &&
            newCol < DEFAULT_GRID_DIMENSION
          ) {
            surrounding.push(newPos);
          }
        }
      }

      return surrounding;
    },
    [DEFAULT_GRID_DIMENSION],
  );

  const createInitialState = useCallback(
    (gridSize?: number): GameState => {
      const totalCells = Math.pow(gridSize || DEFAULT_GRID_DIMENSION, 2);

      const pumpkinsPositions = createPumpkinsPositions(totalCells, pumpkins);
      const gridState = Array.from({ length: totalCells }, (_, position) =>
        createCell(position, pumpkinsPositions),
      );

      return {
        gridState,
        pumpkins: pumpkinsPositions,
      };
    },
    [pumpkins, DEFAULT_GRID_DIMENSION],
  );

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

  const mostCommonPumpkins = [5, 7, 10];

  const handleClickCommonValues = (dimension: number) => {
    setGameState(createInitialState(dimension));
  };

  const GridSizeSelector = () => {
    return (
      <div className="group flex flex-row gap-2">
        <div className="flex w-16 h-12 border border-orange-600 justify-center items-center">
          🟧
        </div>
        {mostCommonPumpkins.map((DEFAULT_GRID_DIMENSION) => (
          <div
            key={DEFAULT_GRID_DIMENSION}
            className="opacity-0 flex justify-center p-2 px-8 w-fit bg-slate-400 rounded-sm group-hover:opacity-100 transition-opacity ease-in-out  duration-200"
            onClick={() => handleClickCommonValues(DEFAULT_GRID_DIMENSION)}
          >
            {DEFAULT_GRID_DIMENSION}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    resetGame();
  }, [DEFAULT_GRID_DIMENSION, resetGame]);

  const WIN_CONDITION = useMemo(() => {
    return (
      pumpkins - gameState.gridState.filter((grid) => grid.activated && !grid.isPumpkin).length
    );
  }, [pumpkins, gameState]);

  console.log(WIN_CONDITION);

  return {
    gameState,
    handleClick,
    resetGame, // Exportamos reset por si lo necesitas
    GridSizeSelector,
  };
};
