import type { Editor } from "tldraw";
import { Button, Label, Separator } from "@futuremod/ui";
import { placeFuturemodWidget } from "../ai/placement";

interface ComponentPaletteProps {
  editor: Editor | null;
}

function centerOfViewport(editor: Editor) {
  const b = editor.getViewportPageBounds();
  return { x: b.x + b.w / 2 - 190, y: b.y + b.h / 2 - 110 };
}

export function ComponentPalette({ editor }: ComponentPaletteProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div>
        <h2 className="text-sm font-semibold">Blocks</h2>
        <p className="text-xs text-muted-foreground">
          Insert frames on the <span className="font-medium text-foreground">app canvas</span>. Agents call{" "}
          <code className="text-[10px]">placeFuturemodWidget</code>.
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs">Dashboard</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!editor}
            onClick={() => {
              if (!editor) return;
              const { x, y } = centerOfViewport(editor);
              placeFuturemodWidget(editor, {
                x,
                y,
                meta: { component: "StatCard", title: "Revenue", queryId: "q-revenue" },
              });
            }}
          >
            StatCard + revenue query
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!editor}
            onClick={() => {
              if (!editor) return;
              const { x, y } = centerOfViewport(editor);
              placeFuturemodWidget(editor, {
                x,
                y,
                width: 520,
                height: 280,
                meta: { component: "Table", title: "Monthly breakdown", queryId: "q-revenue" },
              });
            }}
          >
            Data table
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!editor}
            onClick={() => {
              if (!editor) return;
              const { x, y } = centerOfViewport(editor);
              placeFuturemodWidget(editor, {
                x,
                y,
                meta: { component: "Alert", title: "North-star metric improved" },
              });
            }}
          >
            Alert callout
          </Button>
        </div>
      </div>
    </div>
  );
}
