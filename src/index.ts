import { jump } from "./actions";
import { domOf, focus, isEmpty } from "./glue";
import { flexibilty, maxPriority, minPriority, root as modelRoot, TreeKnot } from "./TreeModel.js";
import { onContent, onFocus, onKeypress, root as viewRoot } from "./TreeView";

// embed the _invisible_ root node into "body > main"
viewRoot.embed(document.querySelector("body > main")!);

// the first Knot
const first = new TreeKnot();
first.attach(modelRoot);
// focus(first);

// user Interactions events
onContent.connect(({ source }) => {
   const { knot } = source;
   if (knot.hasChildren()) return;
   const min = minPriority();
   if (knot.getPriority() - min.min >= flexibilty) {
      min.knots.forEach((k) => domOf(k).hint());
      return;
   }
   const sibling = new TreeKnot();
   const sub = new TreeKnot();
   sub.attach(knot);
   sibling.attach(knot.getParent());
});

onKeypress.connect(({ event, source }) => {
   const { key } = event;
   const { knot } = source;
   switch (key) {
      case "Enter":
         // if (isEmpty(knot)) {
         //    if (knot.getParent() === modelRoot) return;
         //    if (knot.getFirstSibling() === knot) {
         //       const parent = knot.getParent();
         //       knot.remove();
         //       jump.nextSib(parent, { sideEffect: true });
         //    } else jump.parent(knot);
         // } else {
         jump.sub(knot, { sideEffect: true });
         // }
         break;
      case "Delete":
         if (knot.getParent() === modelRoot && knot.getFirstSibling() === knot) {
            return; // emit a user-level warning/info
         }
         event.preventDefault();
         knot.remove();
         break;
   }
});
