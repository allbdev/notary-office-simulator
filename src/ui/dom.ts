/** A tiny element builder. No framework: the UI is small and mostly paper. */

export type Child = Node | string | number | null | undefined | false | Child[];

export type Props = Record<string, unknown> & {
  class?: string;
  text?: string;
};

function append(parent: Node, child: Child): void {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) {
    for (const c of child) append(parent, c);
  } else if (child instanceof Node) {
    parent.appendChild(child);
  } else {
    parent.appendChild(document.createTextNode(String(child)));
  }
}

function applyProps(el: Element, props: Props): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") el.setAttribute("class", String(value));
    else if (key === "text") el.textContent = String(value);
    else if (key === "style" && typeof value === "object")
      Object.assign((el as HTMLElement).style, value);
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === "value" && "value" in el) (el as HTMLInputElement).value = String(value);
    else if (key === "checked" && "checked" in el)
      (el as HTMLInputElement).checked = Boolean(value);
    else el.setAttribute(key, value === true ? "" : String(value));
  }
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props | null = null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) applyProps(el, props);
  append(el, children);
  return el;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function svg(
  tag: string,
  props: Record<string, string | number> = {},
  ...children: Child[]
): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(props)) el.setAttribute(k, String(v));
  append(el, children);
  return el;
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Sets text only when it changed, so screen readers and layout aren't disturbed every frame. */
export function setText(el: Element | null | undefined, text: string): void {
  if (el && el.textContent !== text) el.textContent = text;
}

export function icon(name: "check" | "circle" | "arrow" | "x"): SVGElement {
  const paths: Record<string, string> = {
    check: "M2 7.5l3.2 3.2L12 3.5",
    arrow: "M2 7h9M8 3.5L11.5 7 8 10.5",
    x: "M3 3l8 8M11 3l-8 8",
    circle: "",
  };
  if (name === "circle") {
    return svg(
      "svg",
      {
        width: 14,
        height: 14,
        viewBox: "0 0 14 14",
        "aria-hidden": "true",
        class: "icon icon-circle",
      },
      svg("circle", {
        cx: 7,
        cy: 7,
        r: 5,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 2,
      }),
    );
  }
  return svg(
    "svg",
    {
      width: 14,
      height: 14,
      viewBox: "0 0 14 14",
      "aria-hidden": "true",
      class: `icon icon-${name}`,
    },
    svg("path", {
      d: paths[name]!,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2.4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  );
}
