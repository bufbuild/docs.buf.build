---
id: migrate-from-prototool
title: Migrate From Prototool
---

[Prototool](https://github.com/uber/prototool) is a widely used Protobuf tool that has a builder,
linter, formatter, breaking change detector, gRPC CLI, and configurable plugin executor.

In this document, we'll discuss the pros and cons of Prototool vs `buf`'s build, lint
and breaking change detection functionality, as well as `buf`-equivalent commands
and migration.

## Prototool pros

- Prototool has a formatter via `prototool format`. `buf` does not have a formatter as of
  now, but one may exist in the near future. The short is that Protobuf linters that exist
  today either rely on third-party Protobuf parsers (as Prototool does), which can result in
  corrupt files, or on FileDescriptorSets, which are lossy. If you're willing to assume the risks,
  however, this is functionality that Prototool has that `buf` does not.
- Prototool has gRPC CLI functionality via `prototool grpc`. This functionality
  roughly models parts of [grpcurl](https://github.com/fullstorydev/grpcurl) but with
  fewer available features. We think gRPC CLI functionality is better left to gRPC-specific
  tooling for now. See our [gRPC](grpc.md) documentation for how to use `buf` with `grpcurl`.
- Prototool has a much more prescriptive set of lint rules via the `uber2` lint
  group. This is a much more opinionated set of lint rules than `buf`'s `DEFAULT`
  category. We feel that the `DEFAULT` category is a set of rules that universally applies to
  many existing Protobuf schemas.
- Prototool provides `.proto` template generation, specific to the `uber1` and `uber2`
  lint groups, via `prototool create`. There is no equivalent functionality in `buf` and we
  do not have plans to provide such functionality.


## Prototool cons

- By far the biggest con of Prototool is that it both uses a third-party Protobuf parser
  that is not tested to cover every edge case of the Protobuf grammar, while additionally shelling
  out to `protoc` to verify that files are valid. The third-party Protobuf parser Prototool uses has
  had issues in the past with breakages, and as this parser does not verify that what it is parsing is
  actually valid Protobuf, Prototool shells out to `protoc` to verify validity. This means that Prototool
  is susceptible to both breakages for valid Protobuf files (if the parse fails), as well has having all
  the drawbacks of shelling out to `protoc`, especially parsing of `protoc` output. Prototool attempts to
  [parse stderr](https://github.com/uber/prototool/blob/0d05c76a4ff28512cc1c5d4b172ad55c26f141c6/internal/protoc/compiler.go#L48)
  from `protoc` output, which has breaking changes across minor versions of `protoc`. By default, Prototool
  downloads `protoc` for you, which is helpful for many cases, but can cause issues if the download [fails](https://github.com/uber/prototool/issues/512),
  the cache is corrupted, or if the `protoc` version is not locked. We highly recommend reading [our
  discussion](../build/internal-compiler) on Protobuf compilation for more details.

  Instead, `buf` lets you use either the [internal compiler](../build/internal-compiler.md)
  that is tested to cover every edge case and only parse valid files, or use `protoc` output as `buf` input.
  `buf` can actually use [many types of input](../reference/inputs.md), including `protoc` output,
  local or remote Git repositories, and local or remote archives. `buf` never shells out to external commands
  to perform any of its functionality. `buf` also has no cache as it does not need to cache any external binaries
  to perform its functionality.
- Prototool runs file discovery for your Protobuf files, but provides no
  mechanism to skip file discovery and specify your files manually, outside
  of running commands for files one at a time, which breaks some lint and
  breaking change detection functionality. `buf` enables you to skip file discovery
  and specify your files [manually](../build/usage.md#limit-to-specific-files)
  for use cases that require this, such as [Bazel](https://bazel.build).
- Prototool's lint functionality lets you select a single group, currently
  `google`, `uber1`, or `uber2`, and then add and remove rules from that
  specific group. `buf` instead provides [lint categories](../lint/rules.md)
  that you can mix and match, and lets you exclude entire categories
  or rules if you want. `buf` also presents a clear path to add additional
  rules to new categories in a backwards-compatible manner without
  touching existing categories.
- Prototool's breaking change detector cannot be configured as to what
  rules it runs to verify breaking change detection. `buf`'s rules are
  fully configurable, including ignores on a per-directory or per-file
  basis for every breaking rule or category.
- Breaking change rules are not a binary proposition - there are different kinds of
  breaking changes that you may care about. `buf` provides [four categories](../breaking/rules.md)
  of breaking change rules to select - per-file generated stub breaking changes,
  per-package generated stub breaking changes, wire breaking changes, and wire + JSON
  breaking changes. Within these categories, you can go further and enable or
  disable individual rules through configuration. Prototool effectively only
  checks per-package generated stub breaking changes.
- Prototool does not cover all possible issues per the `FileDescriptorSet` definition
  of what is a breaking change, even for per-package generated stub breaking changes.
- `buf` provides `file:line:column:message` references for breaking change violations,
  letting you know where a violation occurred, including potentially integrating this
  into your editor in the future. These reference your current Protobuf schema, including
  if types move across files between versions of your Protobuf schema. The error output
  can be outputted as text or JSON, with other formats coming in the future.
  Prototool prints out unreferenced messages.
- Since `buf` can process `FileDescriptorSet`s as input, `buf` provides
  `protoc` plugins [protoc-gen-buf-lint](../lint/protoc-plugin.md) and
  [protoc-gen-buf-breaking](../breaking/protoc-plugin.md) to allow you to use `buf`'s
  lint breaking change detection functionality with your current `protoc` setup.

## Prototool lint groups to `buf` lint categories

`buf` has lint categories that are either roughly equivalent or a subset of Prototool lint groups.
`buf` does not have linting functionality some elements such as file option naming. See the
["what we left out"](../lint/rules.md#what-we-left-out) documentation for more details.

### `google`

This Prototool configuration...

```yaml title="prototool.yaml"
lint:
  group: google
```

...is equivalent to this `buf` configuration:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - STYLE_BASIC
  except:
    - ONEOF_LOWER_SNAKE_CASE
    - PACKAGE_LOWER_SNAKE_CASE
```

But we recommend using one of the "top-level categories" `MINIMAL`, `BASIC`, or
`DEFAULT` instead. See the [lint rules](../lint/rules.md) documentation for more
details.

### `uber1`, `uber2`

The `uber1` and `uber2` Prototool lint groups are supersets of the `DEFAULT` `buf` lint
category, except you need to set overrides for enum value and service suffixes.
That is, `buf lint` should pass for all Protobuf schemas (except as discussed
below) that use `uber1` or `uber2` with Prototool, given this `buf` configuration:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
  enum_zero_value_suffix: _INVALID
  service_suffix: API
```

The only exception to this is for nested enum values with the `uber1` lint group.
The `uber1` lint group expects the enclosing message name for enums to be part
of enum value names. For example, this is a valid nested enum for `uber1`:

```protobuf
// THIS IS FOR UBER1 IN PROTOTOOL
// THIS DOES NOT PASS BUF'S ENUM_VALUE_PREFIX LINT RULE
message Foo {
  enum Bar {
    FOO_BAR_INVALID = 0;
    FOO_BAR_ONE = 1;
  }
}
```

For the `uber2` lint group, and for `buf`, the enclosing message name should not be
part of the enum value prefix. While Prototool's lint rule allows `uber1`-style
prefixes for backwards compatibility, `buf` expects that the prefix only include
the enum name. For example:

```protobuf
message Foo {
  enum Bar {
    BAR_INVALID = 0;
    BAR_ONE = 1;
  }
}
```

Protobuf allows multiple enum values with the same name in different nested
messages - this does not violate the scoping rules.

## Configuration

`buf` primarily uses a [`buf.yaml`](../configuration/v1/buf-yaml.md) configuration file that
should be at the root of the `.proto` files it defines, whereas Prototool uses the `prototool.yaml`
configuration file. We'll discuss the Prototool configuration sections below.

### `excludes`

Corresponds to `build.excludes` in `buf`.

### `protoc`

There is no equivalent in `buf`.

`buf` does not download or shell out to `protoc`.

### `create`

There is no equivalent in `buf`.

`buf` does not have `.proto` template generation.

### `lint.group`

Corresponds to `lint.use` in `buf`.

`buf` enables you to specify categories or ids in `lint.use`, while `lint.group` in Prototool
only specifies the single group to use as a base set of rules.

### `lint.ignores`

Corresponds `lint.ignore_only` in `buf`.

`buf` also enables you to ignore all rules for specific directories through `lint.ignore`.

### `lint.rules`

Corresponds to `lint.use` and `lint.except` in `buf`.

See the [lint configuration](../lint/configuration.md) documentation for more details.

### `lint.file_header`

There is no equivalent in `buf`.

`buf` does not have a formatter, and this option is largely integrated into the formatter.
We can provide file header functionality in the future if there is a big demand for it,
but this is probably best left to other tooling.

### `lint.java_package_prefix`

There is no equivalent in `buf`.

`buf` does not check file options as of now, see [our discussion on this](../lint/rules.md#file-option-values)
for more details.

### `break.include_beta`

Corresponds to the inverse of `breaking.ignore_unstable_packages` in `buf`.

### `break.allow_beta_deps`.

There is no equivalent in `buf`.

`buf` does not do package dependency enforcement, although we could add this feature in a
more generic fashion through a new `buf` command in the future if there is a demand for it.

### `generate`

Use a plugin template as described in the [generation documentation](../generate/usage.md). The
default location for a plugin template is [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md).

## Equivalent commands

### `prototool all`

There is no equivalent in `buf`.

The command `prototool all` runs formatting and linting at once but it doesn't present
a straightforward way to extend what the definition of "all" means, for example breaking
change detection. Since `buf` is relatively fast in its various functionality (for example,
compiling and linting all 2,311 files in [googleapis](https://github.com/googleapis/googleapis)
takes about 0.8s with `buf`), we feel that it is better to run multiple commands for the
functionality you want to perform.

### `prototool break check --git-branch master`

```sh
$ buf breaking --against '.git#branch=master'
$ buf breaking --against '.git#tag=v1.0.0'
```

Prototool's `--json` flag can be replaced with `--error-format=json` with `buf`.

### `prototool break check --descriptor-set-path lock.bin`

```sh
$ buf breaking --against lock.bin
```

### `prototool cache`

There is no equivalent in `buf`.

`buf` does not have a cache, as it does not shell out to external commands.

### `prototool compile`

```sh
$ buf build
```

`buf` handles `/dev/null` on Mac and Linux, and `nul` in Windows as a special-case,
and even though writing to `/dev/null` is very quick, `buf` stops short on writing if this is
specified.

### `prototool config init`

```sh
$ buf beta config init
```

### `prototool create`

There is no equivalent in `buf`.

`buf` does not do `.proto` template generation.

### `prototool descriptor-set`

```sh
$ buf build --exclude-imports --exclude-source-info -o -
```

This writes a binary [Buf image](../reference/images.md) to stdout. While images are wire compatible with
`FileDescriptorSet`s, you can strip the extra metadata with the `--as-file-descriptor-set` flag. If you want to write
to a file, specify the file path for `-o` instead of `-`.

### `prototool files`

```sh
$ buf ls-files
```

### `prototool format`

There is no equivalent in `buf`.

`buf` does not have a formatter, see the above discussion for more details.

### `prototool generate`

```sh
$ buf generate
```

See the [generation documentation](../generate/usage.md) for more details.

### `prototool grpc`

There is no equivalent in `buf`.

`buf` does not have gRPC functionality, as discussed above. We recommend using
[grpcurl](https://github.com/fullstorydev/grpcurl) instead. See the [gRPC](grpc.md)
documentation for details on how to use `FileDescriptorSet`s produced by `buf` for
`grpcurl` input.

### `prototool lint`

```sh
$ buf lint
```

Prototool's `--json` flag can be replaced with `--error-format=json` with `buf`.

### `prototool lint --list-linters`

```sh
$ buf mod ls-lint-rules
```

### `prototool lint --list-all-linters`

```sh
$ buf mod ls-lint-rules --all
```

### `prototool version`

```sh
$ buf --version
```

### `prototool x inspect`

There is no equivalent in `buf`.

We recommend using `buf build -o -#format=json | jq` instead for Protobuf
schema inspection. We plan on providing additional tooling for inspection in the future
through a different mechanism.

## Docker

Prototool provides a [Docker image](https://hub.docker.com/r/uber/prototool) with `prototool` installed.
The equivalent Docker image for `buf` is [bufbuild/buf](https://hub.docker.com/r/bufbuild/buf). For example:

```sh
$ docker pull bufbuild/buf
$ docker run --volume "$(pwd):/workspace" --workdir "/workspace" bufbuild/buf lint
```

Note that the `buf` command is the `ENTRYPOINT`, so you omit `buf` from the `docker run` invocation.
