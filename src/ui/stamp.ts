import { svg } from "./dom";

/**
 * Rubber stamps, drawn rough on purpose: uneven ink (turbulence filter), a slight rotation,
 * never centred. Same construction as the "Stamps" board on the design canvas.
 */

export type StampColor = "blue" | "red";
export type StampShape = "rect" | "oval";

let filterId = 0;

export function stamp(
  text: string,
  sub: string,
  options: {
    color?: StampColor;
    shape?: StampShape;
    rotate?: number;
    width?: number;
    animate?: boolean;
  } = {},
): SVGElement {
  const color = options.color === "red" ? "#a8231c" : "#24459c";
  const width = options.width ?? 250;
  const rotate = options.rotate ?? -7;
  const id = `ink${++filterId}`;
  const mainSize = text.length > 14 ? Math.max(14, Math.round(300 / text.length)) : 26;
  const frame =
    options.shape === "oval"
      ? [
          svg("ellipse", {
            cx: 120,
            cy: 60,
            rx: 112,
            ry: 52,
            fill: "none",
            stroke: color,
            "stroke-width": 5,
          }),
          svg("ellipse", {
            cx: 120,
            cy: 60,
            rx: 102,
            ry: 43,
            fill: "none",
            stroke: color,
            "stroke-width": 1.5,
          }),
        ]
      : [
          svg("rect", {
            x: 6,
            y: 8,
            width: 228,
            height: 104,
            rx: 6,
            fill: "none",
            stroke: color,
            "stroke-width": 5,
          }),
          svg("rect", {
            x: 14,
            y: 16,
            width: 212,
            height: 88,
            rx: 3,
            fill: "none",
            stroke: color,
            "stroke-width": 1.5,
          }),
        ];
  const textProps = (y: number, size: number, weight: number) => ({
    x: 120,
    y,
    "text-anchor": "middle",
    "font-family": "Public Sans, sans-serif",
    "font-weight": weight,
    "font-size": size,
    fill: color,
  });
  const fit = (props: Record<string, string | number>, s: string, max: number) =>
    s.length * (Number(props["font-size"]) * 0.62) > max
      ? { ...props, textLength: max, lengthAdjust: "spacingAndGlyphs" }
      : { ...props, "letter-spacing": 1.5 };

  const el = svg(
    "svg",
    {
      role: "img",
      "aria-label": `${text}${sub ? ` · ${sub}` : ""}`,
      width,
      height: Math.round(width / 2),
      viewBox: "0 0 240 120",
      class: `stamp${options.animate ? " animate" : ""}`,
      style: `transform: rotate(${rotate}deg); --rot: ${rotate}deg`,
    },
    svg(
      "defs",
      {},
      svg(
        "filter",
        { id, x: "-5%", y: "-5%", width: "110%", height: "110%" },
        svg("feTurbulence", {
          type: "fractalNoise",
          baseFrequency: 0.9,
          numOctaves: 2,
          seed: filterId % 97,
          result: "n",
        }),
        svg("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 2.2, result: "d" }),
        svg("feColorMatrix", {
          in: "n",
          type: "matrix",
          values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55",
          result: "m",
        }),
        svg("feComposite", { in: "d", in2: "m", operator: "in" }),
      ),
    ),
    svg(
      "g",
      { filter: `url(#${id})` },
      ...frame,
      svg("text", fit(textProps(sub ? 66 : 72, mainSize, 800), text, 196), text),
      sub ? svg("text", fit(textProps(90, 13, 700), sub, 180), sub) : null,
    ),
  );
  return el;
}
