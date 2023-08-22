import { Typer } from "@/components/Typer";
import { randomizeWords } from "@/data/common";
import words from "@/data/common";

async function getData() {
  const seed = Math.floor(Math.random() * 1000);
  return randomizeWords(words, seed);
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="min-h-screen">
      <div className="p-4 font-semibold font-mono text-md [text-shadow:_0px_1px_2px_rgb(255_0_0_/_90%)]">
        Typer
      </div>

      <div className="flex flex-col items-center">
        <div className="container mt-20">
          <Typer words={data} />
        </div>
      </div>
    </main>
  );
}
