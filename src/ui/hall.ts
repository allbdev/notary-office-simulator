import { WINDOW_IDS, type WindowId } from "../core/docs";
import type { WindowStatus } from "../core/game";

/**
 * The hall, drawn in Canvas 2D: back wall, five booths with green signs and glass, the LED
 * panel, the wall clock, ropes, plastic chairs, and the people in each line. A placeholder for the
 * final hall art (see TODO_FOR_YOU.md). It only draws; the clickable booths are DOM buttons laid
 * over it, so the hall is usable with a keyboard and a screen reader.
 */

/** The canvas is 16:9, like the hall render (src/assets/hall.jpg, made by the developer). */
export const HALL_W = 1600;
export const HALL_H = 900;

export interface HallScene {
  clock: string;
  panelTicket: string;
  panelWindow: string;
  booths: {
    id: WindowId;
    role: string;
    status: WindowStatus["kind"];
    queue: number;
    playerInLine: boolean;
    playerAtWindow: boolean;
  }[];
  systemDown: boolean;
  /** Words painted in the hall, from the locale. */
  labels: {
    ticket: string;
    window: string;
    systemDown: string;
    closed: string;
    away: string;
    sign: (id: WindowId) => string;
  };
}

/**
 * Where things are in the hall render, as fractions of its width and height. Measured on the
 * 16:9 image; if the render changes, re-measure these.
 */
const PHOTO = {
  booths: {
    1: { x: 0.05, y: 0.378, w: 0.1375, h: 0.198 },
    2: { x: 0.244, y: 0.384, w: 0.12, h: 0.187 },
    3: { x: 0.415, y: 0.391, w: 0.1, h: 0.175 },
    4: { x: 0.5635, y: 0.396, w: 0.0915, h: 0.164 },
    5: { x: 0.694, y: 0.404, w: 0.071, h: 0.151 },
  } as Record<WindowId, { x: number; y: number; w: number; h: number }>,
  led: { x: 0.511, y: 0.213, w: 0.1415, h: 0.089 },
  clock: { cx: 0.7475, cy: 0.2942, r: 0.0125 },
  /** Where the first person in line stands (feet), as a fraction of the height. */
  floorY: 0.84,
};

/** A booth's opening in the hall, as fractions of the hall (the DOM buttons sit exactly on it). */
export function boothRect(id: WindowId): { x: number; y: number; w: number; h: number } {
  return PHOTO.booths[id];
}

/** Horizontal centre of each booth, as a fraction of the hall width (shared with the DOM overlay). */
export function boothCenter(id: WindowId): number {
  const b = PHOTO.booths[id];
  return b.x + b.w / 2;
}

const C = {
  wall: "#d8d3bf",
  wallLow: "#c9c3ab",
  floorA: "#b9b29b",
  floorB: "#aea78f",
  signage: "#17402e",
  booth: "#8d8a7a",
  boothDark: "#6f6c5e",
  glass: "rgba(196, 214, 220, 0.85)",
  counter: "#d7cfb4",
  person: "#6b6b63",
  personDark: "#55533f",
  you: "#24459c",
  led: "#ff3a22",
  ledAmber: "#ffb020",
  rope: "#8a2a24",
  brass: "#b08d3c",
  chair: "#3f6fa3",
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function person(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 58 * scale, 11 * scale, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, x - 15 * scale, y - 46 * scale, 30 * scale, 46 * scale, 10 * scale);
  ctx.fill();
}

/** The hall: the render with live state painted over it, or the drawn fallback if it didn't load. */
export function drawHall(
  ctx: CanvasRenderingContext2D,
  scene: HallScene,
  photo?: CanvasImageSource | null,
): void {
  if (photo) {
    drawPhotoHall(ctx, scene, photo);
    return;
  }
  ctx.save();
  ctx.scale(HALL_W / 1280, HALL_H / 656);
  drawFallbackHall(ctx, scene);
  ctx.restore();
}

function drawPhotoHall(
  ctx: CanvasRenderingContext2D,
  scene: HallScene,
  photo: CanvasImageSource,
): void {
  const W = HALL_W;
  const H = HALL_H;
  ctx.drawImage(photo, 0, 0, W, H);
  const img = (r: { x: number; y: number; w: number; h: number }) =>
    [r.x * W, r.y * H, r.w * W, r.h * H] as const;
  // The render's source size, to copy patches from it.
  const sw = (photo as HTMLImageElement).naturalWidth || W;
  const sh = (photo as HTMLImageElement).naturalHeight || H;
  const src = (r: { x: number; y: number; w: number; h: number }) =>
    [r.x * sw, r.y * sh, r.w * sw, r.h * sh] as const;

  for (const b of scene.booths) {
    const rect = PHOTO.booths[b.id];
    const working = b.status === "open" || b.status === "outOfInk" || b.status === "systemDown";
    if (working && b.id === 4) {
      // The render has window 4 shuttered for lunch: open it with window 3's shelves.
      ctx.drawImage(photo, ...src(PHOTO.booths[3]), ...img(rect));
    } else if (!working) {
      if (b.id !== 4) ctx.drawImage(photo, ...src(PHOTO.booths[4]), ...img(rect));
      // A paper sign over the shutter (covers the render's own "ALMOÇO" note).
      const [x, y, w, h] = img(rect);
      const pw = Math.min(w * 0.7, 120);
      const ph = 34;
      ctx.fillStyle = "#fbfaf4";
      ctx.fillRect(x + w / 2 - pw / 2, y + h * 0.42, pw, ph);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.strokeRect(x + w / 2 - pw / 2, y + h * 0.42, pw, ph);
      ctx.fillStyle = "#a8231c";
      ctx.font = "bold 15px 'Courier Prime', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        b.status === "closed" ? scene.labels.closed : scene.labels.away,
        x + w / 2,
        y + h * 0.42 + ph / 2,
        pw - 8,
      );
    }
  }

  // LED panel: today's ticket, not the render's.
  const [lx, ly, lw, lh] = img(PHOTO.led);
  ctx.fillStyle = "#070707";
  ctx.fillRect(lx, ly, lw, lh);
  ctx.fillStyle = scene.systemDown ? "#ffb020" : "#ff3a22";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (scene.systemDown) {
    ctx.font = `${Math.round(lh * 0.32)}px VT323, monospace`;
    ctx.fillText(scene.labels.systemDown, lx + lw / 2, ly + lh / 2, lw - 10);
  } else {
    ctx.font = `${Math.round(lh * 0.22)}px VT323, monospace`;
    ctx.fillText(scene.labels.ticket, lx + lw * 0.27, ly + lh * 0.22);
    ctx.fillText(scene.labels.window, lx + lw * 0.78, ly + lh * 0.22);
    ctx.font = `${Math.round(lh * 0.52)}px VT323, monospace`;
    ctx.fillText(scene.panelTicket, lx + lw * 0.27, ly + lh * 0.64);
    ctx.fillText(scene.panelWindow, lx + lw * 0.78, ly + lh * 0.64);
  }

  // Wall clock hands.
  const cx = PHOTO.clock.cx * W;
  const cy = PHOTO.clock.cy * H;
  const r = PHOTO.clock.r * W;
  ctx.fillStyle = "#f4f4ef";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.fill();
  const [hh, mm] = scene.clock.split(":").map(Number) as [number, number];
  ctx.strokeStyle = "#1c1d1a";
  ctx.lineCap = "round";
  const hand = (angle: number, len: number, width: number) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(angle) * len, cy - Math.cos(angle) * len);
    ctx.stroke();
  };
  hand(((hh % 12) + mm / 60) * (Math.PI / 6), r * 0.45, 3);
  hand(mm * (Math.PI / 30), r * 0.7, 2);

  // People in line, from the counter towards you; you're in blue.
  for (const b of scene.booths) {
    const x0 = boothCenter(b.id) * W;
    const total = Math.min(4, b.queue + (b.playerInLine ? 1 : 0));
    for (let i = total - 1; i >= 0; i--) {
      const isYou = b.playerInLine && i === total - 1;
      const feet = (PHOTO.floorY + i * 0.035) * H;
      const s = 1.7 + i * 0.22;
      ctx.save();
      ctx.globalAlpha = isYou ? 0.95 : 0.82;
      person(
        ctx,
        x0 + (i % 2 === 0 ? -10 : 10) * s,
        feet,
        s,
        isYou ? C.you : i % 2 ? "#4a4a44" : "#3a3a35",
      );
      ctx.restore();
    }
    if (b.playerAtWindow) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      person(ctx, x0, PHOTO.floorY * H - 6, 1.6, C.you);
      ctx.restore();
    }
  }
}

function drawFallbackHall(ctx: CanvasRenderingContext2D, scene: HallScene): void {
  const W = 1280;
  const H = 656;
  const boothCenter = (id: WindowId) => 0.12 + (id - 1) * 0.19;
  const floorY = H * 0.62;

  // Wall and floor.
  ctx.fillStyle = C.wall;
  ctx.fillRect(0, 0, W, floorY);
  ctx.fillStyle = C.wallLow;
  ctx.fillRect(0, floorY - 36, W, 36);
  const tile = 64;
  for (let y = floorY; y < H; y += tile / 2) {
    for (let x = ((y - floorY) / (tile / 2)) % 2 === 0 ? 0 : -tile / 2; x < W; x += tile) {
      ctx.fillStyle = C.floorA;
      ctx.fillRect(x, y, tile / 2, tile / 2);
      ctx.fillStyle = C.floorB;
      ctx.fillRect(x + tile / 2, y, tile / 2, tile / 2);
    }
  }

  // Fluorescent tubes.
  ctx.fillStyle = "#f6f4ea";
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, 120 + i * 300, 10, 180, 10, 4);
    ctx.fill();
  }

  // LED panel.
  const panelW = 330;
  const px = W / 2 - panelW / 2;
  ctx.fillStyle = "#1b1c1c";
  roundRect(ctx, px, 38, panelW, 84, 6);
  ctx.fill();
  ctx.fillStyle = "#070707";
  ctx.fillRect(px + 8, 46, panelW - 16, 68);
  ctx.fillStyle = scene.systemDown ? C.ledAmber : C.led;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (scene.systemDown) {
    ctx.font = "34px VT323, monospace";
    ctx.fillText(scene.labels.systemDown, W / 2, 80);
  } else {
    ctx.font = "18px VT323, monospace";
    ctx.fillText(scene.labels.ticket, W / 2 - 70, 58);
    ctx.fillText(scene.labels.window, W / 2 + 90, 58);
    ctx.font = "54px VT323, monospace";
    ctx.fillText(scene.panelTicket, W / 2 - 70, 92);
    ctx.fillText(scene.panelWindow, W / 2 + 90, 92);
  }

  // Wall clock.
  const cx = W - 70;
  const cy = 78;
  ctx.fillStyle = "#fbfaf4";
  ctx.beginPath();
  ctx.arc(cx, cy, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1c1d1a";
  ctx.lineWidth = 4;
  ctx.stroke();
  const [hh, mm] = scene.clock.split(":").map(Number) as [number, number];
  const hand = (angle: number, len: number, width: number) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(angle) * len, cy - Math.cos(angle) * len);
    ctx.stroke();
  };
  hand(((hh % 12) + mm / 60) * (Math.PI / 6), 18, 4);
  hand(mm * (Math.PI / 30), 28, 2.5);

  // Booths.
  const boothW = 200;
  const boothTop = 150;
  for (const b of scene.booths) {
    const x = boothCenter(b.id) * W - boothW / 2;
    // Frame and glass.
    ctx.fillStyle = C.booth;
    ctx.fillRect(x, boothTop, boothW, floorY - boothTop);
    ctx.fillStyle =
      b.status === "open" || b.status === "outOfInk" ? C.glass : "rgba(150, 160, 160, 0.9)";
    ctx.fillRect(x + 12, boothTop + 52, boothW - 24, floorY - boothTop - 120);
    // Blurred attendant.
    if (b.status === "open" || b.status === "outOfInk" || b.status === "systemDown") {
      ctx.save();
      ctx.filter = "blur(6px)";
      ctx.fillStyle = "rgba(122, 92, 72, 0.7)";
      ctx.beginPath();
      ctx.arc(x + boothW / 2, boothTop + 120, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(62, 90, 110, 0.7)";
      roundRect(ctx, x + boothW / 2 - 40, boothTop + 140, 80, 80, 30);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = "#fbfaf4";
      ctx.fillRect(x + boothW / 2 - 44, boothTop + 110, 88, 36);
      ctx.fillStyle = "#1c1d1a";
      ctx.font = "bold 14px 'Courier Prime', monospace";
      ctx.fillText(
        b.status === "closed" ? scene.labels.closed : scene.labels.away,
        x + boothW / 2,
        boothTop + 129,
      );
    }
    // Counter.
    ctx.fillStyle = C.counter;
    ctx.fillRect(x - 6, floorY - 70, boothW + 12, 22);
    ctx.fillStyle = C.boothDark;
    ctx.fillRect(x, floorY - 48, boothW, 48);
    // Sign: window name, and the role underneath.
    ctx.fillStyle = C.signage;
    ctx.fillRect(x + 8, boothTop + 4, boothW - 16, 44);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "800 17px 'Public Sans', sans-serif";
    ctx.fillText(scene.labels.sign(b.id), x + boothW / 2, boothTop + 19);
    ctx.font = "700 10.5px 'Public Sans', sans-serif";
    ctx.fillText(b.role.toUpperCase(), x + boothW / 2, boothTop + 37);
    ctx.textAlign = "center";
  }

  // Ropes and stanchions.
  const ropeY = floorY + 56;
  ctx.strokeStyle = C.rope;
  ctx.lineWidth = 5;
  for (let i = 0; i < WINDOW_IDS.length - 1; i++) {
    const a = boothCenter((i + 1) as WindowId) * W + 70;
    const b = boothCenter((i + 2) as WindowId) * W - 70;
    ctx.beginPath();
    ctx.moveTo(a, ropeY);
    ctx.quadraticCurveTo((a + b) / 2, ropeY + 22, b, ropeY);
    ctx.stroke();
  }
  for (let i = 0; i < WINDOW_IDS.length - 1; i++) {
    for (const x of [
      boothCenter((i + 1) as WindowId) * W + 70,
      boothCenter((i + 2) as WindowId) * W - 70,
    ]) {
      ctx.fillStyle = C.brass;
      ctx.fillRect(x - 4, ropeY - 6, 8, 70);
      ctx.beginPath();
      ctx.arc(x, ropeY - 8, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // People in line, front to back, getting smaller towards the back.
  for (const b of scene.booths) {
    const x0 = boothCenter(b.id) * W;
    const total = Math.min(6, b.queue + (b.playerInLine ? 1 : 0));
    for (let i = total - 1; i >= 0; i--) {
      const isYou = b.playerInLine && i === total - 1;
      const y = floorY + 20 + i * 26;
      const s = 0.9 + i * 0.07;
      person(
        ctx,
        x0 + (i % 2 === 0 ? -8 : 8),
        y,
        s,
        isYou ? C.you : i % 2 ? C.person : C.personDark,
      );
    }
    if (b.playerAtWindow) person(ctx, x0, floorY + 6, 0.95, C.you);
  }

  // Plastic chairs.
  for (let i = 0; i < 9; i++) {
    const x = 70 + i * 132;
    const y = H - 30;
    ctx.fillStyle = C.chair;
    roundRect(ctx, x, y - 36, 54, 14, 4);
    ctx.fill();
    roundRect(ctx, x + 4, y - 64, 46, 26, 6);
    ctx.fill();
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(x + 6, y - 22, 4, 22);
    ctx.fillRect(x + 44, y - 22, 4, 22);
  }
}
