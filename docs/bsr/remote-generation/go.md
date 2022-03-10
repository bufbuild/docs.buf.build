---
id: go
title: Go module proxy
---

> The [remote code generation](/bsr/remote-generation/overview) feature is currently in **alpha**.
> This doc discusses Go, the first language we added support for, but we have plans to add support
> for others. [Let us know](/contact.md) which language we should tackle next.

The BSR supports [remote code generation](../overview.md) for [Go]. With this feature, you can
push [Buf modules][modules] to the BSR and then `go get` Go code stubs generated from those Protobuf
definitions. The generated source code is hosted in the [BSR Go module proxy](#proxy).

This feature is especially useful for creating API clients in Go, as you essentially have access to
generated Go SDKs on demand. With remote generation, you no longer need to generate Go code from
Protobuf locally, and so you also no longer need to maintain Protobuf files or protoc-based plugins.

## BSR Go module proxy {#proxy}

The BSR Go module proxy implements the [GOPROXY protocol][goproxy] for [Buf modules][modules] by
generating assets on the fly—Go code stubs aren't generated until you request them using `go get`.

The key to consuming from the BSR Go module proxy is choosing the right **Go module path**. The
import path for generated Go code has this format:

import Syntax from "@site/src/components/Syntax";

<Syntax
	title="Generated Go module path syntax"
	examples={["go.buf.build/grpc/go/googleapis/googleapis"]}
	segments={[
	{"label": "go.buf.build", "kind": "static"},
	{"separator": "/"},
	{"label": "template owner", "kind": "variable"},
	{"separator": "/"},
	{"label": "template name", "kind": "variable"},
	{"separator": "/"},
	{"label": "module owner", "kind": "variable"},
	{"separator": "/"},
	{"label": "module name", "kind": "variable"},
]} />

For example, if you wanted to generate the Protobuf module [`googleapis/googleapis`][googleapis]
with the [`grpc/go`][grpc-go] template, you could install the generated
code like this:

```terminal
$ go get go.buf.build/grpc/go/googleapis/googleapis
```

You can use _any_ template that generates Go, which can simplify Protobuf workflows down to two
steps:

1. `buf push` your [module][modules] to the BSR
1. `go get` your generated Go module

## Try it out!

In this example we're using the Go gRPC client for the [GCP Cloud Storage][storage] service. Since
this is a gRPC/Protobuf API we get a client SDK with minimal effort. The [`grpc/go`][grpc-go]
template is used to generate the [`googleapis/googleapis`][googleapis] module.

See the [above](#proxy) for a refresher on Go module import paths.

```go {9}
package main

import (
	"context"
	"crypto/tls"
	"log"

	// Import the GCS API definitions and generate using the template grpc/go.
	storagev1 "go.buf.build/grpc/go/googleapis/googleapis/google/storage/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

func main() {
	cc, err := grpc.Dial(
		"storage.googleapis.com:443",
		grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{})),
	)
	if err != nil {
		log.Fatalf("Failed to dial GCS API: %v", err)
	}
	client := storagev1.NewStorageClient(cc)
	resp, err := client.GetBucket(context.Background(), &storagev1.GetBucketRequest{
		// Public GCS dataset
		// Ref: https://cloud.google.com/healthcare/docs/resources/public-datasets/nih-chest
		Bucket: "gcs-public-data--healthcare-nih-chest-xray",
	})
	if err != nil {
		log.Fatalf("Failed to get bucket: %v", err)
	}
	log.Println(resp)
}
```

Unfortunately running the above will error, as GCP Cloud Storage doesn't yet support gRPC for all
public buckets, but it serves an example of what's possible with remote code generation and the BSR
Go module proxy.

If you're using Go modules you'll observe a version such as `v1.4.246` in the `go.mod` file. To
better understand versioning, see the [synthetic versions](overview.md#synthetic-versions)
documentation.

```sh title="go.mod"
require (
	go.buf.build/grpc/go/googleapis/googleapis v1.4.246
)
```

## Generate private modules {#private}

To generate Go code from private modules you'll need to make sure the Go tooling is correctly configured.

1. Log into the BSR:

	The `go` tool uses [`.netrc` credentials][netrc] if available and you can use `buf registry login` to add this to your `.netrc` file.
	You can obtain an API token (password) from the [Settings page][settings].

	```terminal
	$ buf registry login
	```

	```sh title="~/.netrc"
	machine buf.build
			login <USERNAME>
			password <TOKEN>
	machine go.buf.build
			login <USERNAME>
			password <TOKEN>
	```

2. Go Environment Configuration

	The `GOPRIVATE` environment variable controls which modules the `go` command considers to be
	private and thus shouldn't use the proxy or checksum database. This is important since you don't
	want to send private information to the default Go module proxy at https://proxy.golang.org.

	Set this environment variable:

	```terminal
	$ export GOPRIVATE=go.buf.build
	```

	If you already have `GONOSUMDB` configured, you also need to add `go.buf.build` to it:

	```terminal
	$ export GONOSUMDB=$GONOSUMDB,go.buf.build
	```

   This isn't necessary if you do not already have `GONOSUMDB` configured, as `GOPRIVATE`
	 automatically sets it in this case.

   For more information, see the official [private modules documentation][private].


[go]: https://golang.org
[googleapis]: https://buf.build/googleapis/googleapis
[goproxy]: https://golang.org/ref/mod#goproxy-protocol
[grpc-go]: https://buf.build/grpc/templates/go
[modules]: ../overview.md#modules
[netrc]: https://golang.org/ref/mod#private-module-proxy-auth
[private]: https://golang.org/ref/mod#private-modules
[settings]: https://buf.build/settings/user
[storage]: https://cloud.google.com/storage
