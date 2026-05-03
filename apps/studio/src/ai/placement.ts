import type { Editor } from "tldraw";
import { createShapeId } from "tldraw";
import type { FuturemodShapeMeta } from "../data/types";

export interface PlaceWidgetOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  meta: FuturemodShapeMeta;
}

/**
 * Places a FutureMod block on the **app canvas** using the native `futuremod` shape (live UI via HTMLContainer).
 */
export function placeFuturemodWidget(editor: Editor, opts: PlaceWidgetOptions) {
  const w = opts.width ?? 380;
  const h = opts.height ?? 220;
  editor.createShape({
    id: createShapeId(),
    type: "futuremod",
    x: opts.x,
    y: opts.y,
    props: {
      w,
      h,
      component: opts.meta.component,
      title: opts.meta.title ?? "",
      queryId: opts.meta.queryId ?? "",
    },
  });
}
