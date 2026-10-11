// Beef-cuts diagram. Base image: "British Beef Cuts" (Wikimedia Commons,
// PUBLIC DOMAIN) at public/beef-cuts.svg.
//
// The source sets each cut's colour via an INLINE style="...fill:#xxx...".
// Inline styles beat setAttribute("fill"), which is why earlier attempts kept
// the rainbow colours. So here we rewrite the raw SVG TEXT: strip every cut's
// inline fill and tag it with a class, then control colour from CSS. The active
// cut gets a red class; everything else is one neutral colour.

import { useEffect, useMemo, useRef, useState } from "react";

const NEUTRAL = "#f3e7d8";
const ACTIVE = "#f26d6d";
const BODY = "#1a1413";

// app cut id -> chart region ids it covers. Every region in the chart is
// mapped to exactly one of our cuts so nothing is left dangling.
const GROUPS = {
  chuck: ["Chuck_Blade", "Neck_Clod"],
  ribeye: ["ForeRib", "path7361"], // path7361 = Thick Rib
  ribs: ["ThinRib"],
  sirloin: ["Sirloin"],
  tenderloin: ["Flank"], // belly strip under loin ~ fillet/skirt area
  round: ["Rump", "Topside", "Silverside", "Leg", "ThickFlank"],
  brisket: ["Brisket"],
  shank: ["Shin"],
  oxtail: [],
};

const CHART_TO_APP = {};
for (const [app, ids] of Object.entries(GROUPS)) {
  for (const id of ids) if (!CHART_TO_APP[id]) CHART_TO_APP[id] = app;
}
const ALL_CHART_IDS = Object.keys(CHART_TO_APP);

// Rewrite the SVG text so colours come from CSS classes, not inline fills.
function processSvg(raw) {
  let svg = raw;

  // 1) neutralize EVERY inline fill:#hex and fill:<name> inside style attrs
  svg = svg.replace(/fill:\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)/g, `fill:${NEUTRAL}`);

  // 2) body silhouette (#Cow) stays dark
  svg = svg.replace(
    /(id="Cow"[^>]*)/,
    (m) => m // id comes after style in this file; handle via class below
  );

  // 3) tag each region with a class we can target from CSS + a data attr for
  //    click mapping. We add class="cut cut-<appId>" right after the id="..."
  for (const chartId of ALL_CHART_IDS) {
    const app = CHART_TO_APP[chartId];
    svg = svg.replace(
      new RegExp(`id="${chartId}"`),
      `id="${chartId}" class="cut cut-${app}" data-app="${app}"`
    );
  }

  // 4) tag the body so CSS can keep it dark
  svg = svg.replace(/id="Cow"/, `id="Cow" class="cow-body"`);

  return svg;
}

export default function CowDiagram({ activeId, onSelect }) {
  const ref = useRef(null);
  const [raw, setRaw] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/beef-cuts.svg")
      .then((r) => r.text())
      .then((t) => alive && setRaw(t))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const html = useMemo(() => (raw ? processSvg(raw) : ""), [raw]);

  // size the svg + wire clicks
  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    // The source has width/height but NO viewBox, so removing height breaks
    // scaling and clips the legs. Add a viewBox from its native size, then let
    // it scale fluidly to the container width.
    if (!svg.getAttribute("viewBox")) {
      const w = svg.getAttribute("width") || "511";
      const h = svg.getAttribute("height") || "301";
      svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";

    const handler = (e) => {
      const el = e.target.closest("[data-app]");
      if (el) onSelect?.(el.getAttribute("data-app"));
    };
    svg.addEventListener("click", handler);
    return () => svg.removeEventListener("click", handler);
  }, [html, onSelect]);

  return (
    <div ref={ref} className="w-full" role="img" aria-label="Diagram bagian daging sapi">
      <style>{`
        .cut { fill: ${NEUTRAL} !important; stroke: ${BODY}; stroke-width: 1; cursor: pointer; transition: fill .2s; }
        .cut:hover { fill: #ead9c4 !important; }
        .cut-${activeId} { fill: ${ACTIVE} !important; }
        .cow-body { fill: ${BODY} !important; }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
