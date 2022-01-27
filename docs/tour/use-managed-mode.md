---
id: use-managed-mode
title: 13 Use Managed Mode
---

In this section, we'll learn how to use [Managed Mode](../generate/managed-mode.md) and remove
the standard [file options](https://developers.google.com/protocol-buffers/docs/proto3#options) from
our `.proto` files altogether.

As discussed in [Generate Code](generate-code.md), **Managed Mode** is a
[`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) configuration option that tells `buf` to
set all of the file options in your module according to an opinionated set of values suitable for each
of the supported Protobuf languages (e.g. Go, Java, C#, etc.). The file options are written *on the fly*
so that they never have to be written in the Protobuf source file itself.

## 13.1 Remove `go_package` {#remove-go_package}

One of the largest drawbacks of Protobuf is the hardcoding of language-specific
options within Protobuf definitions themselves. For example, consider the
`go_package` option we've been using throughout the tour:

```protobuf title="petapis/pet/v1/pet.proto" {5}
syntax = "proto3";

package pet.v1;

option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1;petv1";
```

This option has nothing to do with the API definition within Protobuf - it's an API
*consumer* concern, not an API *producer* concern. Different consumers may (and usually do)
want different values for this option, especially when a given set of Protobuf definitions
is consumed in many different places.

You can use **Managed Mode** to manage these file options for you, so that you can remove
the `go_package` altogether:

```protobuf title="petapis/pet/v1/pet.proto" {5}
 syntax = "proto3";

 package pet.v1;

-option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1;petv1";
```

```protobuf title="paymentapis/payment/v1alpha1/payment.proto" {5}
 syntax = "proto3";

 package payment.v1alpha1;

-option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/payment/v1alpha1;paymentv1alpha1";
```

If we try to regenerate stubs for the API changes we've made in the local [workspace](../reference/workspaces.md),
you'll notice the following:

```terminal
$ rm -rf gen
$ buf generate
...

protoc-gen-go: unable to determine Go import path for "payment/v1alpha1/payment.proto"

Please specify either:
	• a "go_package" option in the .proto source file, or
	• a "M" argument on the command line.

See https://developers.google.com/protocol-buffers/docs/reference/go-generated#package for more information.

...
```

## 13.2 Configure Managed Mode {#configure-managed-mode}

Configuring **Managed Mode** in general is easy - all you need to do is add the `managed.enabled`
option to your `buf.gen.yaml` template. For the `go_package` option in particular, you also
need to configure a `managed.go_package_prefix`:

The `go_package` option is [notoriously complicated](https://developers.google.com/protocol-buffers/docs/reference/go-generated#package).
If we want to generate code with the `protoc-gen-go[-grpc]` plugins, Go repositories **must** contain a
[go.mod](https://golang.org/ref/mod#go-mod-file) file that declares a Go [module path](https://golang.org/ref/mod#glos-module-path)
that acts as a prefix for package import paths within the module.

Fortunately, with **Managed Mode** you don't have to worry about this confusing, nuanced behavior. Simply
set the `go_package_prefix.default` value to be equal to the `name` in your `go.mod`, _joined_ with the `out`
path configured for the `protoc-gen-go` plugin.

In the following example, the module path (*github.com/bufbuild/buf-tour/petstore*) and the plugin output path
(*gen/proto/go*) result in a `go_package_prefix.default` setting of *github.com/bufbuild/buf-tour/petstore/gen/proto/go*:

```sh title="go.mod" {1}
module github.com/bufbuild/buf-tour/petstore

go 1.16

require (
	google.golang.org/genproto v0.0.0-20210811021853-ddbe55d93216
	google.golang.org/grpc v1.40.0
	google.golang.org/protobuf v1.27.1
)
```

```yaml title="buf.gen.yaml" {2-5,8,11}
 version: v1
+managed:
+  enabled: true
+  go_package_prefix:
+    default: github.com/bufbuild/buf-tour/petstore/gen/proto/go
 plugins:
   - name: go
     out: gen/proto/go
     opt: paths=source_relative
   - name: go-grpc
     out: gen/proto/go
     opt:
       - paths=source_relative
       - require_unimplemented_servers=false
```

## 13.3 Run `buf generate` {#run-buf-generate}

Now If we try to regenerate stubs again, you'll notice that it's successful:

```terminal
$ rm -rf gen
$ buf generate
```

However, if we try to compile the Go code, you'll notice the following:

```sh
gen/proto/go/pet/v1/pet.pb.go:10:2: no required module provides package github.com/bufbuild/buf-tour/petstore/gen/proto/go/google/type; to add it:
	go get github.com/bufbuild/buf-tour/petstore/gen/proto/go/google/type
```

In this case, `buf` is overriding the `go_package` value for the `buf.build/googleapis/googleapis` module,
but Google publishes their Go Protobuf stubs to a separate [go-genproto](https://github.com/googleapis/go-genproto)
repository, all of which is controlled by a `go_package` setting like the following:

```protobuf title="google/rpc/status.proto" {8}
syntax = "proto3";

package google.rpc;

import "google/protobuf/any.proto";

option cc_enable_arenas = true;
option go_package = "google.golang.org/genproto/googleapis/rpc/status;status";

...
```

Unfortunately, the [grpc-go](https://github.com/grpc/grpc-go) library depends on [go-genproto](https://github.com/googleapis/go-genproto),
so the import paths must match for the Go stubs to interoperate and the `go_package` option **must** be preserved.

## 13.4 Remove Modules from Managed Mode {#remove-modules-from-managed-mode}

> This is a particularly rare edge case, which primarily applies to `buf.build/googleapis/googleapis`.
> You are **not** expected to configure the `except` key in general.

We can fix these errors by _excluding_ the `buf.build/googleapis/googleapis` module from **Managed Mode**:

```yaml title="buf.gen.yaml" {6-7}
 version: v1
 managed:
   enabled: true
   go_package_prefix:
     default: github.com/bufbuild/buf-tour/petstore/gen/proto/go
+    except:
+      - buf.build/googleapis/googleapis
 plugins:
   - name: java
     out: gen/proto/java
   - name: go
     out: gen/proto/go
     opt: paths=source_relative
   - name: go-grpc
     out: gen/proto/go
     opt:
       - paths=source_relative
       - require_unimplemented_servers=false
```

With this, the `go_package` option in all of the files provided by the `buf.build/googleapis/googleapis` module
will **not** be managed by `buf`. In other words, the `go_package` option will remain untouched for these files.

If we try to regenerate the stubs again, you'll notice that it's successful:

```terminal
$ rm -rf gen
$ buf generate
```

We can also verify that the generated code compiles with the following command:

```terminal
$ go build ./...
```
