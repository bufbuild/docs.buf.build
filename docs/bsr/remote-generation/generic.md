---
id: generic
title: Generic registry
---

The [Buf Schema Registry](../../bsr/overview.md) (BSR) provides a so-called **generic registry**
that enables you to download assets generated using [remote code
generation](../remote-generation/overview.md) as [tarballs][tar].

Tarball URLs consist of eight components:

* Generation [template] owner
* Generation template name
* Generation template version
* Buf [module] owner
* Buf module name
* BSR repository owner
* BSR repository name
* [Reference]

## Tarball options

Tarball with:

* [No dependencies](#no-deps)
* [The full dependency tree](#full-deps)
* [The full dependency tree plus Well-Known Types](#full-deps-wkt)

import Syntax from "@site/src/components/Syntax";

### No dependencies {#no-deps}

<Syntax
  title="Tarball with no dependencies"
  examples={["https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.tar.gz"]}
  segments={[
    {label: "https://", kind: "static"},
    {label: "archive.buf.build", kind: "default", varName: "remote"},
    {separator: "/"},
    {label: "v1", kind: "static"},
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
    {label: "reference", kind: "variable"},
    {label: ".tar.gz", kind: "static"},
  ]
} />

### Full dependency tree {#full-deps}

<Syntax
  title="Tarball with the full dependency tree"
  examples={["https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.include_imports.tar.gz"]}
  segments={[
    {label: "https://", kind: "static"},
    {label: "archive.buf.build", kind: "default", varName: "remote"},
    {separator: "/"},
    {label: "v1", kind: "static"},
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
    {label: "reference", kind: "variable"},
    {label: ".include_imports.tar.gz", kind: "static"},
  ]
} />

In contrast with the [no dependencies](#no-deps) variant, note that the tarball filename ends with
`.include_imports.tar.gz` instead of `.tar.gz`.

### Full dependency tree plus Well-Known Types {#full-deps-wkt}

<Syntax
  title="Tarball with the full dependency tree plus Well-Known Types"
  examples={["https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.include_imports_and_wkt.tar.gz"]}
  segments={[
    {label: "https://", kind: "static"},
    {label: "archive.buf.build", kind: "default", varName: "remote"},
    {separator: "/"},
    {label: "v1", kind: "static"},
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
    {label: "reference", kind: "variable"},
    {label: ".include_imports_and_wkt.tar.gz", kind: "static"},
  ]
} />

In contrast with the [full dependency](#no-deps) variant, note that the tarball filename ends with
`.include_imports_and_wkt.tar.gz` instead of `.include_imports.tar.gz`.

[gzip]: https://www.gnu.org/software/gzip
[module]: ../overview.md#modules
[reference]: ../overview.md#referencing-a-module
[tar]: https://en.wikipedia.org/wiki/Tar_(computing)
[template]: concepts.md#templates
