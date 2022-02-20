---
id: use-managed-mode
title: 13 Use managed mode
---

In this section, you'll learn how to use [**Managed Mode**](../generate/managed-mode.md) when
[generating code](generate-code.md) using Protobuf. Managed Mode is a configuration option in your
[`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) that tells `buf` to set all of the [file
options] in your module according to an opinionated set of values suitable for each of the
supported Protobuf languages, such as Go, Java, and C#. Those file options are written *on the fly*
so that you can remove them from your `.proto` source files.

> We created Managed Mode because those file options have long been a source of confusion and
> frustration for Protobuf users.

## 13.1 Remove `go_package` {#remove-go_package}

One of the drawbacks of using Protobuf in the past has been the need to hard-code language-specific
options within Protobuf definitions themselves. Consider the `go_package` option we've been using
throughout the tour:

```protobuf title="petapis/pet/v1/pet.proto" {5}
syntax = "proto3";

package pet.v1;

option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1;petv1";
```

This option is required by `proto` and `protoc-gen-go` but it has nothing to do with the actual
API definition in Protobuf. It's an API *consumer* concern, not an API *producer* concern.
Different consumers may—and usually do—want to provide custom values for this option, especially
when a set of Protobuf definitions has many different consumers.

With Managed Mode, you can remove the `go_package` option altogether, as in these two diffs:

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

If you regenerate Go code stubs for the API changes you made in your local
[workspace](/reference/workspaces.md), you'll notice this:

```terminal
$ rm -rf gen
$ buf generate
---
protoc-gen-go: unable to determine Go import path for "payment/v1alpha1/payment.proto"

Please specify either:
	• a "go_package" option in the .proto source file, or
	• a "M" argument on the command line.

See https://developers.google.com/protocol-buffers/docs/reference/go-generated#package for more information.
...
```

This error comes up because you haven't yet enabled Managed Mode, but you'll see how to do that in
the next section.

## 13.2 Configure managed mode {#configure-managed-mode}

To configure Managed Mode, add the [`managed.enabled`](/configuration/v1/buf-gen-yaml#enabled)
option to your `buf.gen.yaml` template and set a package prefix with the
[`managed`](/configuration/v1/buf-gen-yaml#go_package_prefix) parameter.

> The `go_package` option is [notoriously complicated][go_prefix]. To generate code using plugins
> like `protoc-gen-go` and `protoc-gen-grpc`, Go repositories **must** contain a [go.mod][go.mod]
> file that declares a Go [module path][path] that acts as a prefix for package import paths within
> the module.


With **Managed Mode** you don't have to worry about this nuanced behavior. You can set the
set the `go_package_prefix.default` value to the `name` in your `go.mod` joined with the `out` path
configured for the `protoc-gen-go` plugin. In the example below, the module path
(`github.com/bufbuild/buf-tour/petstore`) and the plugin output path (`gen/proto/go`) result in a
[`go_package_prefix.default`](/configuration/v1/buf-gen-yaml#default) setting of
`github.com/bufbuild/buf-tour/petstore/gen/proto/go`.

The original `go.mod` file:

```sh title="go.mod" {1}
module github.com/bufbuild/buf-tour/petstore

go 1.16

require (
	google.golang.org/genproto v0.0.0-20210811021853-ddbe55d93216
	google.golang.org/grpc v1.40.0
	google.golang.org/protobuf v1.27.1
)
```

And the corresponding Buf configuration:

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

If you regenerate the stubs now, you'll notice that it's successful:

```terminal
$ rm -rf gen
$ buf generate
```

But if you try to compile the Go code, you'll notice this error:

```sh
gen/proto/go/pet/v1/pet.pb.go:10:2: no required module provides package github.com/bufbuild/buf-tour/petstore/gen/proto/go/google/type; to add it:
	go get github.com/bufbuild/buf-tour/petstore/gen/proto/go/google/type
```

In this case, `buf` overrides the `go_package` value for the `buf.build/googleapis/googleapis`
module, but Google publishes their Go Protobuf stubs to a separate
[`go-genproto`][go-genproto]
repository, which is controlled by a `go_package` setting like this:

```protobuf title="google/rpc/status.proto" {8}
syntax = "proto3";

package google.rpc;

import "google/protobuf/any.proto";

option cc_enable_arenas = true;
option go_package = "google.golang.org/genproto/googleapis/rpc/status;status";

...
```

Unfortunately, the [`grpc-go`][grpc-go] library depends on [`go-genproto`][go-genproto],
so the import paths must match for the Go stubs to interoperate and the `go_package` option
**must** be preserved.

## 13.4 Remove modules from managed mode {#remove-modules-from-managed-mode}

> This is a particularly rare edge case, which primarily applies to
> `buf.build/googleapis/googleapis`. You shouldn't need to use the `except` key in general.

You can fix these errors by _excluding_ the `buf.build/googleapis/googleapis` module from
Managed Mode:

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

With the `except` setting, the `go_package` option in all of the files provided by the
`buf.build/googleapis/googleapis` module is no longer managed by `buf`. In other words, the
`go_package` option remains untouched for this set of files.

If you regenerate the stubs, you'll notice that it's successful:

```terminal
$ rm -rf gen
$ buf generate
```

You can also verify that the generated code compiles with this command:

```terminal
$ go build ./...
```

[file options]: https://developers.google.com/protocol-buffers/docs/proto3#options
[go.mod]: https://golang.org/ref/mod#go-mod-file
[go_prefix]: https://developers.google.com/protocol-buffers/docs/reference/go-generated#package
[go-genproto]: https://github.com/googleapis/go-genproto
[grpc-go]: https://github.com/grpc/grpc-go
[path]: https://golang.org/ref/mod#glos-module-path
