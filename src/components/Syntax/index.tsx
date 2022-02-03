import React from "react";
import styles from './styles.module.css';

enum Kind {
  STATIC = "static",
  DEFAULT = "default",
  OPTIONAL = "optional",
  VARIABLE = "variable",
}

type Segment = {
  label: string;
  kind?: Kind;
  separator?: string;
  count?: number;
}

type Props = {
  segments: Segment[];
  example?: string;
}

const colors = {
  static: "#27272A",
  default: "orange",
  optional: "red",
  variable: "#DB2777",
  options: "green",
}

const hasKind = (segments: Segment[], kind: Kind): boolean => {
  return segments.find(s => s.kind === kind) !== undefined;
}

const Example = ({ example }: { example: string }) => {
  return (
    <span className={styles.example}>
      Example: <strong>{example}</strong>
    </span>
  );
}

const Seg = ({ label, kind, separator, count }: Segment) => {
  const color = colors[kind];

  let item: JSX.Element;
  switch (kind) {
    case Kind.STATIC:
      item = <span style={{ color, textDecoration: "underline" }}>{label}</span>;
      break;
    case Kind.DEFAULT:
      item = <span style={{ color }}>{label}</span>;
      break;
    case Kind.OPTIONAL:
      item = <span style={{ color }}>{"("}{label}{")"}</span>;
      break;
    case Kind.VARIABLE:
      item = <span style={{ color, fontWeight: 500 }}>{"["}{label}{"]"}</span>;
      break;
  }
  return (separator != undefined) ?
    <span style={{ color: "#001", fontWeight: 600, margin: "0 0.1rem 0 0.1rem" }}>{separator}</span> :
    item
}

const Legend = ({ segments }: Props) => {
  return (
    <div className={styles.legend}>
      <span>
        <span>Legend</span><span>:</span>
      </span>
      <span className={styles.legendContent}>
        {hasKind(segments, Kind.STATIC) && <span style={{ color: colors[Kind.STATIC], textDecoration: "underline" }}>static</span>}
        {hasKind(segments, Kind.DEFAULT) && <span style={{ color: colors[Kind.DEFAULT] }}>default</span>}
        {hasKind(segments, Kind.OPTIONAL) && <span style={{ color: colors[Kind.OPTIONAL] }}>optional</span>}
        {hasKind(segments, Kind.VARIABLE) && <span style={{ color: colors[Kind.VARIABLE] }}>{"["}variable{"]"}</span>}
      </span>
    </div>
  );
}

const Syntax = ({ segments, example }: Props) => {
  return (
    <div className={styles.syntaxContainer}>
      <div className={styles.syntax}>
        {segments.map(seg => <Seg {...seg} />)}
      </div>

      <div className={styles.syntaxFlex}>
        {example && <Example example={example} />}

        <Legend segments={segments} />
      </div>
    </div>
  );
}

export default Syntax;