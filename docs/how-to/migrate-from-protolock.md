---
id: migrate-from-protolock
title: Migrate From Protolock
---

[Protolock](https://github.com/nilslice/protolock) is a widely used Protobuf tool that primarily
concentrates on breaking change detection. It deserves a lot of praise - in the OSS world, it
largely pioneered the breaking change detection effort, and has been well maintained. We
can't heap enough praise on this effort, it's helped the Protobuf ecosystem move forward in
a big way.

In this document, we'll discuss the pros and cons of Protolock vs `buf`'s [breaking change
detector](../breaking/overview), as well as `buf`-equivalent commands and migration.

## Protolock pros

- Protolock has a [plugin interface](https://github.com/nilslice/protolock/wiki/Plugins) allowing
  you to create external binaries that Protolock then calls itself to verify rules. The equivalent
  way to do this for `buf` is to ask us to add a lint or breaking rule, which we're more than
  happy to do in most scenarios. It's our feeling that calling out to external binaries for
  individual lint rules leads to issues with tool distribution and management, but this use
  case may be something you want, and `buf` does not support it.

## Protolock cons

- Protolock uses a third-party Protobuf parser that is not tested to cover every edge case
  of the Protobuf grammar, and has had such issues in the past. Additionally, this parser
  does not verify that what it is parsing is actually valid Protobuf, meaning that Protolock
  can both have breakages for valid Protobuf file, and happily parse Protobuf files that are
  not valid. Instead, `buf` lets you use either the internal compiler that is tested to
  cover every edge case and parses only valid files, or use `protoc` output
  as `buf` input. See our [compiler](../reference/internal-compiler.md) discussion
  for more details.
- Protolock uses a custom structure, represented in [JSON](https://github.com/nilslice/protolock/blob/1a3dd1a15d36f26d0a616be4584da6a4589e7844/parse.go#L19),
  to store your Protobuf schema state. This structure is populated based on the results
  of the third-party Protobuf parser, meaning that file data can be corrupted for an
  invalid parse. This structure also does not cover all known elements of a Protobuf
  schema, especially Protobuf options that can have an effect on your API compatibility.
  Instead, `buf` uses [`FileDescriptorSet`s][filedescriptorset], extended to [Buf images](../reference/images.md),
  which are the core primitive of the Protobuf ecosystem, and have been stable for over a decade.
  `buf`'s equivalent to lock files are serialized `FileDescriptorSet`s.
- Protolock only enforces 8 rules related to API compatibility in strict mode, and 5
  with strict mode disabled. `buf` enforces 46 rules related to API compatibility
  in its strictest mode (`FILE`), and 15 rules related to wire-only compatibility
  in its weakest mode (`WIRE`). We believe that the additional rules that `buf`
  enforces are critical to API compatibility.
- Breaking change rules are not a binary proposition - there are different kinds of
  breaking changes that you may care about. `buf` provides [four categories](../breaking/rules.md)
  of breaking change rules to select - per-file generated stub breaking changes,
  per-package generated stub breaking changes, wire breaking changes, and wire + JSON
  breaking changes. Within these categories, you can go further and enable or
  disable individual rules through configuration.
- `buf` provides `file:line:column:message` references for breaking change violations,
  letting you know where a violation occurred, including potentially integrating this
  into your editor in the future. These reference your current Protobuf schema, including
  if types move across files between versions of your Protobuf schema. The error output
  can be outputted as text or JSON, with other formats coming in the future.
  Protolock prints out unreferenced messages.
- Protolock relies on `proto.lock` files as the only way to store the representation
  of your previous Protobuf schema, and these files are represented by a custom
  structure. `buf` allows you to use lock files through `buf build`, but also
  allows [other methods](../breaking/usage.md) to store and retrieve your previous
  Protobuf schema, including:
    - Cloning the head of a branch of a Git repository, either local or remote, and
      compiling on the fly.
    - Reading a tar or zip archive, either local or remote and optionally compressed, and compiling
      on the fly.
    - Reading a "lock file", represented as a [Buf image](../reference/images.md), from either
      a local location or a remote http/https location.
- Both Protolock and `buf` run file discovery for your Protobuf files, however `buf` allows
  you to skip file discovery and specify your files [manually](../build/usage.md#limit-to-specific-files)
  for use cases that require this, such as [Bazel](/build-systems/bazel.md).
- Since `buf` can process `FileDescriptorSet`s as input, `buf` provides a [protoc plugin](../reference/protoc-plugins.md#breaking)
  to allow you to use `buf`'s breaking change detection functionality with your current `protoc` setup.

## Configuration

See the [breaking configuration](../breaking/configuration.md) documentation for more details.
Note that configuration can be provided via the flag `--config` on the command line if you do not want
to have a configuration file.

### Protolock rules to `buf` configured rules

See the [breaking rules](../breaking/rules.md) documentation for an overview of
all available breaking rules.

While we recommend using one of `buf`'s preset breaking categories, the below
configuration selects the same rules as the rules enforced by Protolock:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - ENUM_VALUE_NO_DELETE_UNLESS_NAME_RESERVED
    - ENUM_VALUE_NO_DELETE_UNLESS_NUMBER_RESERVED
    - FIELD_NO_DELETE_UNLESS_NAME_RESERVED
    - FIELD_NO_DELETE_UNLESS_NUMBER_RESERVED
    - FIELD_SAME_NAME
    - FIELD_SAME_TYPE
    - RESERVED_ENUM_NO_DELETE
    - RESERVED_MESSAGE_NO_DELETE
    - RPC_NO_DELETE
    - RPC_SAME_CLIENT_STREAMING
    - RPC_SAME_REQUEST_TYPE
    - RPC_SAME_RESPONSE_TYPE
    - RPC_SAME_SERVER_STREAMING
```

This roughly corresponds to the `WIRE_JSON` group, with some rules added and
some deleted. The below configuration is equivalent to the above configuration:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - WIRE_JSON
    - RPC_NO_DELETE
  except:
    - ENUM_VALUE_SAME_NAME
    - FIELD_SAME_JSON_NAME
    - FIELD_SAME_LABEL
    - FIELD_SAME_ONEOF
    - MESSAGE_SAME_MESSAGE_SET_WIRE_FORMAT
    - RPC_SAME_IDEMPOTENCY_LEVEL
```

### Protolock flags that are `buf` configuration options

The Protolock flag `--ignore` can be handled by the `breaking.ignore` and `breaking.ignore_only`
configuration options.

The Protolock flag `--protoroot` is effectively handled by the placement of the
[`buf.yaml`](../configuration/v1/buf-yaml.md) configuration file.

The Protolock flag `--lockdir` is handled by your against input, as `buf` can take multiple types
of input to compare against. The equivalent in `buf` would be to specify your Buf image location with
`--against path/to/lock.bin`.

## Equivalent commands

There are multiple methods to compare versions in `buf`, see the [breaking usage](../breaking/usage.md)
documentation for more details.

This section assumes you are using stored [Buf image](../reference/images.md) files as your method of comparing versions of your
Protobuf schema.

### `protolock init`

```sh
$ buf build -o lock.bin
```

This writes a binary [Buf image](../reference/images.md) of your current Protobuf schema. If you prefer this to be stored as JSON,
as Protolock does, instead write to a file with a `.json` extension, such as `buf build -o lock.json`.
Note that by default, `buf build` include source code info, which makes the resulting file significantly
larger. If this is not a concern, we recommend keeping the source code info for usage with other parts of
Buf, but if you are only using `buf` for breaking change detection, you can safely suppress source code info
with the `--exclude-source-info` flag.

### `protolock status`

```sh
$ buf breaking --against lock.bin
```

This checks  for breaking changes against the `lock.bin` [Buf image](../reference/images.md) file.
Use `buf breaking --against lock.json` if you wrote a JSON file.

### `protolock commit`

```sh
$ buf breaking --against lock.bin && buf build -o lock.bin
```

## Docker

Protolock provides a [Docker image](https://hub.docker.com/r/nilslice/protolock) with `protolock` installed.
The equivalent Docker image for `buf` is [bufbuild/buf](https://hub.docker.com/r/bufbuild/buf). For example:

```sh
docker pull bufbuild/buf
docker run --volume "$(pwd)/workspace" --workdir "/workspace" bufbuild/buf lint
```

[filedescriptorset]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto
