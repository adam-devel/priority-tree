import { Emitter } from "./EventEmitter";
import { root as modelRoot, TreeKnot } from "./TreeModel";

// Exposed Event Emitters
export const onFocus = new Emitter<{ e: FocusEvent; source: ViewKnot }>();
export const onEmpty = new Emitter<{ source: ViewKnot }>();
export const onContent = new Emitter<{ source: ViewKnot }>();
export const onKeypress = new Emitter<{ event: KeyboardEvent; source: ViewKnot }>();

// A knot *component*
class ViewKnot {
   static template = <HTMLTemplateElement> document.getElementById("knot-template");
   selfView: HTMLElement;
   childrenView: HTMLDivElement;
   inputView: HTMLInputElement;
   priorityView: HTMLDivElement;
   constructor(public knot: TreeKnot, readonly isroot = false) {
      this.selfView = document.importNode(ViewKnot.template.content, true).querySelector<HTMLDivElement>(".knot")!;
      this.inputView = this.selfView.querySelector<HTMLInputElement>(".knot__input")!;
      this.childrenView = this.selfView.querySelector<HTMLDivElement>(".knot__children")!;
      this.priorityView = this.selfView.querySelector<HTMLDivElement>(".knot__priority")!;
      // setInterval(() => {
      //    this.updatePriority();
      // });
      if (isroot) {
         this.selfView.classList.add("knot--isroot");
         return;
      }
      this.inputView.addEventListener("keyup", (e) => onKeypress.emit({ event: e, source: this }));
      this.inputView.addEventListener("focus", (e) => onFocus.emit({ e, source: this }));
      let isEmpty = true;
      this.inputView.addEventListener("input", () => {
         const { value } = this.inputView;
         this.inputView.style.setProperty("min-width", `${value.length}ch`);
         if (isEmpty !== this.isEmpty()) isEmpty = this.isEmpty();
         if (isEmpty) onEmpty.emit({ source: this });
         else onContent.emit({ source: this });
      });
   }
   fold() {
      this.childrenView.classList.add("knot__children--folded");
   }
   unfold() {
      this.childrenView.classList.remove("knot__children--folded");
   }
   attach(parent: ViewKnot, nextSibling: ViewKnot | null = null) {
      parent.childrenView.insertBefore(this.selfView, nextSibling ? nextSibling.selfView : null);
   }
   remove() {
      this.selfView.remove();
   }
   focus() {
      this.inputView.focus();
   }
   embed(element: Element) {
      if (!this.isroot) throw Error("ViewKnot.embed: refuse to embed non-root knot");
      element.appendChild(this.selfView);
   }
   isEmpty() {
      return this.inputView.value.trim() === "";
   }
   updatePriority() {
      this.priorityView.textContent = this.knot.getPriority().toString();
   }
   async hint() {
      this.priorityView.animate({
         transform: "translateX(0)",
      }, { duration: 100, fill: "forwards" });
      this.priorityView.animate({
         background: "hsl(0, 0%, 80%)",
      }, { duration: 300, fill: "forwards" });
      this.priorityView.animate({
         transform: "translateX(-20%)",
         offset: 0.5,
      }, { duration: 200 });
   }
}

export const root = new ViewKnot(modelRoot, true);
export { ViewKnot as DomKnot };
