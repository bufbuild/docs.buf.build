import React from 'react';

import styles from './styles.module.css';

enum Kind {
  STATIC = "static",
  DEFAULT = "default",
  VARIABLE = "variable",
}

type Segment = {
  label: string;
  kind?: Kind;
  separator?: string;
};

type Props = {
  title: string;
  segments: Segment[];
  examples?: string[];
};

const hasKind = (segments: Segment[], kind: Kind): boolean => {
  return segments.find((s) => s.kind === kind) !== undefined;
};

const Example = ({ examples }: { examples: string[] }) => {
  return (
    <div className={styles.examples}>
      {examples.length == 1 && (
        <span>
          Example:&nbsp;&nbsp;
          <span className={styles.example}>{examples[0]}</span>
        </span>
      )}
    </div>
  );
};

const Seg = ({ label, kind, separator }: Segment) => {
  let item: JSX.Element;
  switch (kind) {
    case Kind.STATIC:
      item = <span className={styles.static}>{label}</span>;
      break;
    case Kind.DEFAULT:
      item = (
        <span className={styles.default}>
          {"("}
          {label}
          {")"}
        </span>
      );
      break;
    case Kind.VARIABLE:
      item = (
        <span className={styles.variable}>
          {"{"}
          {label}
          {"}"}
        </span>
      );
      break;
  }
  return separator != undefined ? (
    <span className={styles.separator}>{separator}</span>
  ) : (
    item
  );
};

const Legend = ({ segments }: { segments: Segment[] }) => {
  return (
    <div className={styles.legend}>
      <span>
        <span>Legend</span>
        <span>:</span>
      </span>
      <span className={styles.legendContent}>
        {hasKind(segments, Kind.STATIC) && (
          <span className={styles.static}>static</span>
        )}
        {hasKind(segments, Kind.DEFAULT) && (
          <span className={styles.default}>default</span>
        )}
        {hasKind(segments, Kind.VARIABLE) && (
          <span className={styles.variable}>
            {"["}variable{"]"}
          </span>
        )}
      </span>
    </div>
  );
};

const Syntax = ({ title, segments, examples }: Props) => {
  return (
    <div className={styles.syntaxContainer}>
      <span className={styles.title}>{title}</span>

      <div className={styles.syntax}>
        {segments.map((seg) => (
          <Seg {...seg} />
        ))}
      </div>

      <div>
        {examples && <Example examples={examples} />}
        <div className={styles.legendLeft}>
          <Legend segments={segments} />
        </div>
      </div>
    </div>
  );
};

export default Syntax;
