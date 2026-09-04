"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { memberPhotoSrc } from "@/lib/member-image";
import {
  layoutFamilyTree,
  personHref,
  treeNodeStatus,
} from "@/lib/family-trees";
import type { Family, Person, Relationship } from "@/lib/family-trees/types";

const MIN_SCALE = 0.22;
const MAX_SCALE = 1.6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function initials(name: string): string {
  const parts = name
    .replace(/\[[^\]]*]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

export function FamilyTreeView({
  family,
  people,
  relationships,
  focusId,
}: {
  family: Family;
  people: Person[];
  relationships: Relationship[];
  focusId?: string;
}) {
  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people],
  );
  const layout = useMemo(
    () =>
      layoutFamilyTree({
        people,
        relationships,
        rootPersonIds: family.rootPersonIds,
      }),
    [family.rootPersonIds, people, relationships],
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(
    null,
  );

  const [scale, setScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? null);

  const selected = selectedId ? peopleById.get(selectedId) : undefined;

  const applyZoom = useCallback(
    (nextScale: number, clientX: number, clientY: number) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        setScale(nextScale);
        return;
      }
      const rect = viewport.getBoundingClientRect();
      const ratio = nextScale / scale;
      const x = clientX - rect.left + viewport.scrollLeft;
      const y = clientY - rect.top + viewport.scrollTop;
      pendingScroll.current = {
        left: x * ratio - (clientX - rect.left),
        top: y * ratio - (clientY - rect.top),
      };
      setScale(nextScale);
    },
    [scale],
  );

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !layout.nodes.length) {
      setScale(1);
      return;
    }
    const next = clamp(
      Math.min(
        (viewport.clientWidth - 24) / layout.width,
        (viewport.clientHeight - 24) / layout.height,
      ),
      MIN_SCALE,
      1,
    );
    pendingScroll.current = { left: 0, top: 0 };
    setScale(next);
  }, [layout.height, layout.nodes.length, layout.width]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !pendingScroll.current) return;
    viewport.scrollLeft = pendingScroll.current.left;
    viewport.scrollTop = pendingScroll.current.top;
    pendingScroll.current = null;
  }, [scale]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport?.clientWidth) {
      const frame = requestAnimationFrame(() => fitToScreen());
      return () => cancelAnimationFrame(frame);
    }
    fitToScreen();
  }, [fitToScreen]);

  useEffect(() => {
    const fromUrl =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("focus")
        : null;
    if (fromUrl) setSelectedId(fromUrl);
    else if (focusId) setSelectedId(focusId);
  }, [focusId]);

  useEffect(() => {
    if (!focusId) return;
    const node = viewportRef.current?.querySelector(
      `[data-person-id="${CSS.escape(focusId)}"]`,
    );
    node?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }, [focusId, scale]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 0.9;
      applyZoom(clamp(scale * factor, MIN_SCALE, MAX_SCALE), event.clientX, event.clientY);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [applyZoom, scale]);

  const zoomBy = (factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      setScale((current) => clamp(current * factor, MIN_SCALE, MAX_SCALE));
      return;
    }
    const rect = viewport.getBoundingClientRect();
    applyZoom(
      clamp(scale * factor, MIN_SCALE, MAX_SCALE),
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest(".ft-node, .ft-toolbar, .ft-person-panel")) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dx = pts[0]!.x - pts[1]!.x;
      const dy = pts[0]!.y - pts[1]!.y;
      pinch.current = { distance: Math.hypot(dx, dy), scale };
      drag.current = null;
      return;
    }
    const viewport = viewportRef.current;
    if (!viewport) return;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pinch.current && pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dx = pts[0]!.x - pts[1]!.x;
      const dy = pts[0]!.y - pts[1]!.y;
      const distance = Math.hypot(dx, dy);
      if (pinch.current.distance > 0) {
        const next = clamp(
          pinch.current.scale * (distance / pinch.current.distance),
          MIN_SCALE,
          MAX_SCALE,
        );
        const cx = (pts[0]!.x + pts[1]!.x) / 2;
        const cy = (pts[0]!.y + pts[1]!.y) / 2;
        applyZoom(next, cx, cy);
      }
      return;
    }
    const viewport = viewportRef.current;
    if (!viewport || !drag.current) return;
    viewport.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
    viewport.scrollTop = drag.current.top - (event.clientY - drag.current.y);
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  if (!people.length || !layout.nodes.length) {
    return (
      <p className="muted ft-tree-empty">Information not yet provided</p>
    );
  }

  return (
    <div className="ft-genealogy-wrap">
      <div className="ft-toolbar" role="toolbar" aria-label="Family tree view">
        <button type="button" className="filter-chip" onClick={() => zoomBy(1 / 1.2)}>
          Zoom out
        </button>
        <button type="button" className="filter-chip" onClick={() => zoomBy(1.2)}>
          Zoom in
        </button>
        <button type="button" className="filter-chip" onClick={fitToScreen}>
          Fit to screen
        </button>
      </div>

      <div
        ref={viewportRef}
        className="ft-viewport"
        role="region"
        aria-label={`${family.name} family tree`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <div
          className="ft-canvas"
          style={{
            width: layout.width * scale,
            height: layout.height * scale,
          }}
        >
          <div
            className="ft-genealogy"
            style={{
              width: layout.width,
              height: layout.height,
              transform: `scale(${scale})`,
            }}
          >
            <svg
              className="ft-lines"
              width={layout.width}
              height={layout.height}
              aria-hidden
            >
              {layout.edges.map((edge) => (
                <path
                  key={edge.id}
                  d={edge.d}
                  className={
                    edge.kind === "spouse" ? "ft-line-spouse" : "ft-line-descent"
                  }
                />
              ))}
            </svg>
            {layout.nodes.map((node) => {
              const person = peopleById.get(node.id);
              if (!person) return null;
              const labels = treeNodeStatus(person, node.ambiguous);
              const photo = memberPhotoSrc(person.photo);
              const open = selectedId === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  className="ft-node"
                  data-person-id={person.id}
                  data-adapaduchu={person.adapaduchu || undefined}
                  data-deceased={person.deceased || undefined}
                  data-selected={open || undefined}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                  }}
                  onClick={() => setSelectedId(person.id)}
                >
                  <span className="ft-node-photo" aria-hidden>
                    {photo ? (
                      <ProtectedMedia>
                        <img
                          src={photo}
                          alt=""
                          width={48}
                          height={48}
                          draggable={false}
                        />
                      </ProtectedMedia>
                    ) : (
                      <span>{initials(person.fullName)}</span>
                    )}
                  </span>
                  <span className="ft-node-body">
                    <strong>{person.fullName}</strong>
                    {labels.length ? (
                      labels.map((label) => <span key={label}>{label}</span>)
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selected ? (
        <aside
          className="ft-person-panel"
          role="dialog"
          aria-labelledby="ft-person-panel-title"
        >
          <div className="ft-person-panel-head">
            <h3 id="ft-person-panel-title">{selected.fullName}</h3>
            <button
              type="button"
              className="filter-chip"
              onClick={() => setSelectedId(null)}
            >
              Close
            </button>
          </div>
          <ul className="ft-profile-flags">
            {(treeNodeStatus(selected).length
              ? treeNodeStatus(selected)
              : ["Information not yet provided"]
            ).map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <dl className="ft-profile-dl">
            <div>
              <dt>Occupation</dt>
              <dd>{selected.occupation || "Information not yet provided"}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{selected.location || "Information not yet provided"}</dd>
            </div>
          </dl>
          <Link className="btn" href={personHref(selected)}>
            Open profile
          </Link>
        </aside>
      ) : null}
    </div>
  );
}
