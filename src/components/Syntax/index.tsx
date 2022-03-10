import React from 'react';

import styles from './styles.module.css';

enum Kind {
  STATIC = "static",
  DEFAULT = "default",
  VARIABLE = "variable"
}

type SegmentProps = {
  label: string;
  kind?: Kind;
  separator?: string;
  varName?: string;
};

type Props = {
  title: string;
  segments: SegmentProps[];
  examples?: string[];
};

const hasKind = (segments: SegmentProps[], kind: Kind): boolean => {
  return segments.find((s) => s.kind === kind) !== undefined;
};

const Example = ({ examples }: { examples: string[] }) => {
  return (
    <div className={styles.examples}>
      {examples.length == 1 && (
        <>
          <strong>Example</strong>
          <br />
          <span className={styles.example}>{examples[0]}</span>
        </>
      )}
    </div>
  );
};

const Segment = ({ label, kind, separator, varName }: SegmentProps) => {
  let item: JSX.Element;
  switch (kind) {
    case Kind.STATIC:
      item = <span className={styles.static}>{label}</span>;
      break;
    case Kind.DEFAULT:
      item = (
        <span className={styles.default}>
          {`(${varName && `${varName}:`}`}
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
  return separator != undefined ? <span className={styles.separator}>{separator}</span> : item;
};

const Legend = ({ segments }: { segments: SegmentProps[] }) => {
  return (
    <div className={styles.legend}>
      <span>
        <span>Legend</span>
        <span>:</span>
      </span>
      <span className={styles.legendContent}>
        {hasKind(segments, Kind.STATIC) && <span className={styles.static}>static</span>}
        {hasKind(segments, Kind.DEFAULT) && (
          <span className={styles.default}>
            {"("}default{")"}
          </span>
        )}
        {hasKind(segments, Kind.VARIABLE) && (
          <span className={styles.variable}>
            {"{"}variable{"}"}
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
          <Segment key={title.toLowerCase().replace(" ", "-")} {...seg} />
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
