---
id: generic
title: Generic registry
---

The [Buf Schema Registry](../../bsr/overview.md) (BSR) enables you to [remotely
generate](../remote-generation/overview.md) code stubs from [Buf
modules](../../bsr/overview.md#modules) that you've pushed to the registry. While the BSR offers
language-specific registries for [Go](go.md) and [JavaScript/TypeScript](npm.md), you may need to
use code stubs for languages that aren't officially supported. To fill this gap, the BSR's **generic
registry** enables you to download remote-generated assets as [tarballs][tar].

As with the [Go module proxy](go.md) and the [npm registry](npm.md), the generic registry generates 
assets on the fly, that is, it generates first only upon request and then caches the result for the
sake of future requests.

## Downloading generated assets

You can download generated assets from the generic registry by making requests to the correct URL
using a file retrieval tool like [cURL] or [wget]. Here's an example request:

```terminal
$ wget https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.tar.gz
```

Tarball URLs consist of these components:

* Generation [template] owner
* Generation template name
* Generation template version
* Buf [module] owner
* Buf module name
* BSR repository owner
* BSR repository name
* A module [reference]

## Tarball options

There are three different tarballs that you can download for each template/module combination:

* A tarball with [no Protobuf dependencies](#no-deps) included
* A tarball with the [full Protobuf dependency tree](#full-deps) included
* A tarball with the [full Protobuf dependency tree plus Well-Known Types](#full-deps-wkt) included

### No dependencies {#no-deps}

The URL structure for downloading a generic registry tarball with no Protobuf dependencies is
shown in the diagram below.

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Tarball with no dependencies"
  examples={[
    "https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/main.tar.gz",
    "https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.tar.gz"
  ]}
  segments={[
    {label: "https://", kind: "constant"},
    {label: "archive.buf.build", kind: "default", varName: "remote"},
    {separator: "/"},
    {label: "v1", kind: "constant"},
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
    {label: ".tar.gz", kind: "constant"},
  ]
} />

### Full dependency tree {#full-deps}

The URL structure for downloading a generic registry tarball with [all Protobuf
dependencies](../../bsr/overview.md#dependencies) is shown in the diagram below.

<Syntax
  title="Tarball with the full dependency tree"
  examples={[
    "https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.include_imports.tar.gz",
    "https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/main.include_imports.tar.gz"
  ]}
  segments={[
    {label: "https://", kind: "constant"},
    {label: "archive.buf.build", kind: "default", varName: "remote"},
    {separator: "/"},
    {label: "v1", kind: "constant"},
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
    {label: ".include_imports.tar.gz", kind: "constant"},
  ]
} />

In contrast with the [no dependencies](#no-deps) variant, note that the tarball filename ends with
`.include_imports.tar.gz` instead of `.tar.gz`.

### Full dependency tree plus Well-Known Types {#full-deps-wkt}

The URL structure for downloading a generic registry tarball with [all Protobuf
dependencies](../../bsr/overview.md#dependencies) plus the [Well-Known Types][wkt] is shown in the
diagram below.

<Syntax
  title="Tarball with the full dependency tree plus Well-Known Types"
  examples={[
    "https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/main.include_imports_and_wkt.tar.gz",
    "https://archive.buf.build/v1/grpc/go/v2/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.include_imports_and_wkt.tar.gz"
  ]}
  segments={[
    {label: "https://", kind: "constant"},
    {label: "archive.buf.build", kind: "default", varName: "remote"},
    {separator: "/"},
    {label: "v1", kind: "constant"},
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
    {label: ".include_imports_and_wkt.tar.gz", kind: "constant"},
  ]
} />

In contrast with the [full dependency](#no-deps) variant, note that the tarball filename ends with
`.include_imports_and_wkt.tar.gz` instead of `.include_imports.tar.gz`.

[curl]: https://everything.curl.dev
[gzip]: https://www.gnu.org/software/gzip
[module]: ../overview.md#modules
[reference]: ../overview.md#referencing-a-module
[tar]: https://en.wikipedia.org/wiki/Tar_(computing)
[template]: concepts.md#templates
[wget]: https://www.gnu.org/software/wget
[wkt]: https://developers.google.com/protocol-buffers/docs/reference/google.protobuf
