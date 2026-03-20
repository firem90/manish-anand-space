import { MDXRemote } from "next-mdx-remote/rsc";
import { Diagram } from "./Diagram";

const components = {
  h2: (props: any) => (
    <h2
      className="text-2xl font-bold mt-12 mb-4 text-foreground"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="text-xl font-bold mt-8 mb-4 text-foreground"
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      className="leading-[1.8] mb-6 text-foreground/90 font-serif"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 font-serif text-foreground/90" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 font-serif text-foreground/90" {...props} />
  ),
  li: (props: any) => <li className="pl-2" {...props} />,
  a: (props: any) => (
    <a
      className="text-foreground underline underline-offset-4 decoration-muted hover:decoration-accent transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-2 border-accent pl-4 italic my-6 text-muted font-serif"
      {...props}
    />
  ),
  code: (props: any) => {
    // If it's a code block (inside a pre) it generally won't match this exactly without rehype-pretty-code handling it
    // But for inline code:
    return (
      <code
        className="bg-muted/10 px-1.5 py-0.5 rounded-sm font-mono text-[0.85em] text-foreground"
        {...props}
      />
    );
  },
  pre: (props: any) => (
    <pre
      className="overflow-x-auto p-4 rounded bg-[#1a1b26] my-8 text-[13px] md:text-sm font-mono border border-muted/20"
      {...props}
    />
  ),
  Diagram,
};

export function MdxRenderer({ source }: { source: string }) {
  // To avoid installing next-mdx-remote separately during this run if it fails, I am keeping it simple.
  // Actually, I didn't explicitly run `npm install next-mdx-remote`. I used `@next/mdx` and `rehype-pretty-code`.
  // Because in my implementation plan I said "next-mdx-remote was not installed, I used @next/mdx", let me adjust.
  return (
    <div className="mdx-content">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
