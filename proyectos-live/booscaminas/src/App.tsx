import { ChangeEvent, useState } from "react";

import { Booscaminas } from "./components/Booscaminas";

function App() {
  const [gridDimension, setGridDimension] = useState(10);

  const handleGridDimension = (e: ChangeEvent<HTMLInputElement>) => {
    if (typeof e.target.value === "string" && !isNaN(Number(e.target.value))) {
      setGridDimension(parseFloat(e.target.value));
    }
  };

  return (
    <main className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4">
      <header className="text-xl font-bold leading-[3rem]">booscaminas</header>
      <section className="flex py-8 justify-center">
        <div className="flex flex-col justify-center w-fit">
          <input onChange={handleGridDimension} />
          <Booscaminas enableFlags={false} gridDimension={gridDimension || 10} pumpkins={20} />
        </div>
      </section>
      <footer className="text-center leading-[3rem] opacity-70">
        © {new Date().getFullYear()} booscaminas
      </footer>
    </main>
  );
}

export default App;
