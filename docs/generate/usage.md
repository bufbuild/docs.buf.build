---
id: usage
title: Usage
---

> We highly recommend completing [the tour](../tour/generate-code.md) to get an overview of `buf generate`.

Protobuf has a large barrier to entry for developers new to IDL development. Not only do you need to
learn and understand the Protobuf language specification and all of its nuances, you must also learn
the complexity of `protoc`. The `buf generate` command simplifies this experience so that Protobuf
developers can stop worrying about complex `protoc` invocations and instead focus on their schema
definitions.

## Configuration

The [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) template file controls how the `buf generate` command
executes `protoc` plugins for any [input](../reference/inputs.md). The `buf.gen.yaml` template lists one or more
plugins and, optionally, other file option configurations with [managed mode](managed-mode.md). For more information
on the `buf.gen.yaml` configuration, please refer to the [reference](../configuration/v1/buf-gen-yaml.md).

## Define a module

To get started, create a [module](../bsr/overview.md#modules) by adding a
[`buf.yaml`](../configuration/v1/buf-yaml.md) file to the root of the directory that contains your
Protobuf definitions. You can create the default `buf.yaml` file with this command:

```sh
$ buf mod init
```

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

## Create a `buf.gen.yaml`

Now that you have an [input](../reference/inputs.md) to generate code for, we need to define a
`buf.gen.yaml` and specify what `protoc` plugins you want to use. For example, here's a typical `buf.gen.yaml`
for [go](https://github.com/protocolbuffers/protobuf-go) and [grpc](https://github.com/grpc/grpc-go/), assuming
`protoc-gen-go` and `protoc-gen-go-grpc` are on your `$PATH`:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: go
    out: gen/go
    opt: paths=source_relative
  - name: go-grpc
    out: gen/go
    opt:
      - paths=source_relative
      - require_unimplemented_servers=false
```

By default, `buf generate` looks for a file of this shape named `buf.gen.yaml` in your current directory. This
can be thought of as a template for the set of plugins you want to invoke.

Plugins are invoked in the order they are specified in the template, but each plugin has a per-directory parallel
invocation, with results from each invocation combined before writing the result. For more information,
see the [`buf.gen.yaml` reference](../configuration/v1/buf-gen-yaml.md).

## Run generate

Run this to generate from the [input](../reference/inputs.md) in your current directory:

```sh
$ buf generate
```

You can also run `buf generate` on an input by specifying the filepath to the
directory containing the root of your `.proto` definitions. For example if all of
your `.proto` files are in directory `foo`:

```sh
$ buf generate foo
```

The `buf generate` command will:

  - Discovers all Protobuf files per your `buf.yaml` configuration.
  - Copies the Protobuf files into memory.
  - Compiles all Protobuf files.
  - Executes the configured `plugins` according to each `strategy`.

Any errors are printed out in a `file:line:column:message` format by default.
For example:

```sh
$ buf generate
acme/pet/v1/pet.proto:5:8:acme/payment/v1alpha1/payment.proto: does not exist
```

Generate output can also be printed as JSON:

```sh
$ buf generate --error-format=json
---
{"path":"acme/pet/v1/pet.proto","start_line":5,"start_column":8,"end_line":5,"end_column":8,"type":"COMPILE","message":"acme/payment/v1alpha1/payment.proto: does not exist"}
```

## Common use cases

The most common use case is to generate using the current directory as
[input](../reference/inputs.md):

```terminal
$ buf generate
```

This command assumes that a [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) exists in the
directory where you run the command.

### Generating from a Buf module {#from-module}

You can generate from a Buf [module](../bsr/overview.md#modules) on the [Buf Schema
Registry](../bsr/introduction.md) (BSR) by providing the module name as the
[input](../reference/inputs.md):

```terminal
$ buf generate buf.build/acme/petapis
```

> This examples uses a Buf module as the input, but other inputs are available. For a complete list,
> see the [Buf input format documentation](../reference/inputs.md#source-formats).

### Generating using multiple templates {#multiple-templates}

The [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) file enables you to configure one
generation template. For cases where you need to use multiple templates for the same
[input](../reference/inputs.md), we recommend using multiple configuration files with different
names.

If you needed to use one template for Go and a different template for Java, for example, you could
create a `buf.gen.go.yaml` file and a `buf.gen.java.yaml` file and use separate commands to generate
code:

```terminal
$ buf generate --template buf.gen.go.yaml
$ buf generate --template buf.gen.java.yaml
```

You could also specify those different templates as JSON:

```terminal
$ buf generate --template '{"version":"v1","plugins":[{"name":"go","out":"gen/go"}]}'
$ buf generate --template '{"version":"v1","plugins":[{"name":"java","out":"gen/java"}]}'
```

### Generating to a specific directory {#output}

You can generate to a specific output directory using the `--output` or `-o` flag. This command
generates to the `bar/` directory while prepending `bar/` to the `out` directives in the template:

```terminal
$ buf generate https://github.com/foo/bar.git --template data/generate.yaml -o bar
```

The paths in the template and the `-o` flag are interpreted as relative to your
**current directory**, so you can place your template files anywhere.

## Limit to specific files

By default, `buf` builds all files under the `buf.yaml` configuration file. You can instead manually specify
the file or directory paths to build. This is an advanced feature intended to be used for editor or Bazel
integration - it is better to let `buf` discover all files under management and handle this for you in general.

If you only want to generate stubs for a subset of your input, you can do so via the `--path` flag:

```sh
# Only generate for the files in the directories proto/foo and proto/bar
$ buf generate --path proto/foo --path proto/bar

# Only generate for the files proto/foo/foo.proto and proto/foo/bar.proto
$ buf generate --path proto/foo/foo.proto --path proto/foo/bar.proto

# Only generate for the files in the directory proto/foo on your GitHub repository
$ buf generate https://github.com/foo/bar.git --template data/generate.yaml --path proto/foo
```

## Docker

Buf ships a Docker image [bufbuild/buf](https://hub.docker.com/r/bufbuild/buf) that enables you to
use `buf` as part of your Docker workflow. For example:

```sh
$ docker run \
  --volume "$(pwd):/workspace" \
  --workdir /workspace \
  bufbuild/buf generate
```
