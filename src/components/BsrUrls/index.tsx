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
  link?: string;
};

type UrlProps = {
  title: string;
  example?: string;
  segments: SegmentProps[];
};

const links: Record<string, string> = {
  module: "/bsr/overview#modules",
  organization: "/bsr/user-management#organization-roles",
  owner: "/bsr/user-management#owner",
  plugin: "/bsr/remote-generation/concepts#plugins",
  reference: "/bsr/overview#referencing-a-module",
  repository: "/bsr/overview#modules",
  template: "/bsr/remote-generation/concepts#templates",
  user: "/bsr/user-management"
};

const Url = ({ title, example, segments }: UrlProps) => {
  return (
    <div className={styles.urlContainer}>
      <div className={styles.urlTitle}>
        <h3>{title}</h3>
      </div>

      <div className={styles.url}>
        {segments.map((segment) =>
          segment.link !== undefined ? (
            <a href={links[segment.link]}>
              <Segment key={segment.label ?? segment.separator} {...segment} />
            </a>
          ) : (
            <Segment key={segment.label ?? segment.separator} {...segment} />
          )
        )}
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

const Segment = ({ label, kind, separator, link }: SegmentProps) => {
  let item: JSX.Element | undefined = undefined;
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
  return { label: name, link: name, kind: Kind.VARIABLE };
};

const slash: SegmentProps = {
  separator: "/"
};

const example = (path: string): string => {
  return `https://buf.build/${path}`;
};

const urls: UrlProps[] = [
  {
    title: "User settings",
    segments: [root, slash, constant("settings"), slash, constant("user")]
  },
  {
    title: "User profile",
    example: example("bufbot"),
    segments: [root, slash, variable("user")]
  },
  {
    title: "Organization info",
    example: example("acme"),
    segments: [root, slash, variable("organization")]
  },
  {
    title: "Members of an organization",
    example: example("acme/members"),
    segments: [root, slash, variable("organization"), slash, constant("members")]
  },
  {
    title: "Organizations a user belongs to",
    example: example("bufbot/organizations"),
    segments: [root, slash, variable("user"), slash, constant("organizations")]
  },
  {
    title: "Module repository",
    example: example("acme/paymentapis"),
    segments: [root, slash, variable("owner"), slash, variable("repository")]
  },
  {
    title: "Repository documentation",
    example: example("acme/paymentapis/docs"),
    segments: [
      root,
      slash,
      variable("owner"),
      slash,
      variable("repository"),
      slash,
      constant("docs")
    ]
  },
  {
    title: "Module code",
    example: example("acme/paymentapis/tree"),
    segments: [root, slash, variable("owner"), slash, variable("module"), slash, constant("tree")]
  },
  {
    title: "Generated module assets",
    example: example("acme/paymentapis/assets"),
    segments: [root, slash, variable("owner"), slash, variable("module"), slash, constant("assets")]
  },
  {
    title: "Module history",
    example: example("acme/paymentapis/history"),
    segments: [
      root,
      slash,
      variable("owner"),
      slash,
      variable("module"),
      slash,
      constant("history")
    ]
  },
  {
    title: "Hosted template",
    example: example("protocolbuffers/templates/python"),
    segments: [
      root,
      slash,
      variable("owner"),
      slash,
      constant("templates"),
      slash,
      variable("template")
    ]
  },
  {
    title: "Hosted templates associated with a user or organization",
    example: example("protocolbuffers/templates"),
    segments: [root, slash, variable("owner"), slash, constant("templates")]
  },
  {
    title: "Hosted plugin",
    example: example("protocolbuffers/plugins/python"),
    segments: [
      root,
      slash,
      variable("owner"),
      slash,
      constant("plugins"),
      slash,
      variable("plugin")
    ]
  },
  {
    title: "Hosted plugins associated with a user or organization",
    example: example("protocolbuffers/plugins"),
    segments: [root, slash, variable("owner"), slash, constant("plugins")]
  },
  {
    title: "Generated documentation for a specific reference",
    example: example("acme/paymentapis/docs/6e230f46113f498392c82d12b1a07b70"),
    segments: [
      root,
      slash,
      variable("owner"),
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
    example: example("acme/paymentapis/tree/6e230f46113f498392c82d12b1a07b70"),
    segments: [
      root,
      slash,
      variable("owner"),
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
    example: example("acme/paymentapis/assets/6e230f46113f498392c82d12b1a07b70"),
    segments: [
      root,
      slash,
      variable("owner"),
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
