---
id: archive
title: Archive registry
---

import Breaking from "@site/src/components/Breaking";

<Breaking 
  feature="The archive registry"
  version="alpha"
/>

The [Buf Schema Registry](../../bsr/overview.md) (BSR) enables you to [remotely generate](../remote-generation/overview.md) code stubs from [Buf modules](../../bsr/overview.md#modules) that you've pushed to the registry. While the BSR offers language-specific registries for [Go](go.md) and [JavaScript/TypeScript](js.md), you may need to use code stubs for languages that aren't officially supported. To fill this gap, the BSR's **archive registry** enables you to download remote-generated assets as [tarballs][tar].

As with the [Go module proxy](go.md) and the [npm registry](js.md), the archive registry generates assets on the fly, that is, it generates first only upon request and then caches the result to speed up future requests.

## Downloading generated assets

You can download generated assets from the archive registry by making requests to the correct URL using a file retrieval tool like [cURL] or [wget]. Here's an example request:

```terminal
$ wget https://dl.buf.build/v1/protocolbuffers/go/v2/acme/paymentapis/main.tar.gz
```

### Archive registry URL structure

Archive URLs consist of these components:

Component | Example
:---------|:-------
Archive registry version | `v1` (currently the only version)
Generation [template](overview.md#templates) owner | [`protocolbuffers`](https://buf.build/protocolbuffers)
Generation template name | [`go`](https://buf.build/protocolbuffers/templates/go)
Generation template version | [`v1`](https://buf.build/protocolbuffers/templates/go)
BSR [repository](../../bsr/overview.md#modules) owner | [`acme`](https://buf.build/acme)
BSR repository name | [`paymentapis`](https://buf.build/acme/paymentapis)
A module [reference] | [`6e230f46113f498392c82d12b1a07b70`](https://buf.build/acme/paymentapis/tree/6e230f46113f498392c82d12b1a07b70)

The full URL structure is shown in this diagram:

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Archive URL structure"
  examples={[
    "https://dl.buf.build/v1/protocolbuffers/go/v1/acme/paymentapis/main.tar.gz",
    "https://dl.buf.build/v1/protocolbuffers/go/v1/acme/paymentapis/6e230f46113f498392c82d12b1a07b70.tar.gz"
  ]}
  segments={[
    {label: "https://", kind: "constant"},
    {label: "dl.buf.build", kind: "default"},
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

[curl]: https://everything.curl.dev
[gzip]: https://www.gnu.org/software/gzip
[reference]: ../overview.md#referencing-a-module
[repository]: ../overview.md#modules
[tar]: https://en.wikipedia.org/wiki/Tar_(computing)
[wget]: https://www.gnu.org/software/wget
[wkt]: https://developers.google.com/protocol-buffers/docs/reference/google.protobuf
