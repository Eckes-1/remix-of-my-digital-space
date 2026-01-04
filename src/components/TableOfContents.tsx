import { useState, useEffect, useMemo } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const paragraphs = content.split("\n\n");
    
    paragraphs.forEach((p, index) => {
      if (p.startsWith("## ")) {
        const title = p.replace("## ", "");
        items.push({
          id: `heading-${index}`,
          title,
          level: 2,
        });
      }
    });
    
    return items;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsExpanded(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile floating button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* TOC Panel */}
      <nav
        className={cn(
          "lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-auto",
          "fixed bottom-0 left-0 right-0 z-50 lg:z-auto",
          "bg-card lg:bg-transparent rounded-t-2xl lg:rounded-none p-6 lg:p-0",
          "transform transition-transform duration-300 lg:transform-none",
          isExpanded ? "translate-y-0" : "translate-y-full lg:translate-y-0"
        )}
      >
        <h3 className="font-serif text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <List className="w-4 h-4" />
          文章目录
        </h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "text-sm text-left w-full py-1.5 px-3 rounded-lg transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  activeId === heading.id
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    : "text-muted-foreground"
                )}
              >
                {heading.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default TableOfContents;
