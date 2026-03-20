export default function StackPage() {
  const stack = [
    {
      section: "Languages & Frameworks",
      items: [
        { name: "Java 21", note: "Primary language. Virtual threads changed how I think about concurrency." },
        { name: "Spring Boot", note: "The framework I know well enough to disagree with." },
        { name: "TypeScript / NestJS", note: "Learning at work. Spring concepts translate surprisingly well." },
      ]
    },
    {
      section: "Infrastructure & Cloud",
      items: [
        { name: "Kubernetes", note: "Deployed and managed in production. Not just a resume word." },
        { name: "AWS", note: "SQS, S3, Batch, Step Functions. Daily driver for async workloads." },
        { name: "Docker", note: "Containerized everything I've built." },
      ]
    },
    {
      section: "Databases & Caching",
      items: [
        { name: "MySQL / PostgreSQL", note: "Relational first. Reach for NoSQL when you actually need it." },
        { name: "Redis", note: "Two-level cache with Caffeine. Use it deliberately." },
        { name: "IBM DB2", note: "Legacy migration experience. Would not recommend." },
      ]
    },
    {
      section: "Observability",
      items: [
        { name: "Splunk", note: "Log aggregation and alerting in production." },
        { name: "New Relic", note: "APM. First thing I set up on a new service." },
      ]
    },
    {
      section: "Currently Learning",
      items: [
        { name: "Kafka", note: "Event streaming. Should have learned this sooner." },
        { name: "LangChain4j", note: "AI integration without leaving Java. Watching this space closely." },
        { name: "DDIA (book)", note: "Reading. Reorganizing how I think about data systems." },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-16 max-w-[800px] w-full mx-auto">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Stack</h1>
        <p className="text-muted font-mono">
          What I actually use. Not a skills keyword list.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        {stack.map((group) => (
          <section key={group.section} className="flex flex-col md:flex-row gap-6 md:gap-12">
            <h2 className="text-xl font-bold font-mono md:w-1/3 shrink-0 text-muted">
              {group.section}
            </h2>
            <ul className="flex flex-col gap-6 md:w-2/3">
              {group.items.map((item) => (
                <li key={item.name} className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="font-serif text-foreground/90 italic">
                    "{item.note}"
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
