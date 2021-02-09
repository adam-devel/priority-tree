import { Emitter } from "./EventEmitter.js";

// Event Emitters
export const onCreate = new Emitter<{ knot: TreeKnot }>();
export const beforeAttach = new Emitter<{ knot: TreeKnot; parent: TreeKnot; oldParent: TreeKnot | null }>();
export const afterAttach = new Emitter<{ knot: TreeKnot; oldParent: TreeKnot | null }>();
export const beforeDetach = new Emitter<{ knot: TreeKnot; oldParent: TreeKnot }>();
export const afterDetach = new Emitter<{ knot: TreeKnot; oldParent: TreeKnot }>();
export const beforeRemove = new Emitter<{ knot: TreeKnot }>();
export const afterRemove = new Emitter<{ knot: TreeKnot }>();
export const onException = new Emitter<{ exception: Error }>();
export const onInfo = new Emitter<{ info: string }>();
export const onBecomeLeaf = new Emitter<{ knot: TreeKnot }>();
export const onBecomeParent = new Emitter<{ knot: TreeKnot }>();

// Knot Class
export class TreeKnot {
   // relations
   private parent: TreeKnot | null = null;
   private firstSibling: TreeKnot | null = null;
   private firstChild: TreeKnot | null = null;
   constructor() {
      onCreate.emit({ knot: this });
   }
   // ancestors
   hasParent() {
      return this.parent !== null;
   }
   getParent(): TreeKnot {
      if (this.hasParent()) return this.parent!;
      throw new Error("Knot has no ancestors");
   }
   getAncestors({ yieldSelf = false } = {}) {
      return [...this.getAncestorsIterator({ yieldSelf })];
   }
   *getAncestorsIterator({ yieldSelf = false } = {}): Generator<TreeKnot, void, void> {
      if (yieldSelf) yield this;
      if (this.hasParent()) yield* this.getParent().getAncestorsIterator({ yieldSelf: true });
   }
   // siblings (relative)
   hasNextSibling() {
      return this.firstSibling !== null;
   }
   getNextSibling(): TreeKnot {
      if (this.hasNextSibling()) return this.firstSibling!;
      throw new Error("Knot does not have a next siblings");
   }
   // previous...
   // fetchPreviousSibling() {
   //    for (const sib of this.getSiblingsIterator()) {
   //       if (sib.getNextSibling() === this) return sib;
   //    }
   //    return null;
   // }
   // siblings (absolute)
   hasSiblings() {
      if (this.hasParent()) return this.getParent().hasChildren();
      throw new Error("Knot does not have any siblings");
   }
   getFirstSibling() {
      if (this.hasParent()) return this.getParent().getFirstChild();
      else throw new Error("TreeKnot.getFirstSibling: Root knot has no siblings");
   }
   getLastSibling() {
      if (this.hasParent()) return this.getSiblings({ relative: true }).slice(-1)[0];
      throw Error("Knot.getLastSibling: Root knot has no siblings");
   }
   // siblings (adjacency-agnostic)
   getSiblings({ relative = false, yieldSelf = true } = {}) {
      return [...this.getSiblingsIterator({ relative, yieldSelf })];
   }
   *getSiblingsIterator({ relative = false, yieldSelf = false } = {}): Generator<TreeKnot, void, void> {
      if (!relative) return yield* this.getFirstSibling().getSiblingsIterator({ relative: true, yieldSelf });
      if (yieldSelf) yield this;
      if (this.hasNextSibling()) yield* this.getNextSibling().getSiblingsIterator({ relative: true, yieldSelf: true });
   }
   // children
   hasChildren() {
      return this.firstChild !== null;
   }
   getChildren() {
      return [...this.getChildrenIterator()];
   }
   getFirstChild(): TreeKnot {
      if (this.hasChildren()) return this.firstChild!;
      throw new Error("getFirstChild: Knot has no children");
   }
   getLastChild(): TreeKnot {
      if (this.hasChildren()) return this.getChildren().slice(-1)[0];
      throw new Error("Knot.getLastChild: Knot has no children");
   }
   *getChildrenIterator() {
      if (this.hasChildren()) yield* this.getFirstChild().getSiblingsIterator({ yieldSelf: true });
   }
   // operations
   attach(parent: TreeKnot): boolean {
      for (const ancestor of parent.getAncestorsIterator({ yieldSelf: true })) {
         if (ancestor === this) {
            onException.emit({
               exception: Error("Knot.attach: operation aborted; cyclic chain detected"),
            });
            return false;
         }
      }
      // old relatives
      const oldParent = this.parent;
      // emit before-attach
      const cancel = beforeAttach.emit({
         knot: this,
         parent: parent,
         oldParent,
      });
      if (cancel) return false;
      // detach if required
      if (this.hasParent()) {
         onInfo.emit({
            info: "Knot.attach: Knot already attached; Knot.detach()'ing",
         });
         const cancel = this.detach();
         if (cancel) return false;
      }
      // post-attach; rearrange relations
      this.parent = parent;
      if (parent.hasChildren()) {
         parent.getLastChild().firstSibling = this;
      } else {
         parent.firstChild = this;
      }
      // emit after-attach
      afterAttach.emit({ knot: this, oldParent });
      return true;
   }
   detach(): boolean {
      if (!this.hasParent()) {
         onInfo.emit({
            info: "Knot.detach: opertion aboted; Knot is already detached;",
         });
         return false;
      }
      // get relatives
      const parent = this.getParent();
      const sibling = this.hasNextSibling() ? this.getNextSibling() : null;
      // emit detach events
      const cancel = beforeDetach.emit({ knot: this, oldParent: parent });
      if (cancel) return false;
      // detach self
      this.parent = null;
      this.firstSibling = null;
      // post-detach; pointer re-arrangement
      if (parent.getFirstChild() === this) {
         parent.firstChild = sibling;
      } else {
         for (const sib of parent.getChildrenIterator()) {
            if (sib.getNextSibling() === this) {
               sib.firstSibling = sibling;
               return true;
            }
         }
      }
      afterDetach.emit({ knot: this, oldParent: parent });
      return true;
   }
   remove(recursive = true) {
      function _delete(knot: TreeKnot, recursive: boolean, first: boolean) {
         if (recursive) {
            for (const child of knot.getChildrenIterator()) {
               _delete(child, recursive, false);
            }
         } else {
            knot.getChildren().forEach((child) => {
               child.attach(knot.getParent());
            });
         }
         if (first) beforeRemove.emit({ knot: knot });
         knot.detach();
      }
      _delete(this, recursive, true);
   }
   // computed attributes
   getDepth() {
      return this.getAncestors().length;
   }
   // todo: comeup with a better name
   getNth(): number {
      if (!this.hasParent()) return 0;
      let i = 1;
      for (const child of this.getSiblings({})) {
         if (this === child) return i;
         i++;
      }
      throw Error("Knot.getNth: Unexpected Error");
   }
   getPriority(): number {
      if (!this.hasParent()) return 0;
      return this.getNth() + this.getParent().getPriority();
   }
}

// track breadths
const leafs = new Set<TreeKnot>();
onCreate.connect(({ knot }) => leafs.add(knot));
afterAttach.connect(({ knot }) => {
   const parent = knot.getParent();
   if (leafs.has(parent)) {
      leafs.delete(parent);
      onBecomeParent.emit({ knot: parent });
   }
});
afterDetach.connect(({ knot, oldParent }) => {
   if (!oldParent.hasChildren()) {
      leafs.add(oldParent);
      onBecomeLeaf.emit({ knot: oldParent });
   }
});
beforeRemove.connect(({ knot }) => {
   leafs.delete(knot);
});

// log infos and exceptions
onInfo.connect((info) => console.log(info));
onException.connect((err) => console.error(err));

// priority
export const flexibilty = 1;
export function maxPriority(): TreeKnot {
   let max = [...leafs][0];
   for (const knot of leafs) {
      if (knot.getPriority() >= root.getPriority()) max = knot;
   }
   return max;
}
export function minPriority() {
   let min = [...leafs][0];
   let knots = new Set<TreeKnot>();
   for (const knot of leafs) {
      if (knot.getPriority() < min.getPriority()) {
         min = knot;
         knots.clear();
      }
      if (knot.getPriority() === min.getPriority()) knots.add(knot);
   }
   return { min: min.getPriority(), knots };
}
// the root of the tree
export const root = new TreeKnot();

Object.defineProperty(globalThis, "Knot", {
   value: TreeKnot,
});
Object.defineProperty(globalThis, "Bread", {
   value: leafs,
});
