import { useCallback, useMemo } from "react";

interface Casilla {
  position: number;
  active: boolean;
}

interface BooscaminasProp {
  gridDimension?: number;
  pumpkins?: number;
  enableFlags?: boolean;
}

export const Booscaminas = ({
  pumpkins = 10,
  enableFlags = false,
  gridDimension = 10,
}: BooscaminasProp) => {
  const initialGameState = useMemo(() => {
    const pumpkinsInitialState = [...Array(Math.pow(gridDimension, 2)).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, pumpkins);

    // Array.from({ length: pumpkins }, (_, i) => i).sort(
    // () => Math.random() * (gridDimension * gridDimension),
    // );

    console.log(pumpkinsInitialState);
    //   [
    //   ...new Set(
    //     Array(pumpkins)
    //       .fill(0)
    //       .map((_, i) => i),
    //   ),
    // ];
    // new Array(pumpkins)
    //   .fill(0)
    //   .map(() => Math.floor(Math.random() * (gridDimension * gridDimension)));

    const initialGameState = new Array(gridDimension * gridDimension)
      .fill(0)
      .map((grid, position) => ({
        position,
        active: pumpkinsInitialState.includes(position),
      }));

    return initialGameState;
  }, [gridDimension, pumpkins]);

  // const [gameState, setGameState] = useState<Casilla[]>(initialGameState);

  console.log([...initialGameState.filter((pump) => pump.active)]);

  const getSurroundingCells = useCallback(
    ({ active, position }: Casilla) => {
      console.log(position);
      const topLine = [
        position - gridDimension - 1,
        position - gridDimension,
        position - gridDimension + 1,
      ];

      const innerLine = [position - 1, position, position + 1];

      const bottomLine = [
        position + gridDimension - 1,
        position + gridDimension,
        position + gridDimension + 1,
      ];

      console.log([...topLine, ...innerLine, ...bottomLine].filter((num) => num > 0));
    },
    [gridDimension],
  );

  return (
    <div className={`grid grid-cols-${gridDimension} gap-1`}>
      {initialGameState.map((grid, i) => (
        <div
          key={i}
          className={`flex justify-center items-center w-[50px] h-[50px] border border-orange-400 ${grid.active ? "bg-orange-400" : ""}`}
          onClick={() => getSurroundingCells(grid)}
        >
          {grid.active} {grid.position}
        </div>
      ))}
    </div>
  );
};
