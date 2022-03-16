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
};

type UrlProps = {
  title: string;
  description?: JSX.Element;
  docsPath?: string;
  example?: string;
  segments: SegmentProps[];
};

const Url = ({ title, description, docsPath, example, segments }: UrlProps) => {
  return (
    <div className={styles.urlContainer}>
      <div className={styles.urlTitle}>
        <h3>{title}</h3>

        {docsPath && (
          <span className={styles.docsPath}>
            <Link to={docsPath}>docs</Link>
          </span>
        )}
      </div>

      {description}

      <div className={styles.url}>
        {segments.map((segment) => (
          <Segment key={segment.label ?? segment.separator} {...segment} />
        ))}
      </div>

      {example && (
        <div className={styles.example}>
          <span>
            Example: <Link to={example}>{example}</Link>
          </span>
        </div>
      )}
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

const example = (path: string): string => {
  return `https://buf.build/${path}`;
};

const urls: UrlProps[] = [
  {
    title: "User info",
    docsPath: "/bsr/user-management",
    example: example("bufbuild"),
    segments: [root, slash, variable("user")]
  },
  {
    title: "Organization info",
    docsPath: "/bsr/user-management#organization-roles",
    example: example("acme"),
    segments: [root, slash, variable("organization")]
  },
  {
    title: "Members of an organization",
    docsPath: "/bsr/user-management#organization-roles",
    example: example("acme/members"),
    description: <></>,
    segments: [root, slash, variable("organization"), slash, constant("members")]
  },
  {
    title: "Organizations a user belongs to",
    docsPath: "/bsr/user-management#organization-roles",
    example: example("bufbot/organizations"),
    description: <></>,
    segments: [root, slash, variable("user"), slash, constant("organizations")]
  },
  {
    title: "Module",
    docsPath: "/bsr/user-management#organization-roles",
    example: example("acme/paymentapis"),
    segments: [root, slash, variable("user|organization"), slash, variable("module")]
  },
  {
    title: "Module documentation",
    docsPath: "/bsr/overview#documentation",
    example: example("acme/paymentapis/docs"),
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
    docsPath: "/bsr/overview#modules",
    example: example("acme/paymentapis/tree"),
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
    title: "Generated module assets",
    docsPath: "/bsr/overview#code-generation",
    example: example("acme/paymentapis/assets"),
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
    docsPath: "/bsr/overview#referencing-a-module",
    example: example("acme/paymentapis/history"),
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
    title: "Templates associated with a user or organization",
    docsPath: "/bsr/remote-generation/concepts#templates",
    example: example("protocolbuffers/templates/go"),
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
    title: "Plugins associated with a user or organization",
    docsPath: "/bsr/remote-generation/concepts#plugins",
    example: example("protocolbuffers/plugins/python"),
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
    title: "Docs for a specific reference",
    docsPath: "/bsr",
    example: example("acme/paymentapis/docs/6e230f46113f498392c82d12b1a07b70"),
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("docs"),
      slash,
      variable("reference")
    ]
  },
  {
    title: "Code for a specific reference",
    docsPath: "/bsr",
    example: example("acme/paymentapis/tree/6e230f46113f498392c82d12b1a07b70"),
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("tree"),
      slash,
      variable("reference")
    ]
  },
  {
    title: "Generated assets for a specific reference",
    docsPath: "/bsr",
    example: example("acme/paymentapis/assets/6e230f46113f498392c82d12b1a07b70"),
    segments: [
      root,
      slash,
      variable("user|organization"),
      slash,
      variable("module"),
      slash,
      constant("assets"),
      slash,
      variable("reference")
    ]
  }
];

const BsrUrls = () => {
  return (
    <div className={styles.urlsContainer}>
      {urls.map((url) => (
        <Url key={url.title} {...url} />
      ))}
    </div>
  );
};

export default BsrUrls;
