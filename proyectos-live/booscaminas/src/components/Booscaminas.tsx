import { useBooscaminas } from "../hooks/useBooscaminas";

import { Cell } from "./Cell";

export interface Casilla {
  position: number;
  isPumpkin: boolean;
  activated: boolean;
  nearPumpkins: number;
  flagged: boolean;
}

interface BooscaminasProp {
  gridDimension: number;
  pumpkins: number;
  enableFlags: boolean;
}

export const Booscaminas = ({ pumpkins, enableFlags }: BooscaminasProp) => {
  const { gameState, handleClick, GridSizeSelector } = useBooscaminas({
    pumpkins,
    enableFlags,
  });

  const gridDimension = Math.sqrt(gameState.gridState.length);

  return (
    <div>
      {GridSizeSelector()}
      <div className={`grid grid-cols-${gridDimension} gap-1`}>
        {gameState.gridState.map((cell) => (
          <Cell key={cell.position} cellInfo={cell} onClick={handleClick} />
        ))}
      </div>
    </div>
  );
};
