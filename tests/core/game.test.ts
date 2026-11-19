import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { LAST_TICK, clockMinutes, clockToTick } from "../../src/core/clock";
import { auth, copy, docKey, form, paid, protocol, start } from "../../src/core/docs";
import { Game, simulate } from "../../src/core/game";
import { solveChain } from "../../src/core/solver";
import { generateChain } from "../../src/core/generator";
import { fillCorrectly, quietChain, visit } from "./helpers";

describe("game", () => {
  it("starts in the hall with your ID and goal document", () => {
    const g = new Game(quietChain([form("annexU")]));
    expect(g.tick).toBe(0);
    expect(g.where.kind).toBe("hall");
    expect(g.held.has("start:id")).toBe(true);
    expect(g.held.has("start:goal")).toBe(true);
  });

  it("calls you when the line is empty", () => {
    const g = new Game(quietChain([form("annexU")]));
    g.dispatch({ type: "takeTicket", window: 3 });
    expect(g.where.kind).toBe("queue");
    g.step();
    expect(g.where).toMatchObject({ kind: "window", window: 3 });
    expect(g.messages.at(-1)!.line.kind).toBe("called");
  });

  it("window 3 reveals one requirement per visit and hands over its form", () => {
    const g = new Game(quietChain([protocol(form("f27b")), paid(form("darf"))]));
    const first = visit(g, 3);
    expect(first).toMatchObject({ kind: "reveal", route: [1], forms: ["f27b"] });
    expect(g.forms.has("f27b")).toBe(true);
    expect(g.forms.has("darf")).toBe(false);
    expect(visit(g, 3)).toMatchObject({ kind: "reveal", route: [5], forms: ["darf"] });
    expect(visit(g, 3)).toMatchObject({ kind: "stillMissing" });
    expect(g.refusals).toBe(1);
    expect(g.visits.map((v) => v.outcome)).toEqual(["info", "info", "refused"]);
  });

  it("window 1 refuses black pen, then accepts blue", () => {
    const g = new Game(quietChain([protocol(form("f27b"))], { pen: "black" }));
    visit(g, 3);
    fillCorrectly(g, "f27b");
    expect(g.forms.get("f27b")!.pen).toBe("black");
    expect(visit(g, 1)).toMatchObject({ kind: "bluePen" });
    g.dispatch({ type: "tear", form: "f27b" });
    g.dispatch({ type: "setPen", pen: "blue" });
    fillCorrectly(g, "f27b");
    expect(visit(g, 1)).toMatchObject({ kind: "done" });
    expect(g.held.has(docKey(protocol(form("f27b"))))).toBe(true);
    expect(g.held.has("form:f27b")).toBe(false);
  });

  it("refuses a form with a wrong field, naming the field", () => {
    const g = new Game(quietChain([protocol(form("darf"))]));
    visit(g, 3);
    fillCorrectly(g, "darf");
    g.dispatch({ type: "fill", form: "darf", field: "amount", value: "0,37" });
    expect(visit(g, 1)).toEqual({ kind: "formInvalid", form: "darf", field: "amount" });
    expect(g.forms.get("darf")!.refusals).toBe(1);
  });

  it("form 27-B must be filled in box-number order", () => {
    const g = new Game(quietChain([protocol(form("f27b"))]));
    visit(g, 3);
    const p = g.chain.profile;
    const reversed = Array.from(p.fullName).reverse().join("");
    const even = Array.from(p.cpf.replace(/\D/g, ""))
      .filter((d) => Number(d) % 2 === 0)
      .join("");
    g.dispatch({ type: "fill", form: "f27b", field: "reversed", value: reversed });
    g.dispatch({ type: "fill", form: "f27b", field: "name", value: p.fullName });
    g.dispatch({ type: "fill", form: "f27b", field: "cpfEven", value: even });
    expect(visit(g, 1)).toMatchObject({ kind: "fieldOrder" });
  });

  it("window 4 wants the copy, not the original; window 2 makes it", () => {
    const g = new Game(quietChain([auth(copy(start("id")))]));
    visit(g, 3);
    expect(visit(g, 4)).toMatchObject({ kind: "needCopyNotOriginal" });
    expect(visit(g, 2)).toMatchObject({ kind: "done" });
    expect(g.held.has("start:id")).toBe(true);
    expect(visit(g, 4)).toMatchObject({ kind: "done" });
    expect(g.held.has("auth(copy(start:id))")).toBe(true);
    expect(g.held.has("copy(start:id)")).toBe(false);
  });

  it("says what's missing first, and 'not here' for unrelated windows", () => {
    const g = new Game(quietChain([auth(copy(protocol(form("annexU"))))]));
    expect(visit(g, 2)).toMatchObject({ kind: "notHere" }); // not revealed yet
    visit(g, 3);
    expect(visit(g, 2)).toMatchObject({ kind: "needInput" });
    expect(visit(g, 5)).toMatchObject({ kind: "notHere" });
  });

  it("the copier jams on every fourth copy", () => {
    const g = new Game(quietChain([copy(start("id"))]));
    g.copiesMade = 3;
    visit(g, 3);
    expect(visit(g, 2)).toMatchObject({ kind: "jam" });
    expect(g.visits.at(-1)!.outcome).toBe("info");
    expect(visit(g, 2)).toMatchObject({ kind: "done" });
  });

  it("stamps when everything is in, and stops the clock", () => {
    const g = new Game(quietChain([form("annexU"), copy(start("goal"))]));
    visit(g, 3);
    visit(g, 3);
    fillCorrectly(g, "annexU");
    visit(g, 2);
    expect(visit(g, 3)).toMatchObject({ kind: "final" });
    expect(g.finishedAt).not.toBeNull();
    expect(g.over).toBe(true);
    const t = g.elapsed;
    g.step();
    expect(g.elapsed).toBe(t);
    expect(g.dispatch({ type: "takeTicket", window: 1 })).toBe(false);
  });

  it("checks forms handed straight to window 3 at the end", () => {
    const g = new Game(quietChain([form("negativeCertificate")]));
    visit(g, 3);
    fillCorrectly(g, "negativeCertificate");
    g.dispatch({ type: "fill", form: "negativeCertificate", field: "number", value: "42" });
    expect(visit(g, 3)).toMatchObject({ kind: "formInvalid", field: "number" });
    g.dispatch({ type: "fill", form: "negativeCertificate", field: "number", value: "" });
    expect(visit(g, 3)).toMatchObject({ kind: "final" });
  });

  it("doesn't call anyone during a break", () => {
    const lunch = { kind: "lunch" as const, start: 0, end: 50 };
    const base = quietChain([auth(copy(start("id")))]);
    const schedules = base.schedules.map((s) => (s.window === 4 ? { ...s, breaks: [lunch] } : s));
    const g = new Game({ ...base, schedules });
    g.dispatch({ type: "takeTicket", window: 4 });
    g.advanceTo(49);
    expect(g.where.kind).toBe("queue");
    expect(g.statusAt(4)).toMatchObject({ kind: "break", reason: "lunch", until: 50 });
    g.advanceTo(52);
    expect(g.where.kind).toBe("window");
  });

  it("closing a window sends you back to the hall", () => {
    const base = quietChain([paid(form("darf"))]);
    const closes = 30;
    const schedules = base.schedules.map((s) => (s.window === 5 ? { ...s, closes } : s));
    const arrivals = base.arrivals.map((a, i) => (i === 4 ? [{ tick: -10, service: 1000 }] : a));
    const g = new Game({ ...base, schedules, arrivals });
    g.dispatch({ type: "takeTicket", window: 5 });
    g.advanceTo(40);
    expect(g.where.kind).toBe("hall");
    expect(g.messages.some((m) => m.line.kind === "closed")).toBe(true);
    expect(g.statusAt(5).kind).toBe("closed");
    g.dispatch({ type: "takeTicket", window: 5 });
    expect(g.where.kind).toBe("hall");
  });

  it("the system going down stops every window", () => {
    const g = new Game(
      quietChain([form("annexU")], { events: [{ kind: "systemDown", start: 0, end: 30 }] }),
    );
    g.dispatch({ type: "takeTicket", window: 3 });
    g.advanceTo(25);
    expect(g.where.kind).toBe("queue");
    expect(g.statusAt(1).kind).toBe("systemDown");
    g.advanceTo(32);
    expect(g.where.kind).toBe("window");
  });

  it("a skipped ticket goes to the back of the line", () => {
    const base = quietChain([form("annexU")], {
      events: [{ kind: "ticketSkipped", window: 3, tick: 5 }],
    });
    const arrivals = base.arrivals.map((a, i) =>
      i === 2
        ? [
            { tick: 0, service: 100 },
            { tick: 2, service: 100 },
            { tick: 3, service: 100 },
          ]
        : a,
    );
    const g = new Game({ ...base, arrivals });
    g.advanceTo(1);
    g.dispatch({ type: "takeTicket", window: 3 });
    g.advanceTo(4);
    expect(g.peopleAhead(3)).toBe(1);
    g.advanceTo(6);
    expect(g.peopleAhead(3)).toBe(3);
    expect(g.messages.at(-1)!.line.kind).toBe("skipped");
  });

  it("switching lines loses your place", () => {
    const g = new Game(
      quietChain([form("annexU")], { arrivals: [[], [], [{ tick: 0, service: 500 }], [], []] }),
    );
    g.dispatch({ type: "takeTicket", window: 3 });
    g.dispatch({ type: "takeTicket", window: 1 });
    expect(g.peopleAhead(3)).toBeNull();
    expect(g.where).toMatchObject({ kind: "queue", window: 1 });
  });

  it("fails when the cartório closes", () => {
    const g = new Game(quietChain([form("annexU")]));
    g.advanceTo(LAST_TICK + 10);
    expect(g.failed).toBe(true);
    expect(g.messages.at(-1)!.line.kind).toBe("cartorioClosed");
    expect(g.elapsed).toBe(LAST_TICK);
  });

  it("ignores fills on forms you don't have and on printed boxes", () => {
    const g = new Game(quietChain([form("protocolOfProtocol")]));
    expect(
      g.dispatch({ type: "fill", form: "protocolOfProtocol", field: "repeat", value: "x" }),
    ).toBe(false);
    visit(g, 3);
    expect(
      g.dispatch({ type: "fill", form: "protocolOfProtocol", field: "previous", value: "x" }),
    ).toBe(false);
    expect(
      g.dispatch({ type: "fill", form: "protocolOfProtocol", field: "repeat", value: "x" }),
    ).toBe(true);
  });

  it("the pen of a form is the desk pen when you start writing, and tearing resets it", () => {
    const g = new Game(quietChain([form("annexU")], { pen: "black" }));
    visit(g, 3);
    g.dispatch({ type: "fill", form: "annexU", field: "pages", value: "1" });
    g.dispatch({ type: "setPen", pen: "blue" });
    expect(g.forms.get("annexU")!.pen).toBe("black");
    g.dispatch({ type: "tear", form: "annexU" });
    expect(g.forms.get("annexU")!.pen).toBeNull();
  });

  it("the folder reports each requirement's state", () => {
    const g = new Game(quietChain([form("annexU"), copy(start("id"))]));
    expect(g.requirementState(0)).toBe("unknown");
    visit(g, 3);
    expect(g.requirementState(0)).toBe("todo");
    fillCorrectly(g, "annexU");
    expect(g.requirementState(0)).toBe("done");
    visit(g, 3);
    expect(g.nextWindowFor(1)).toBe(2);
  });

  it("replays exactly from the input log (determinism)", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        const chain = generateChain(seed, "2026-11-19");
        const run = solveChain(chain, "discovery");
        const replay = simulate(chain, run.inputs, run.ticks + 5);
        expect(replay.finishedAt).toBe(run.ticks);
        expect(replay.visits).toEqual(run.visits);
      }),
      { numRuns: 40 },
    );
  });

  it("waits until a given wall-clock time", () => {
    expect(clockToTick(clockMinutes(11, 1))).toBe(20);
  });
});
