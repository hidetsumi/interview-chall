import type { Casilla } from "./Booscaminas";

import React, { memo, useMemo } from "react";

interface CellProps {
  cellInfo: Casilla;
  onClick: (position: number, e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Cell = memo(
  ({ cellInfo: { activated, nearPumpkins, position, isPumpkin, flagged }, onClick }: CellProps) => {
    const cellClasses = useMemo(
      () => `
    flex justify-center items-center
    w-12 h-12
    border border-orange-400
    ${activated ? "bg-orange-100" : "hover:bg-orange-50"}
    ${isPumpkin && activated ? "bg-red-200" : ""}
    cursor-pointer
    transition-colors
  `,
      [activated, isPumpkin],
    );

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick(position, e);
    };

    return (
      <div
        aria-label={`Cell ${position}`}
        className={cellClasses}
        role="button"
        onClick={handleClick}
        onContextMenu={handleClick}
      >
        {!activated ? (flagged ? "🚩" : "🎃") : (nearPumpkins ?? "")}
      </div>
    );
  },
);

Cell.displayName = "Cell"; // Ayuda en DevTools
