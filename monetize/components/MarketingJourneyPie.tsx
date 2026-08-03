"use client";

/**
 * Marketing homepage pie: all 15 tools as slices, labels along each
 * slice's outer edge (tangent to the rim).
 */

import { useState } from "react";
import { JOURNEY_STEPS, PHASE_LABELS, type JourneyStep } from "@/lib/journey";
import { CopySwap } from "@/components/CopySwap";

const SIZE = 420;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER = 168;
const INNER = 62;
const GAP_DEG = 1.1;
const LABEL_R = OUTER - 22;

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

function phaseFill(step: JourneyStep): string {
  if (step.phase === "plan") return "url(#home-pie-plan)";
  if (step.phase === "execute") return "url(#home-pie-execute)";
  if (step.phase === "measure") return "url(#home-pie-measure)";
  return "url(#home-pie-scale)";
}

/** Rotate label so it sits along the outer rim of the slice. */
function rimRotation(midDeg: number): number {
  let rot = midDeg + 90;
  if (rot > 90 && rot < 270) rot += 180;
  return rot;
}

export function MarketingJourneyPie() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slice = 360 / JOURNEY_STEPS.length;
  const active = JOURNEY_STEPS[activeIndex]!;

  return (
    <div className="mx-auto w-full max-w-lg">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto h-auto w-full max-w-[420px] overflow-visible"
        role="img"
        aria-label="Make it RAIN monetization pie with 15 tools"
      >
        <defs>
          <linearGradient id="home-pie-plan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00a8c4" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
          <linearGradient
            id="home-pie-execute"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7af0ff" />
            <stop offset="100%" stopColor="#b388ff" />
          </linearGradient>
          <linearGradient
            id="home-pie-measure"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#b388ff" />
            <stop offset="100%" stopColor="#e600ff" />
          </linearGradient>
          <linearGradient
            id="home-pie-scale"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#e600ff" />
            <stop offset="100%" stopColor="#ff4de8" />
          </linearGradient>
        </defs>

        {JOURNEY_STEPS.map((step, i) => {
          const start = i * slice + GAP_DEG / 2;
          const end = (i + 1) * slice - GAP_DEG / 2;
          const mid = (start + end) / 2;
          const path = donutSlicePath(start, end, OUTER, INNER);
          const label = polar(CX, CY, LABEL_R, mid);
          const isActive = i === activeIndex;
          const rot = rimRotation(mid);

          return (
            <g key={step.id}>
              <path
                d={path}
                fill={phaseFill(step)}
                fillOpacity={isActive ? 1 : 0.72}
                stroke={
                  isActive ? "rgba(122,240,255,0.95)" : "rgba(7,10,18,0.55)"
                }
                strokeWidth={isActive ? 2.25 : 1}
                className="cursor-pointer transition-[fill-opacity] duration-200 hover:fill-opacity-100"
                onClick={() => setActiveIndex(i)}
                onMouseEnter={() => setActiveIndex(i)}
                role="button"
                tabIndex={0}
                aria-label={step.label}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveIndex(i);
                  }
                }}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${rot} ${label.x} ${label.y})`}
                className="pointer-events-none select-none"
                fill={isActive ? "#ffffff" : "rgba(255,255,255,0.88)"}
                fontSize={17}
                fontWeight={800}
                letterSpacing={0.2}
              >
                {step.short}
              </text>
            </g>
          );
        })}

        <circle
          cx={CX}
          cy={CY}
          r={INNER - 3}
          fill="#070a12"
          stroke="rgba(0,229,255,0.28)"
          strokeWidth={1.5}
        />
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fill="#7af0ff"
          fontSize={22}
          fontWeight={900}
          className="pointer-events-none"
        >
          15
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={18}
          fontWeight={700}
          letterSpacing={1}
          className="pointer-events-none uppercase"
        >
          tools
        </text>
      </svg>

      <div className="mt-3 min-h-[7.5rem] text-center sm:mt-4 sm:min-h-[8.5rem]">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-aqua-bright sm:text-[11px] sm:tracking-[0.18em]">
          <span className="sm:hidden">
            {PHASE_LABELS[active.phase]} · {activeIndex + 1}/15
          </span>
          <span className="hidden sm:inline">
            {PHASE_LABELS[active.phase]} · Step {activeIndex + 1} of 15 ·{" "}
            {active.tier}
          </span>
        </p>
        <p className="mt-1 text-base font-bold text-white sm:text-lg">
          {active.outcome}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-aqua">{active.label}</p>
        <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-slate-300 sm:mt-2">
          <CopySwap mobile={active.pitchShort} desktop={active.pitch} />
        </p>
      </div>
    </div>
  );
}
