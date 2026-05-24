"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="animate-fade-in-scale fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <ArrowUp className="size-5" aria-hidden />
    </button>
  );
}
