import { Typer } from "@/components/Typer";
import words from "@/data/common";

function randomizeWords() {
  return new Array(100)
    .fill(0)
    .map((_) => Math.floor(Math.random() * words.length))
    .map((n) => words[n].toLowerCase());
}

async function getData() {
  return randomizeWords();
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="min-h-screen">
      <div className="p-4 font-mono text-md">Typer</div>

      <div className="flex flex-col items-center">
        <div className="container mt-20">
          <Typer words={data} />
        </div>
      </div>
    </main>
  );
}
