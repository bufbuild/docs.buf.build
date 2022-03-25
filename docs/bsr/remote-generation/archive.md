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

You can download generated assets from the archive registry by making requests to the [correct URL](#urls) using a file retrieval tool like [cURL] or [wget]. Here's an example request:

```terminal
$ curl -O "https://dl.buf.build/v1/protocolbuffers/go/v2/acme/paymentapis/main.tar.gz"
```

### Archive registry URL structure {#urls}

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
    {label: "templateOwner", kind: "variable", href: "/bsr/remote-generation/overview#templates"},
    {separator: "/"},
    {label: "templateName", kind: "variable", href: "/bsr/remote-generation/overview#templates"},
    {separator: "/"},
    {label: "templateVersion", kind: "variable", href: "/bsr/remote-generation/overview#templates"},
    {separator: "/"},
    {label: "repoOwner", kind: "variable", href: "/bsr/overview#modules"},
    {separator: "/"},
    {label: "repoName", kind: "variable", href: "/bsr/overview#modules"},
    {separator: "/"},
    {label: "reference", kind: "variable", href: "/bsr/overview#referencing-a-module"},
    {label: ".tar.gz", kind: "constant"},
  ]
} />

## Private modules

In order to download tarballs for assets generated from private Buf modules, you need to be [logged into](../authentication.md) to the BSR:

```terminal
$ buf registry login
```

When you successfully log in, the `buf` CLI adds the appropriate credentials to your [`.netrc`](../authentication.md#netrc-file) file. [wget] reads from your `.netrc` by default, so you can use wget with no special flags to download assets for private modules. Buf if you use [cURL], you need to instruct it to use your BSR credentials with the [`--netrc`][netrc] flag:

```terminal
$ curl --netrc -O "https://dl.buf.build/v1/protocolbuffers/js/v2/acme/someprivatemodule/main.tar.gz"
```

[curl]: https://everything.curl.dev
[gzip]: https://www.gnu.org/software/gzip
[netrc]: https://everything.curl.dev/usingcurl/netrc#enable-netrc
[reference]: ../overview.md#referencing-a-module
[repository]: ../overview.md#modules
[tar]: https://en.wikipedia.org/wiki/Tar_(computing)
[wget]: https://www.gnu.org/software/wget
[wkt]: https://developers.google.com/protocol-buffers/docs/reference/google.protobuf
