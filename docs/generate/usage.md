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
plugins and, optionally, other file option configurations with [Managed Mode](managed-mode.md). For more information
on the `buf.gen.yaml` configuration, please refer to the [reference](../configuration/v1/buf-gen-yaml.md).

## Define a module

To get started, create a [module](../bsr/overview.md#modules) by adding a [`buf.yaml`](../configuration/v1/buf-yaml.md)
file to the root of the directory that contains your Protobuf definitions. You can create the default `buf.yaml`
file with this command:

```sh
$ buf config init
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

To generate for the input in your current directory, simply run:

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

These commands illustrate several common cases for `buf generate`:

```sh
# Uses the current directory as input, and assumes a `buf.gen.yaml` also exists in the current directory.
$ buf generate

# Uses the buf.build/acme/petapis module as input, using a `buf.gen.yaml` in the current directory.
$ buf generate buf.build/acme/petapis

# Uses the current directory as input, and explicitly specifies a custom template in another directory.
$ buf generate --template data/generate.yaml

# The --template flag also takes YAML or JSON data as input, so it can be used without a file.
$ buf generate --template '{"version":"v1","plugins":[{"name":"go","out":"gen/go"}]}'

# Download the repository, compile it, and generate per the generate.yaml template.
$ buf generate https://github.com/foo/bar.git --template data/generate.yaml

# Generate to the bar/ directory, prepending bar/ to the out directives in the template.
$ buf generate https://github.com/foo/bar.git --template data/generate.yaml -o bar
```

The paths in the template and the `-o` flag are interpreted as relative to your
**current directory**, so you can place your template files anywhere.

For a complete list of supported inputs refer to the [Input format documentation](../reference/inputs.md#source-formats).


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

Buf ships a Docker image [bufbuild/buf](https://hub.docker.com/r/bufbuild/buf) that allows
you to use `buf` as part of your Docker workflow. For example:

```sh
$ docker run \
  --volume "$(pwd):/workspace" \
  --workdir /workspace \
  bufbuild/buf generate
```
