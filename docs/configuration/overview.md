---
id: overview
title: Overview
---

The `buf` CLI interacts with several configuration files depending on the operation. A complete list of
the relevant `buf` configuration files for `v1` is shown below:

  * [`buf.yaml`](v1/buf-yaml.md)
  * [`buf.lock`](v1/buf-lock.md)
  * [`buf.gen.yaml`](v1/buf-gen-yaml.md)
  * [`buf.work.yaml`](v1/buf-work-yaml.md)

## `buf.yaml`

The `buf.yaml` is used to define a [module](../bsr/overview.md#modules). The `buf.yaml` is the primary configuration file,
and is responsible for the module's name, the module's dependencies, as well as the module's `lint` and `breaking`
configuration.

For more on the `buf.yaml` file, refer to the [`buf.yaml`](v1/buf-yaml.md) page!

## `buf.lock`

The `buf.lock` file contains the module's dependency manifest, and represents a single, reproducible build
of your module's dependencies.

For more on the `buf.lock` file, refer to the [`buf.lock`](v1/buf-lock.md) page!

## `buf.gen.yaml`

The `buf.gen.yaml` file is used to define a **local generation template** that works directly with the `buf generate`
command. In short, the `buf.gen.yaml` file is used to easily generate code with `protoc` plugins and simplifies
the `protoc` experience significantly.

For more on the `buf.gen.yaml` file, refer to the [`buf.gen.yaml`](v1/buf-gen-yaml.md) page!

## `buf.work.yaml`

The `buf.work.yaml` file is used to define a [workspace](../reference/workspaces.md), which is an advanced local development feature. In
short, the `buf.work.yaml` file makes it possible to consolidate one or more modules into a single buildable unit.
Workspaces also allow users to run `buf` operations across multiple modules with a single execution
(such as `buf lint`).

For more on the `buf.work.yaml` file, refer to the [`buf.work.yaml`](v1/buf-work-yaml.md) page!

## Default configuration

The default configuration location depends on the [input](../reference/inputs.md). If `buf` is executed with an input that
contains `buf.{mod,lock,work}` files, those files are used for the given operation. Running `buf
lint`, for example, would use the `lint` configuration found in the inputs `buf.yaml`, if it
exists.

If a `buf.yaml` file is not contained in the input, `buf` operates as if there is a `buf.yaml` file with the
[default values](v1/buf-yaml.md#default-values). The `buf.{lock,work}` files do not have a default value.

It's important to note that, unlike the `buf.{mod,lock,work}` files, the `buf.gen.yaml` file found in the input is
**not** used by default. Instead, the `buf.gen.yaml` found in the **current working directory** is used by default. You can
manually specify the `buf.gen.yaml` file to use with the `--template` flag, which is explained further in the
[generate usage](../generate/usage.md). The `buf.gen.yaml` file does not have a default value, so running `buf generate`
without a `buf.gen.yaml` file in the current working directory yields an error (unless a `--template` is explicitly specified).

## Configuration override

> Specifying an alternative configuration location is an advanced feature and is **not** necessary in most cases.

A large number of the `buf` commands support a `--config` flag that is used to override the `buf.yaml` configuration
with a file path or direct JSON or YAML data. This is useful for situations where you may want to specify all options
via the command line, for example with [Bazel](https://bazel.build) integrations and/or when using the `protoc` plugins.

All commands have one or more `--.*config` flags that control this behavior. For example:

  * `buf build --config` specifies the config for the source input.
  * `buf lint --config` specifies the config for the source or [Buf image](/reference/images) input.
  * `buf breaking --config` specifies the config for the source or image input.
  * `buf breaking --against-config` specifies the config for the source or image input to compare against.

The value of this flag is interpreted as follows:

  * If the value ends in `.json`, this is interpreted to be a local path to a JSON file.
  * If the value ends in `.yaml`, this is interpreted to be a local path to a YAML file.
  * Otherwise, this is interpreted to be either JSON or YAML data, which is directly parsed.

For example:

```sh
# Read the JSON file foo/bar.json.
$ buf lint --config foo/bar.json

# Read the YAML file foo/bar.yaml.
$ buf lint --config foo/bar.yaml

# Use the given JSON data.
# This results in only using the ENUM_NO_ALLOW_ALIAS lint rule for linting.
$ buf lint --config '{"lint":{"use":["ENUM_NO_ALLOW_ALIAS"]}}'
```
