---
id: consume-generated-go-code
title: Consume Generated Go Code
---

> Remote code generation is an **experimental feature**. We started with Go and have plans to add support for other languages. [Let us know what language we should tackle next](../../contact.md).

Now that the BSR supports **remote code generation**, you no longer have to maintain Protobuf files, `protoc`-based plugins or generate code locally. This is especially useful for API clients, who just want a Go SDK to start consuming an API immediately.

The generated source code is hosted in the BSR Go module proxy.

## BSR Go module proxy

The BSR Go module proxy implements the [GOPROXY protocol](https://golang.org/ref/mod#goproxy-protocol) for Protobuf modules by generating assets on-the-fly.

The key to consuming from the BSR Go module proxy is choosing the **Go module path**. The import path for a specific set of generated assets is constructed by putting together the chosen template with the chosen Protobuf module according to the following format:

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

For example, if you wanted to generate the Protobuf module [googleapis/googleapis](https://buf.build/googleapis/googleapis) with the template [grpc/go](https://buf.build/grpc/templates/go), the Go module path would look like this:

```
go.buf.build/grpc/go/googleapis/googleapis
```

Any template that generates Go code can be used. Simplifying workflows down to **`buf push`** and **`go get`**.

## Try it out!

In this example we're using the Go gRPC client for the [GCP Cloud Storage](https://cloud.google.com/storage) service. Since this is a gRPC/Protobuf API we get a client SDK with minimal effort.

The [grpc/go](https://buf.build/grpc/templates/go) template is used to generate the [googleapis/googleapis](https://buf.build/googleapis/googleapis) module.

The import path is the combination of the BSR Go module proxy (go.buf.build), the template (grpc/go), module (googleapis/googleapis) followed by the package (google/storage/v1).

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

Unfortunately running the above will error, as GCP Cloud Storage doesn't yet support gRPC for all public buckets, but it serves an example of what's possible with remote code generation and the BSR Go module proxy.

If you're using Go modules you'll observe a version such as `v1.4.246` in the go.mod file. To better understand versioning please refer to the [synthetic version](overview.md#synthetic-versions) section.

```sh title="go.mod"
require (
	go.buf.build/grpc/go/googleapis/googleapis v1.4.246
)
```

## Generate private modules

To generate Go code from private modules you'll need to make sure the Go tooling is correctly configured.

1. Login to the BSR:

The `go` tool uses [`.netrc` credentials](https://golang.org/ref/mod#private-module-proxy-auth) if available and you can use `buf registry login` to add this to your `.netrc` file.
You can obtain an API token (password) from the [Settings Page](https://buf.build/settings/user).

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

The `GOPRIVATE` environment variable controls which modules the `go` command considers to be private and should therefore not use the proxy or checksum database. This is important since we do not want to send private information to the default Go module proxy at https://proxy.golang.org.

Set this environment variable.

```terminal
$ export GOPRIVATE=go.buf.build
```

For more information please refer to the official [Private modules documentation](https://golang.org/ref/mod#private-modules).
