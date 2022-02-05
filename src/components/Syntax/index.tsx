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
}

type Props = {
  title: string;
  segments: Segment[];
  example?: string;
}

const colors = {
  static: "red",
  default: "orange",
  optional: "green",
  variable: "blue",
  options: "violet",
}

const hasKind = (segments: Segment[], kind: Kind): boolean => {
  return segments.find(s => s.kind === kind) !== undefined;
}

const Example = ({ example }: { example: string }) => {
  return (
    <span>
      Example: <strong className={styles.example}>{example}</strong>
    </span>
  );
}

const Seg = ({ label, kind, separator }: Segment) => {
  const color = colors[kind];

  let item: JSX.Element;
  switch (kind) {
    case Kind.STATIC:
      item = <span style={{ color }}>{label}</span>;
      break;
    case Kind.DEFAULT:
      item = <span style={{ color }}>{"("}{label}{")"}</span>;
      break;
    case Kind.OPTIONAL:
      item = <span style={{ color }}>{"("}{label}{")"}</span>;
      break;
    case Kind.VARIABLE:
      item = <span style={{ color, fontWeight: 500 }}>{"{"}{label}{"}"}</span>;
      break;
  }
  return (separator != undefined) ?
    <span style={{ color: "black", fontWeight: 500 }}>{separator}</span> :
    item
}

const Legend = ({ segments }: { segments: Segment[] }) => {
  return (
    <div className={styles.legend}>
      <span className={styles.legendName}>
        <span>Legend</span><span>:</span>
      </span>
      <span className={styles.legendContent}>
        {hasKind(segments, Kind.STATIC) && <span style={{ color: colors[Kind.STATIC] }}>static</span>}
        {hasKind(segments, Kind.DEFAULT) && <span style={{ color: colors[Kind.DEFAULT] }}>default</span>}
        {hasKind(segments, Kind.OPTIONAL) && <span style={{ color: colors[Kind.OPTIONAL] }}>optional</span>}
        {hasKind(segments, Kind.VARIABLE) && <span style={{ color: colors[Kind.VARIABLE] }}>{"["}variable{"]"}</span>}
      </span>
    </div>
  );
}

const Syntax = ({ title, segments, example }: Props) => {
  return (
    <div className={styles.syntaxContainer}>
      <span className={styles.title}>
        {title}
      </span>

      <div className={styles.syntax}>
        {segments.map(seg => <Seg {...seg} />)}
      </div>

      <div className={styles.syntaxFlex}>
        <Legend segments={segments} />
        {example && <Example example={example} />}
      </div>
    </div>
  );
}

export default Syntax;
