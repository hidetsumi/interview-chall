import { memo } from "react";

import { Casilla } from "./Booscaminas";

interface CellProps {
  cellInfo: Casilla;
  onClick: (position: number) => void;
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

    return (
      <div
        aria-label={`Cell ${position}`}
        className={cellClasses}
        role="button"
        onClick={() => onClick(position)}
      >
        {!activated ? "X" : (nearPumpkins ?? "")}
      </div>
    );
  },
);
