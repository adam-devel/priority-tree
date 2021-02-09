import { focus } from "./glue";
import { root, TreeKnot } from "./TreeModel";

export const jump = {
   // may fail silently, or leave a message
   nextSib(knot: TreeKnot, { sideEffect = false } = {}) {
      if (sideEffect && !knot.hasNextSibling()) {
         const suc = new TreeKnot().attach(knot.getParent());
         // todo: handle the faluire; forward it to the user
         // not any soon; road blocked til implementing user level errors
         if (!suc) return;
      }

      focus(knot.getLastSibling());
   },
   sub(knot: TreeKnot, { sideEffect = false } = {}) {
      if (sideEffect && !knot.hasChildren()) {
         const suc = new TreeKnot().attach(knot);
         // todo: handle the faluire; forward it to the user
         // not any soon, road blocked til implementing user level errors
         if (!suc) return;
      }
      focus(knot.getFirstChild());
   },
   parent(knot: TreeKnot) {
      if (!knot.hasParent()) return;
      const parent = knot.getParent();
      if (parent === root) return;
      focus(parent);
   },
};
