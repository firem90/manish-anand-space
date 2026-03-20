import fs from "fs";
import path from "path";

const projectsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/projects/projects.json"), "utf8")
);

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-12 max-w-[800px] w-full mx-auto">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Now Building</h1>
        <p className="text-muted font-mono">
          Honest list of what's shipped, in progress, and abandoned.
        </p>
      </header>
      
      <div className="flex flex-col gap-8">
        {projectsData.map((project: any, idx: number) => (
          <article 
            key={idx} 
            className="flex flex-col gap-4 p-5 md:p-6 border border-muted/20 bg-background/50 rounded-sm"
          >
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold">
                {project.name}
              </h2>
              <span className={`text-xs uppercase tracking-wider font-mono border px-2 py-1 rounded-sm shrink-0 w-fit ${
                project.status === 'in-progress' ? 'text-accent border-accent/40 bg-accent/5' :
                project.status === 'shipped' ? 'text-green-500 border-green-500/40 bg-green-500/5' :
                'text-muted border-muted/40 bg-muted/5'
              }`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>
            
            <p className="font-serif leading-relaxed text-foreground/90">
              "{project.description}"
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {project.stack.map((tech: string) => (
                <span key={tech} className="text-xs font-mono bg-muted/10 px-2 py-1 rounded-sm">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-sm">
              {project.github ? (
                <a href={project.github} className="text-muted hover:text-accent transition-colors underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              ) : null}
              {project.note && (
                <span className="text-muted italic pr-4 border-l-2 border-muted/30 pl-4">{project.note}</span>
              )}
            </div>
          </article>
        ))}
        {projectsData.length === 0 && (
          <p className="text-muted font-mono">No projects found.</p>
        )}
      </div>
    </div>
  );
}
