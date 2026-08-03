"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getGlossaryEntry, glossaryAliasIndex } from "@/lib/glossary";

/**
 * Clickable jargon word → clean definition popout for first-time builders.
 */
export function TermHint({
  id,
  children,
  className = "",
}: {
  id: string;
  children?: ReactNode;
  className?: string;
}) {
  const entry = getGlossaryEntry(id);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const below = rect.bottom + 10;
    const spaceBelow = window.innerHeight - below;
    const approxHeight = 240;
    const top =
      spaceBelow < approxHeight && rect.top > approxHeight
        ? Math.max(12, rect.top - approxHeight - 8)
        : Math.min(below, window.innerHeight - 24);
    setCoords({ top, left, width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      place();
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open, place]);

  if (!entry) {
    return <span className={className}>{children ?? id}</span>;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`term-hint ${className}`}
        aria-expanded={open}
        aria-controls={open ? labelId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {children ?? entry.term}
      </button>
      {mounted &&
        open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            id={labelId}
            role="dialog"
            aria-label={entry.term}
            className="term-hint-popout fade-up"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold tracking-tight text-white">
                {entry.term}
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-500 transition hover:bg-night-700 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
              {entry.blurb}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Scans plain text and wraps known glossary phrases in TermHint.
 */
export function ExplainableText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "p" | "li";
}) {
  const nodes = linkGlossaryInText(text);
  return <Tag className={className}>{nodes}</Tag>;
}

function linkGlossaryInText(text: string): ReactNode[] {
  if (!text) return [];
  const index = glossaryAliasIndex();
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < text.length) {
    const lower = text.slice(i).toLowerCase();
    let hit: { alias: string; id: string } | null = null;
    for (const row of index) {
      if (!lower.startsWith(row.alias)) continue;
      const beforeOk = i === 0 || !/[A-Za-z0-9]/.test(text[i - 1]!);
      const after = text[i + row.alias.length];
      const afterOk = after == null || !/[A-Za-z0-9]/.test(after);
      if (beforeOk && afterOk) {
        hit = row;
        break;
      }
    }
    if (hit) {
      const raw = text.slice(i, i + hit.alias.length);
      nodes.push(
        <TermHint key={`t-${key++}`} id={hit.id}>
          {raw}
        </TermHint>
      );
      i += hit.alias.length;
      continue;
    }

    let j = i + 1;
    while (j < text.length) {
      const rest = text.slice(j).toLowerCase();
      let any = false;
      for (const row of index) {
        if (!rest.startsWith(row.alias)) continue;
        const beforeOk = j === 0 || !/[A-Za-z0-9]/.test(text[j - 1]!);
        const after = text[j + row.alias.length];
        const afterOk = after == null || !/[A-Za-z0-9]/.test(after);
        if (beforeOk && afterOk) {
          any = true;
          break;
        }
      }
      if (any) break;
      j++;
    }
    nodes.push(text.slice(i, j));
    i = j;
  }
  return nodes;
}
