import Link from '@docusaurus/Link';
import React from 'react';

import styles from './styles.module.css';

enum Kind {
  CONSTANT,
  VARIABLE
}

// TODO: make this more idiomatic
type SegmentProps = {
  label?: string;
  kind?: Kind;
  separator?: string;
  varName?: string;
};

type UrlProps = {
  title: string;
  description: JSX.Element;
  segments: SegmentProps[];
};

const Url = ({ title, description, segments }: UrlProps) => {
  return (
    <div className={styles.urlContainer}>
      <h4>{title}</h4>

      <div>{description}</div>

      <div className={styles.url}>
        {segments.map((segment) => (
          <Segment {...segment} />
        ))}
      </div>
    </div>
  );
};

const Segment = ({ label, kind, separator }: SegmentProps) => {
  let item: JSX.Element;
  if (label !== undefined) {
    switch (kind) {
      case Kind.CONSTANT:
        item = <span className={styles.constant}>{label}</span>;
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
  } else {
    item = <span className={styles.separator}>{separator}</span>;
  }
  return item;
};

const root: SegmentProps = {
  label: "https://buf.build",
  kind: Kind.CONSTANT
};

const constant = (name: string): SegmentProps => {
  return { label: name, kind: Kind.CONSTANT };
};

const variable = (name: string): SegmentProps => {
  return { label: name, kind: Kind.VARIABLE };
};

const slash: SegmentProps = {
  separator: "/"
};

const urls: UrlProps[] = [
  {
    title: "User",
    description: (
      <>
        <Link to="/bsr/user-management">User</Link>
      </>
    ),
    segments: [root, slash, variable("user")]
  },
  {
    title: "Organization",
    description: <></>,
    segments: [root, slash, variable("organization")]
  },
  {
    title: "Repository",
    description: <></>,
    segments: [root, slash, variable("repoName")]
  },
  {
    title: "Templates",
    description: <></>,
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      constant("templates"),
      slash,
      variable("template")
    ]
  },
  {
    title: "Plugins",
    description: <></>,
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      constant("plugins"),
      slash,
      variable("plugin")
    ]
  },
  {
    title: "Module documentation",
    description: <></>,
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("docs")
    ]
  },
  {
    title: "Module code",
    description: <></>,
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("tree")
    ]
  },
  {
    title: "Module assets",
    description: <></>,
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("assets")
    ]
  },
  {
    title: "Module history",
    description: <></>,
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("history")
    ]
  },
  {
    title: "Organization members",
    description: <></>,
    segments: [root, slash, variable("organization"), slash, constant("members")]
  },
  {
    title: "User organizations",
    description: <></>,
    segments: [root, slash, variable("user"), slash, constant("organizations")]
  }
];

const BsrUrls = () => {
  return (
    <div className={styles.urlsContainer}>
      {urls.map((url) => (
        <Url {...url} />
      ))}
    </div>
  );
};

export default BsrUrls;
