"use client";

/**
 * 15-slice journey pie — graphical path instead of button rows.
 * Completed slices fill; the next-best slice pulses; locked stay dim.
 */

import { Lock } from "lucide-react";
import {
  JOURNEY_STEPS,
  PHASE_LABELS,
  type JourneyTabId,
  type JourneyStep,
} from "@/lib/journey";

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER = 132;
const INNER = 58;
const GAP_DEG = 1.2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function donutSlicePath(
  startDeg: number,
  endDeg: number,
  outerR: number,
  innerR: number
): string {
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const o1 = polar(CX, CY, outerR, startDeg);
  const o2 = polar(CX, CY, outerR, endDeg);
  const i1 = polar(CX, CY, innerR, endDeg);
  const i2 = polar(CX, CY, innerR, startDeg);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

function sliceFill(
  step: JourneyStep,
  done: boolean,
  active: boolean,
  next: boolean,
  unlocked: boolean
): string {
  if (!unlocked) return "rgba(36, 48, 73, 0.85)";
  if (active) return "url(#pie-active)";
  if (next) return "url(#pie-next)";
  if (done) {
    if (step.phase === "plan") return "url(#pie-plan)";
    if (step.phase === "execute") return "url(#pie-execute)";
    if (step.phase === "measure") return "url(#pie-measure)";
    return "url(#pie-scale)";
  }
  return "rgba(18, 26, 43, 0.95)";
}

export function JourneyPie({
  activeId,
  nextId,
  completion,
  isUnlocked,
  onSelect,
  doneCount,
  compact = false,
}: {
  activeId: JourneyTabId;
  nextId: JourneyTabId;
  completion: Record<JourneyTabId, boolean>;
  isUnlocked: (id: JourneyTabId) => boolean;
  onSelect: (id: JourneyTabId) => void;
  doneCount: number;
  compact?: boolean;
}) {
  const slice = 360 / JOURNEY_STEPS.length;
  const percent = Math.round((doneCount / JOURNEY_STEPS.length) * 100);
  const active = JOURNEY_STEPS.find((s) => s.id === activeId)!;
  const size = compact ? 240 : SIZE;
  const scale = size / SIZE;

  return (
    <div className={`journey-pie relative mx-auto ${compact ? "w-[240px]" : "w-[320px]"}`}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={size}
        height={size}
        className="overflow-visible"
        role="img"
        aria-label={`Monetization pie: ${doneCount} of 15 slices complete`}
      >
        <defs>
          <linearGradient id="pie-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#e600ff" />
          </linearGradient>
          <linearGradient id="pie-next" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,229,255,0.55)" />
            <stop offset="100%" stopColor="rgba(230,0,255,0.55)" />
          </linearGradient>
          <linearGradient id="pie-plan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00a8c4" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
          <linearGradient id="pie-execute" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7af0ff" />
            <stop offset="100%" stopColor="#b388ff" />
          </linearGradient>
          <linearGradient id="pie-measure" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b388ff" />
            <stop offset="100%" stopColor="#e600ff" />
          </linearGradient>
          <linearGradient id="pie-scale" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e600ff" />
            <stop offset="100%" stopColor="#ff4de8" />
          </linearGradient>
          <filter id="pie-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {JOURNEY_STEPS.map((step, i) => {
          const start = i * slice + GAP_DEG / 2;
          const end = (i + 1) * slice - GAP_DEG / 2;
          const done = completion[step.id];
          const isActive = step.id === activeId;
          const isNext = step.id === nextId && !isActive;
          const unlocked = isUnlocked(step.id);
          const mid = (start + end) / 2;
          const labelR = OUTER + 18;
          const label = polar(CX, CY, labelR, mid);
          const path = donutSlicePath(start, end, OUTER, INNER);

          return (
            <g key={step.id}>
              <path
                d={path}
                fill={sliceFill(step, done, isActive, isNext, unlocked)}
                stroke={
                  isActive
                    ? "rgba(122,240,255,0.9)"
                    : isNext
                      ? "rgba(230,0,255,0.7)"
                      : "rgba(36,48,73,0.9)"
                }
                strokeWidth={isActive || isNext ? 2 : 1}
                className={`cursor-pointer transition-[filter,opacity] duration-300 ${
                  isNext ? "pie-slice-pulse" : ""
                } ${!unlocked ? "opacity-55" : "hover:brightness-110"}`}
                filter={isActive || isNext ? "url(#pie-glow)" : undefined}
                onClick={() => onSelect(step.id)}
                role="button"
                tabIndex={0}
                aria-label={`${step.label}${done ? ", complete" : ""}${!unlocked ? ", locked" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(step.id);
                  }
                }}
              />
              {!compact && (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  fill={
                    isActive
                      ? "#7af0ff"
                      : done
                        ? "#f2f6ff"
                        : unlocked
                          ? "#94a3b8"
                          : "#64748b"
                  }
                  fontSize={10}
                  fontWeight={700}
                >
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* Center story */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER - 4}
          fill="#070a12"
          stroke="rgba(0,229,255,0.25)"
          strokeWidth={1.5}
        />
        <text
          x={CX}
          y={CY - 16}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={9}
          fontWeight={800}
          letterSpacing={1.2}
          className="pointer-events-none uppercase"
        >
          {PHASE_LABELS[active.phase]}
        </text>
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={22}
          fontWeight={900}
          className="pointer-events-none"
        >
          {percent}%
        </text>
        <text
          x={CX}
          y={CY + 22}
          textAnchor="middle"
          fill="#7af0ff"
          fontSize={9}
          fontWeight={700}
          className="pointer-events-none"
        >
          {doneCount}/15 slices
        </text>
      </svg>

      {/* Active step caption under pie */}
      <div
        className="mt-2 text-center"
        style={{ transform: compact ? undefined : `scale(${scale})` }}
      >
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua-bright">
          Step {JOURNEY_STEPS.findIndex((s) => s.id === activeId) + 1} of 15
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-base font-bold text-white">
          {active.label}
          {!isUnlocked(activeId) && (
            <Lock size={14} className="text-slate-500" />
          )}
        </p>
        <p className="mx-auto mt-1 max-w-[280px] text-sm text-slate-400">
          {active.beat}
        </p>
      </div>
    </div>
  );
}
