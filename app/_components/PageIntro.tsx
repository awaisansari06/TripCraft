import type { ReactNode } from "react";

/** Shared editorial introduction, with each page's own copy and hierarchy. */
export default function PageIntro({ icon, eyebrow, children, description }: {
  icon: ReactNode;
  eyebrow: string;
  children: ReactNode;
  description: string;
}) {
  return (
    <section className="tc-page-hero">
      <span className="tc-eyebrow">{icon}{eyebrow}</span>
      <h1>{children}</h1>
      <p>{description}</p>
    </section>
  );
}
