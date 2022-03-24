---
id: overview
title: Overview
---

import Image from '@site/src/components/Image';

## Modules

A **module** is a collection of Protobuf files that are configured, built, and versioned as a logical unit. By moving away from individual `.proto` files, the **module** simplifies file discovery and eliminates the need for complex build scripts to `-I` include, exclude, and configure your Protobuf sources.

<Image alt="BSR module" src="/img/bsr/module_2_with_yaml.png" caption="How modules map to Buf YAML configs" />

Storing modules in the BSR, a Protobuf-aware registry, protects you from publishing broken builds. Module consumers have confidence that the modules that they pull compile, something that isn't possible with traditional version control systems.

The module's name uniquely identifies and gives ownership to a collection of Protobuf files, which means you can push modules to authorized repositories within the BSR, add hosted modules as dependencies, consume modules as part of code generation, and much more.

A **module** is identified by a `name` key in the [`buf.yaml`](../configuration/v1/buf-yaml.md) file, which is placed at the root of the Protobuf source files it defines. This tells `buf` where to search for `.proto` files, and how to handle imports. Unlike `protoc`, where you manually specify `.proto` files, `buf` recursively discovers all `.proto` files under configuration to build the module.

```yaml title=buf.yaml {2}
version: v1
name: buf.build/acme/weather
```

The module `name` is composed of three parts: the remote, owner, and repository:

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Module name syntax"
  examples={["buf.build/acme/weather"]}
  segments={[
    {label: "buf.build", kind: "default"},
    {separator: "/"},
    {label: "owner", kind: "variable", href: "/bsr/user-management#resource-owner"},
    {separator: "/"},
    {label: "repository", kind: "variable", href: "/bsr/overview#modules"},
  ]}
/>

- **Remote**: The DNS name for the server hosting the BSR. This is always `buf.build`.
- **Owner**: An entity that is either a user or organization within the BSR ecosystem.
- **Repository**: Stores a single module and all versions of that module.

    While roughly analogous to Git repositories, a Buf repository is only a remote location&mdash;there is no concept of a repository "clone" or "fork". Repositories do not exist in multiple locations.

    Every repository is identified by its module name, allowing it to be imported by other modules and uniquely identified within the BSR.

Many organizations with public Protobuf files are already using the BSR, and some of the bigger ones are officially maintained by Buf. These include

* [cncf/xds](https://buf.build/cncf/xds)
* [envoyproxy/envoy](https://buf.build/envoyproxy/envoy)
* [envoyproxy/protoc-gen-validate](https://buf.build/envoyproxy/protoc-gen-validate)
* [gogo/protobuf](https://buf.build/gogo/protobuf)
* [googleapis/googleapis](https://buf.build/googleapis/googleapis)
* [grpc/grpc](https://buf.build/grpc/grpc)
* [opencensus/opencensus](https://buf.build/opencensus/opencensus)
* [opentelemetry/opentelemetry](https://buf.build/opentelemetry/opentelemetry)

## Documentation

Every push to the BSR generates documentation. You may browse the documentation section of a repository by navigating to the `Docs` tab.

For more information, see [Generated documentation](documentation).

## Dependencies

A module can declare dependencies on other modules, which is configured in the `deps` key of your `buf.yaml`. You can add dependencies by adding their module name to the `deps` list. For example:

```yaml title="buf.yaml"
version: v1
name: buf.build/acme/weather
deps:
  - buf.build/acme/units
```

Although we **do not recommend** it, in some situations you may need to pin a module to a specific version. Ideally, authors keeps modules backwards-compatible and avoid breaking changes so you can *always* rely on the latest version.

```yaml
deps:
  - buf.build/acme/units:1c473ad9220a49bca9320f4cc690eba5
```

Once a dependency is added to the configuration file, you need to run:

```terminal
$ buf mod update
```

This updates all your deps to their latest version and is captured in a `buf.lock` file.

**You can now import the Protobuf types just like you would if you had the files locally:**

```protobuf title="acme/weather/v1/weather.proto" {3,7}
package acme.weather.v1;

import "acme/units/v1/unit.proto";

message Forecast {
  string description = 1;
  acme.units.Degree temperature = 2;
}
```

The `buf` CLI automatically resolves the module(s) specified in the `deps` list.

> See the [Usage](../bsr/usage.md#add-a-dependency) section for a detailed example.

## Referencing a module

Each module on the BSR exists as a snapshot, and contains a unique reference associated with every change.

A reference is a way to refer to a single version of the repository. While a reference always _resolves_ to a single snapshot of the repository, it can be either a commit or a tag.

**Commit**: Every push of new content to a repository is associated with a commit that identifies that change in the schema. The commit is created after a successful push. This means that unlike Git, the commit only exists on the BSR repository and not locally.

**Tag**: A reference to a single commit but with a human readable name, similar to a Git tag. It is useful for identifying commonly referenced commits&mdash;like a release.

## Local modules with workspaces

If you want to depend on local modules, you can set up a [workspace](../reference/workspaces.md) to discover modules through your file system. If you are in a workspace, `buf` looks for `deps` in your [workspace configuration](../reference/workspaces.md#configuration) _before_ attempting to find it on the BSR.

This makes workspaces a good way to iterate on multiple modules at the same time before pushing any changes to the BSR.

> For an in-depth example check out the [Tour - Use a Workspace](../tour/use-a-workspace.md)

## Module cache

`buf` caches files it downloads as part of module resolution in a folder on
the local filesystem to avoid incurring the cost of downloading modules repeatedly.
To choose where to cache the files, it checks these, in order:

  * The value of `$BUF_CACHE_DIR`, if set.
  * The value of `$XDG_CACHE_HOME` falling back to `$HOME/.cache` on Linux and Mac and `%LocalAppData%` for Windows.

## Code generation

Hosting modules on the BSR means anyone with proper access can consume those modules. This solves the need to coordinate and sync Protobuf files manually amongst multiple consumers, which is error prone and quite often leads to drift.

Instead, users bring their own plugins and generate code from a single source of truth: a hosted module on the BSR. This is especially useful when consuming a Protobuf-based API that requires a client SDK for your language(s) of choice.

In your [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) define plugins and their respective options, and then generate your code with the `buf` CLI by referencing a BSR module:

```terminal
$ buf generate buf.build/acme/weather
```

> See the [Usage](../bsr/usage.md#code-generation) section for a detailed example.

Although beyond the scope of this overview, we suggest taking a look at [managed mode](../generate/managed-mode.md) as it relates to code generation. Historically, *consumer concerns* are conflated with *producer concerns* due to hardcoding of language-specific options in Protobuf files, which in turn restricts their usefulness to consumers. Managed mode addresses existing limitations and offers a better separation of concerns.
