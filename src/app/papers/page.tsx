import { getAllPapers } from "@/lib/papers";
import { PaperListClient } from "@/components/PaperListClient";

export default function PaperRackPage() {
  const papers = getAllPapers();

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Paper Rack</h1>
        <p className="text-muted font-mono">
          Research papers worth reading, with my insights and takeaways.
        </p>
      </header>

      <PaperListClient papers={papers} />
    </div>
  );
}
