---
id: replace-protoc-with-buf
title: Replace protoc With buf
---

The `buf` CLI acts as a build system for all your `.proto` compilation and
code generation needs. This guide describes how to migrate your existing
`protoc` setup and migrate to using `buf`.

This guide assumes that you've [installed `buf`](../installation.md) and generate
code by calling`protoc` manually from scripts or a tool like `make`. Other guides
are available for users currently using [Protolock](migrate-from-protolock.md) or
[Prototool](migrate-from-prototool.md).

We'll cover these common use cases:

  - Compile `.proto` files to detect build failures.
  - Generate code with `protoc` plugins.

Consider this file layout:

```sh
.
├── proto
│   └── acme
│       └── weather
│           └── v1
│               └── weather.proto
└── vendor
    └── protoc-gen-validate
        └── validate
            └── validate.proto
```

This `protoc` command is used to generate Go/gRPC client and server stubs:

```sh
$ protoc \
    -I proto \
    -I vendor/protoc-gen-validate \
    --go_out=. \
    --go_opt=paths=source_relative \
    --go-grpc_out=. \
    --go-grpc_opt=paths=source_relative \
    $(find proto -name '*.proto')
```

With `protoc`, each `-I` flag represents a directory used to search for imports. For example, given the
above `protoc` invocation, the `proto/acme/weather/v1/weather.proto` and
`vendor/protoc-gen-validate/validate/validate.proto` files are imported as `acme/weather/v1/weather.proto`
and `validate/validate.proto`, respectively.

The placement of the `buf.yaml` is analogous to a `protoc` include (`-I`) path. **With `buf`,
there is no `-I` flag** - each `protoc` `-I` path maps to a directory that contains a `buf.yaml`
(called a [module](../bsr/overview.md#module) in Buf parlance), and multiple modules are stitched
together with a [`buf.work.yaml`](../configuration/v1/buf-work-yaml.md), which defines a
[workspace](../reference/workspaces.md).

The example shown above can be adapted to `buf` by adding a `buf.yaml` to each of the `-I` directories,
and by creating a `buf.work.yaml` that specifies both directories like so:

```sh
.
├── buf.work.yaml
├── proto
│   ├── acme
│   │   └── weather
│   │       └── v1
│   │           └── weather.proto
│   └── buf.yaml
└── vendor
    └── protoc-gen-validate
        ├── buf.yaml
        └── validate
            └── validate.proto
```

```yaml title="buf.work.yaml"
version: v1
directories:
  - proto
  - vendor/protoc-gen-validate
```

```yaml title="proto/buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

```yaml title="vendor/protoc-gen-validate/buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

The default `buf.yaml` configuration files shown above are created with this command:

```sh
$ buf config init
```

With this, you can verify that the workspace compiles with this command:

```sh
$ buf build
```

The `buf build` command:

  - Discovers the `buf.work.yaml` file found in the current directory.
  - Collects all Protobuf files for each `buf.yaml` configuration.
  - Copies the Protobuf files into memory.
  - Compiles all Protobuf files.
  - Outputs the compiled result to a configurable location (defaults to `/dev/null`)

> The `buf.yaml` files aren't actually required in this case. You can simply run `buf build`
> without the `buf.yaml` configuration files and `buf` treats each directory specified
> in the `buf.work.yaml` as a module by default. However, defining a `buf.yaml` is strongly
> recommended.

Now that we've migrated the file layout to `buf`, we can simplify the `protoc` invocation used to
generate Go/gRPC code with this [`buf.gen.yaml`](../configuration/v1/buf-work-yaml.md) template:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: go
    out: .
    opt:
      - paths=source_relative
  - name: go-grpc
    out: .
    opt:
      - paths=source_relative
```

The `buf.gen.yaml` file is typically placed next to the `buf.work.yaml`, so that your file layout
looks like this:

```sh
.
├── buf.gen.yaml
├── buf.work.yaml
├── proto
│   ├── acme
│   │   └── weather
│   │       └── v1
│   │           └── weather.proto
│   └── buf.yaml
└── vendor
    └── protoc-gen-validate
        ├── buf.yaml
        └── validate
            └── validate.proto
```

With this, you can generate the Go/gRPC client and server stubs with this command:

```sh
$ buf generate
```

Most users only need a single `buf.gen.yaml` code generation template. However, if your project
has more complex code generation requirements you can use the `--template` flag to use more than
one `buf.gen.yaml` templates.

For example, if you need different `buf.gen.yaml` configurations for your *public* and *private* API
definitions, you might consider a setup like this, where the `public` directory
contains your public APIs and the `private` directory contains your private APIs:

```sh
$ buf generate public --template buf.public.gen.yaml
$ buf generate private --template buf.private.gen.yaml
```
