import React, { memo, MouseEvent, useCallback } from "react";

import { Casilla } from "./Booscaminas";

interface CellProps {
  cellInfo: Casilla;
  onClick: (position: number, e: React.MouseEvent<HTMLDivElement>) => void;
}
export const Cell = memo(
  ({ cellInfo: { activated, nearPumpkins, position, isPumpkin }, onClick }: CellProps) => {
    // Optional: Add dynamic classes based on state
    const cellClasses = `
    flex justify-center items-center
    w-[50px] h-[50px]
    border border-orange-400
    ${activated ? "bg-orange-100" : "hover:bg-orange-50"}
    ${isPumpkin && activated ? "bg-red-200" : ""}
    cursor-pointer
    transition-colors
  `;

    const handleClick = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        onClick(position, e);
      },
      [position, onClick],
    );

    return (
      <div
        aria-label={`Cell ${position}`}
        className={cellClasses}
        role="button"
        onClick={handleClick}
        onContextMenu={handleClick}
      >
        {!activated ? "X" : (nearPumpkins ?? "")}
      </div>
    );
  },
);
