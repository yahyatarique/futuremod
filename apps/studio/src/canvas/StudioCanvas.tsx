import { useMemo } from "react";
import { Tldraw, type Editor } from "tldraw";
import { FuturemodShapeUtil } from "./FuturemodShapeUtil";
import { SelectionPreview } from "./SelectionPreview";

interface StudioCanvasProps {
  persistenceKey: string;
  onEditorMount: (editor: Editor) => void;
}

/**
 * App-building surface: custom **futuremod** shapes render FutureMod UI inside the canvas via HTMLContainer.
 */
export function StudioCanvas({ persistenceKey, onEditorMount }: StudioCanvasProps) {
  const shapeUtils = useMemo(() => [FuturemodShapeUtil], []);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-foreground">App canvas</h2>
          <p className="text-xs text-muted-foreground">
            Blocks render live here. Pan and zoom to arrange your page; pick the select tool to move widgets.
          </p>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <Tldraw
          persistenceKey={persistenceKey}
          shapeUtils={shapeUtils}
          onMount={(editor) => {
            editor.setCurrentTool("select");
            onEditorMount(editor);
          }}
        >
          <SelectionPreview />
        </Tldraw>
      </div>
    </div>
  );
}
