---
id: generic
title: Generic registry
---

https://archive.buf.build/v1/repositoryID/templateID/templateVersion/commit.tar.gz // The tarball with no dependencies included


import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Tarball with no dependencies"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "https://archive.buf.build", kind: "static"},
    {separator: "/"},
    {label: "repo ID", kind: "variable"},
    {separator: "/"},
    {label: "template ID", kind: "variable"},
    {separator: "/"},
    {label: "template version", kind: "variable"},
    {separator: "/"},
    {label: "commit", kind: "variable"},
    {label: ".tar.gz", kind: "static"},
  ]
} />

<Syntax
  title="Tarball with the full dependency tree"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "https://archive.buf.build", kind: "static"},
    {separator: "/"},
    {label: "repo ID", kind: "variable"},
    {separator: "/"},
    {label: "template ID", kind: "variable"},
    {separator: "/"},
    {label: "template version", kind: "variable"},
    {separator: "/"},
    {label: "commit", kind: "variable"},
    {label: ".include_imports.tar.gz", kind: "static"},
  ]
} />

<Syntax
  title="Tarball with the full dependency tree plus Well-Known Types"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "https://archive.buf.build", kind: "static"},
    {separator: "/"},
    {label: "repo ID", kind: "variable"},
    {separator: "/"},
    {label: "template ID", kind: "variable"},
    {separator: "/"},
    {label: "template version", kind: "variable"},
    {separator: "/"},
    {label: "commit", kind: "variable"},
    {label: ".include_imports_and_wkt.tar.gz", kind: "static"},
  ]
} />
