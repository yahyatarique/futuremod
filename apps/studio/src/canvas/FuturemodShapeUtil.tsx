import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  type TLBaseShape,
  toDomPrecision,
  useSvgExportContext,
} from "tldraw";
import type { TLPropsMigrations } from "@tldraw/tlschema";
import type { FuturemodShapeMeta } from "../data/types";
import { FuturemodBlockContent } from "./FuturemodBlockContent";

export type TLFuturemodShape = TLBaseShape<
  "futuremod",
  {
    w: number;
    h: number;
    component: FuturemodShapeMeta["component"];
    title: string;
    queryId: string;
  }
>;

const futuremodShapeProps = {
  w: T.nonZeroNumber,
  h: T.nonZeroNumber,
  component: T.string,
  title: T.string,
  queryId: T.string,
};

const futuremodShapeMigrations: TLPropsMigrations = {
  sequence: [
    {
      id: "com.tldraw.shape.futuremod/1",
      up: (props: Record<string, unknown>) => props,
    },
  ],
};

function FuturemodShapeInner({ shape }: { shape: TLFuturemodShape }) {
  const svgExport = useSvgExportContext();
  const meta: FuturemodShapeMeta = {
    component: shape.props.component as FuturemodShapeMeta["component"],
    title: shape.props.title || undefined,
    queryId: shape.props.queryId || undefined,
  };

  return (
    <HTMLContainer id={shape.id} style={{ width: shape.props.w, height: shape.props.h, pointerEvents: "all" }}>
      {svgExport ? (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-muted/50 text-xs text-muted-foreground">
          {shape.props.component}
        </div>
      ) : (
        <FuturemodBlockContent meta={meta} />
      )}
    </HTMLContainer>
  );
}

export class FuturemodShapeUtil extends BaseBoxShapeUtil<TLFuturemodShape> {
  static override type = "futuremod" as const;
  static override props = futuremodShapeProps;
  static override migrations = futuremodShapeMigrations;

  override getDefaultProps(): TLFuturemodShape["props"] {
    return {
      w: 380,
      h: 220,
      component: "StatCard",
      title: "",
      queryId: "",
    };
  }

  override component(shape: TLFuturemodShape) {
    return <FuturemodShapeInner shape={shape} />;
  }

  override indicator(shape: TLFuturemodShape) {
    return (
      <rect
        width={toDomPrecision(shape.props.w)}
        height={toDomPrecision(shape.props.h)}
        rx={12}
        ry={12}
      />
    );
  }

  override getAriaDescriptor(shape: TLFuturemodShape) {
    return `${shape.props.component} widget`;
  }
}
