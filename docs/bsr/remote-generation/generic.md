---
id: generic
title: Generic registry
---

/v1/{templateOwner}/{templateName}/{templateVersion}/{repositoryOwner}/{repositoryName}/{commitName}.tar.gz


import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Tarball with no dependencies"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "https://archive.buf.build/v1", kind: "static"},
    {separator: "/"},
    {label: "templateOwner", kind: "variable"},
    {separator: "/"},
    {label: "templateName", kind: "variable"},
    {separator: "/"},
    {label: "templateVersion", kind: "variable"},
    {separator: "/"},
    {label: "repoOwner", kind: "variable"},
    {separator: "/"},
    {label: "repoName", kind: "variable"},
    {separator: "/"},
    {label: "commitName", kind: "variable"},
    {label: ".tar.gz", kind: "static"},
  ]
} />

<Syntax
  title="Tarball with the full dependency tree"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "https://archive.buf.build/v1", kind: "static"},
    {separator: "/"},
    {label: "templateOwner", kind: "variable"},
    {separator: "/"},
    {label: "templateName", kind: "variable"},
    {separator: "/"},
    {label: "templateVersion", kind: "variable"},
    {separator: "/"},
    {label: "repoOwner", kind: "variable"},
    {separator: "/"},
    {label: "repoName", kind: "variable"},
    {separator: "/"},
    {label: "commitName", kind: "variable"},
    {label: ".include_imports.tar.gz", kind: "static"},
  ]
} />

<Syntax
  title="Tarball with the full dependency tree plus Well-Known Types"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "https://archive.buf.build/v1", kind: "static"},
    {separator: "/"},
    {label: "templateOwner", kind: "variable"},
    {separator: "/"},
    {label: "templateName", kind: "variable"},
    {separator: "/"},
    {label: "templateVersion", kind: "variable"},
    {separator: "/"},
    {label: "repoOwner", kind: "variable"},
    {separator: "/"},
    {label: "repoName", kind: "variable"},
    {separator: "/"},
    {label: "commitName", kind: "variable"},
    {label: ".include_imports_and_wkt.tar.gz", kind: "static"},
  ]
} />
