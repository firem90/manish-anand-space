import fs from "fs";
import path from "path";
import { TilList } from "@/components/TilList";

const tilData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/til/til.json"), "utf8")
);

export default function TilPage() {
  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Today I Learned</h1>
        <p className="text-muted font-mono">
          Public engineering notebook. Short, unpolished notes and gotchas.
        </p>
      </header>

      <TilList entries={tilData} />
    </div>
  );
}
