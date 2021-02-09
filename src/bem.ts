type ModRecord = Record<string, string | boolean>;
type ModMap = Map<string, string | boolean>;
// todo: the is badly designed, does not follow a naming conventions, and is not well tested
export class Block {
   private readonly block: string;
   private element: string | null = null;
   private mods: ModMap = new Map();
   private originalClasses: string[] | null = null;
   constructor(block: string, element?: string) {
      this.block = block;
      if (element) this.element = element;
   }
   private get base() {
      return `${this.block}${this.element ? `__${this.element}` : ""}`;
   }
   switch(key: string, value: boolean) {
      if (this.mods.has(key)) {
         const value = this.mods.get(key);
         if (typeof value !== "boolean") throw Error("cannot switch non-boolean modifers");
      }
      this.mods.set(key, value);
      return this;
   }
   on(key: string) {
      this.switch(key, false);
      return this;
   }
   off(key: string) {
      this.switch(key, true);
      return this;
   }
   mod(mods: ModRecord = {}) {
      Object.entries(mods).forEach(([k, v]) => {
         this.mods.set(k, v);
      });
      return this;
   }
   elt(element: string) {
      const bem = new Block(this.block, element);
      return bem;
   }
   list() {
      const classes = [this.base];
      this.mods.forEach((v, k) => {
         if (!v) return;
         classes.push(this.expand(k, v));
      });
      return classes;
   }
   className() {
      return this.list().join(" ");
   }
   apply(elt: HTMLElement) {
      if (this.originalClasses === null) this.originalClasses = [...elt.classList];
      this.originalClasses.concat(this.list()).forEach((c) => elt.classList.add(c));
   }
   expand(key: string, value: string | true): string {
      return `${this.base}--${key}${value === true ? "" : "_" + value}`;
   }
}
