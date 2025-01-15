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

export const Booscaminas = ({ pumpkins, enableFlags, gridDimension }: BooscaminasProp) => {
  const { gameState, handleClick } = useBooscaminas({ gridDimension, pumpkins, enableFlags });

  return (
    <div className={`grid grid-cols-${gridDimension} gap-1`}>
      {gameState.gridState.map((cell) => (
        <Cell key={cell.position} cellInfo={cell} onClick={handleClick} />
      ))}
    </div>
  );
};
