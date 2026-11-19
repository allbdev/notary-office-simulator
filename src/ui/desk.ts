import { joinChecks, parseChecks } from "../core/validators";
import { list, t, windowName } from "../content/i18n";
import { formById, type FieldSpec } from "../content/forms";
import type { PlayContext } from "./context";
import { h } from "./dom";
import { idCard } from "./folder";
import { formDestination, ticketLabel } from "./format";

/**
 * The desk: one form on paper, with real inputs. Blue handwriting is the player; what the
 * cartório typed is in typewriter. On a phone it shows one field at a time.
 */
export class Desk {
  readonly el: HTMLElement;
  private active = 0;
  private fieldEls: HTMLElement[] = [];
  private counterEl!: HTMLElement;
  private paperEl!: HTMLElement;

  constructor(
    private readonly ctx: PlayContext,
    readonly template: string,
  ) {
    this.el = h("div", {
      class: "desk",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t(ctx.locale, `forms.${template}.title`),
    });
    this.el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        ctx.closeForm();
      }
    });
    this.render();
  }

  private lastRefusedField(): string | null {
    const msgs = this.ctx.game.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const line = msgs[i]!.line;
      if (line.kind === "formInvalid" && line.form === this.template) return line.field;
      if ((line.kind === "done" || line.kind === "final") && i < msgs.length - 1) break;
    }
    return null;
  }

  render(): void {
    const { locale, game } = this.ctx;
    const template = formById(this.template);
    const state = game.forms.get(this.template)!;
    const refused = this.lastRefusedField();
    const dest = formDestination(this.ctx.chain, this.template);
    const ordered = template.fields;

    this.fieldEls = ordered.map((field, i) => this.renderField(field, i, field.id === refused));
    this.paperEl = h(
      "div",
      { class: `form-paper one-at-a-time${state.pen === "black" ? " pen-black" : ""}` },
      h(
        "header",
        { class: "form-head" },
        h(
          "div",
          null,
          h("div", { class: "office" }, t(locale, "form.office")),
          h("h2", { id: "form-title" }, t(locale, `forms.${this.template}.title`)),
          h("div", { class: "sub" }, t(locale, `forms.${this.template}.subtitle`)),
        ),
        h(
          "div",
          { class: "via" },
          h("div", null, t(locale, "form.via")),
          h("div", null, t(locale, "form.viaNote")),
        ),
      ),
      this.fieldEls,
      h("div", { class: "stamp-space", "aria-hidden": "true" }, t(locale, "form.stampSpace")),
      h("p", { class: "fineprint" }, t(locale, "form.fineprint")),
    );

    this.counterEl = h("div", { class: "label", "aria-live": "polite" });
    const where = game.where;
    const rules = list(locale, `windows.${dest}.rules`);
    const penNote =
      state.pen && state.pen !== game.pen
        ? h(
            "p",
            { class: "warn" },
            t(locale, "form.penMismatch", { pen: t(locale, `folder.${game.pen}`) }),
          )
        : state.pen
          ? h(
              "p",
              { class: "note" },
              t(locale, "form.penWritten", { pen: t(locale, `folder.${state.pen}`) }),
            )
          : null;

    const side = h(
      "aside",
      { class: "desk-side" },
      where.kind === "queue"
        ? h(
            "div",
            { class: "ticket", style: { alignSelf: "center" } },
            h("span", { class: "office" }, t(locale, "landing.office")),
            h("span", { class: "small" }, t(locale, "landing.yourTicket")),
            h("span", { class: "big" }, ticketLabel(where.ticket)),
            h("span", { class: "small" }, windowName(locale, where.window).toUpperCase()),
          )
        : null,
      h(
        "div",
        { class: "card paper" },
        this.counterEl,
        h("div", { class: "desk-nav" }, [
          h(
            "button",
            { class: "btn btn-small", type: "button", onclick: () => this.move(-1) },
            t(locale, "form.prev"),
          ),
          h(
            "button",
            { class: "btn btn-small btn-primary", type: "button", onclick: () => this.move(1) },
            t(locale, "form.next"),
          ),
        ]),
        h("p", { class: "note", style: { margin: "0", fontSize: "13px" } }, t(locale, "form.tip")),
      ),
      h("div", { class: "card paper" }, idCard(this.ctx, true), penNote),
      h(
        "div",
        { class: "card paper" },
        h(
          "strong",
          null,
          t(locale, dest === 3 ? "form.goesToFinal" : "form.goesTo", {
            window: windowName(locale, dest),
          }),
        ),
        h("span", { class: "label" }, t(locale, "form.rules")),
        h(
          "ol",
          null,
          rules.map((r) => h("li", null, r)),
        ),
      ),
      h(
        "div",
        { class: "actions-row" },
        h(
          "button",
          { class: "btn btn-danger btn-small", type: "button", onclick: () => this.tear() },
          t(locale, "form.tear"),
        ),
        h(
          "button",
          { class: "btn btn-small", type: "button", onclick: () => this.ctx.closeForm() },
          t(locale, "form.close"),
        ),
      ),
    );

    this.el.replaceChildren(h("div", { class: "desk-inner" }, this.paperEl, side));
    this.setActive(Math.min(this.active, this.fieldEls.length - 1), false);
  }

  private renderField(field: FieldSpec, index: number, refused: boolean): HTMLElement {
    const { locale, game } = this.ctx;
    const state = game.forms.get(this.template)!;
    const id = `f-${this.template}-${field.id}`;
    const number = field.number ?? index + 1;
    const label = t(locale, `forms.${this.template}.fields.${field.id}.label`);
    const numBadge = h("span", { class: "num", "aria-hidden": "true" }, number);
    const note = refused
      ? h(
          "span",
          { class: "refused-note", id: `${id}-note` },
          t(locale, `forms.${this.template}.fields.${field.id}.refusal`),
        )
      : null;
    const cls = `field${field.kind === "signature" ? " signature" : ""}${refused ? " refused" : ""}`;
    const onFocus = () => this.setActive(index, false);

    if (field.printed) {
      return h(
        "div",
        { class: cls, onfocusin: onFocus },
        h("span", { class: "label" }, numBadge, label, " · ", t(locale, "form.printed")),
        h("span", { class: "printed", tabindex: 0 }, field.printed),
      );
    }

    if (field.kind === "checks") {
      const ticked = new Set(parseChecks(state.values[field.id] ?? ""));
      const boxes = (field.options ?? []).map((opt) => {
        const input = h("input", {
          type: "checkbox",
          value: opt,
          checked: ticked.has(opt),
          "aria-describedby": note ? `${id}-note` : undefined,
          onchange: (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.checked) ticked.add(opt);
            else ticked.delete(opt);
            box.textContent = target.checked ? "x" : "";
            this.ctx.dispatch({
              type: "fill",
              form: this.template,
              field: field.id,
              value: joinChecks([...ticked]),
            });
          },
        });
        const box = h("span", { class: "box", "aria-hidden": "true" }, ticked.has(opt) ? "x" : "");
        return h(
          "label",
          { class: "check" },
          input,
          box,
          t(locale, `forms.${this.template}.options.${opt}`),
        );
      });
      return h(
        "div",
        { class: cls, onfocusin: onFocus },
        h("fieldset", null, h("legend", null, numBadge, label), boxes),
        note,
      );
    }

    const input = h("input", {
      type: "text",
      id,
      value: state.values[field.id] ?? "",
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: "false",
      "aria-describedby": note ? `${id}-note` : undefined,
      oninput: (e: Event) => {
        this.ctx.dispatch({
          type: "fill",
          form: this.template,
          field: field.id,
          value: (e.target as HTMLInputElement).value,
        });
      },
      onkeydown: (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.move(1);
        }
      },
    });
    return h(
      "div",
      { class: cls, onfocusin: onFocus },
      h("label", { for: id }, numBadge, label),
      input,
      note,
    );
  }

  private setActive(index: number, focus: boolean): void {
    this.active = Math.max(0, Math.min(index, this.fieldEls.length - 1));
    this.fieldEls.forEach((el, i) => el.classList.toggle("active", i === this.active));
    this.counterEl.textContent = t(this.ctx.locale, "form.counter", {
      i: this.active + 1,
      n: this.fieldEls.length,
    });
    if (focus) {
      const target = this.fieldEls[this.active]!.querySelector<HTMLElement>("input, [tabindex]");
      target?.focus();
    }
  }

  private move(delta: number): void {
    this.setActive(this.active + delta, true);
  }

  private tear(): void {
    this.ctx.dispatch({ type: "tear", form: this.template });
    this.active = 0;
    this.render();
    this.setActive(0, true);
  }

  focusFirst(): void {
    this.setActive(this.active, true);
  }
}
