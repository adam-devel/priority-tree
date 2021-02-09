import {
   afterAttach,
   beforeRemove,
   onBecomeLeaf,
   onBecomeParent,
   onCreate,
   root as modelRoot,
   TreeKnot,
} from "./TreeModel.js";
import { DomKnot, root as viewRoot } from "./TreeView.js";

const map: Map<TreeKnot, DomKnot> = new Map();
map.set(modelRoot, viewRoot);
function domOf(treeKnot: TreeKnot) {
   if (!map.has(treeKnot)) throw Error("knot is not reflected in the dom");
   return map.get(treeKnot)!;
}

// Reflect Tree structure changes
onCreate.connect(({ knot: source }) => {
   let view = new DomKnot(source);
   map.set(source, view);
});
beforeRemove.connect(({ knot: source }) => {
   const element = domOf(source);
   element.remove();
});
afterAttach.connect(({ knot }) => {
   domOf(knot).attach(domOf(knot.getParent()));
   domOf(knot).updatePriority();
});
onBecomeLeaf.connect(({ knot }) => {
   domOf(knot).priorityView.style.setProperty("display", "block");
});
onBecomeParent.connect(({ knot }) => {
   domOf(knot).priorityView.style.setProperty("display", "none");
});
// Dom State
function isEmpty(knot: TreeKnot) {
   return domOf(knot).isEmpty();
}
function focus(knot: TreeKnot) {
   domOf(knot).focus();
}
export { domOf, focus, isEmpty };
