---
id: overview
title: Overview
description: The BSR supports remote code generation, which means you fetch generated source code like any other dependency.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

> Remote code generation is an **experimental feature**. We started with Go and have plans to add support for other languages. [Let us know what language we should tackle next](../../contact.md).

A common frustration when working with Protobuf is the dependency on language
specific generated code. Many teams implement custom tooling and scripts
to manage the lifecycle of code generation. It can be an uninteresting challenge to
ensure that every person that works on a given project has all of the code generation
tooling set up locally.

Furthermore, if you have Protobuf-based services your clients shouldn't have to deal
with code generation. They should be able to consume your API immediately. *And* it should
be as simple as pulling a generated client from their language's registry, that's it!

<div align="center">
  <img alt="BSR module" src={useBaseUrl('/img/bsr/remote-code-gen.png')} width="75%" />
</div>

## Hosted plugins

Hosted plugins are reusable units of code generation packaged as Docker containers. The entrypoint is
a binary Protobuf encoded
[CodeGeneratorRequest](https://github.com/protocolbuffers/protobuf/blob/b24d0c2b7aeb2923d6e8e0c23946e7e2f493053b/src/google/protobuf/compiler/plugin.proto#L68-L96)
on standard in, and the output is a binary encoded
[CodeGeneratorResponse](https://github.com/protocolbuffers/protobuf/blob/b24d0c2b7aeb2923d6e8e0c23946e7e2f493053b/src/google/protobuf/compiler/plugin.proto#L99-L118)
on standard out. Thery are designed to be shared, and their packaging should be as generic as possible.

It's unlikely you will interact with plugins directly. Instead you'll use one or more plugins as
building blocks within templates that will run against a module to produce generated code.

Buf maintains several official plugins:

- [library/go](https://buf.build/library/plugins/go):
based on the official Go Protobuf plugin, [`protoc-gen-go`](https://pkg.go.dev/google.golang.org/protobuf)

## Hosted templates

Hosted templates represent a collection of one or more plugins that run together to create a single result,
along with the parameters for, and version of, each plugin. A hosted template allows you to express
all parameters you currently use to generate code locally.

Templates, like plugins, are intended to be shared. They should express a particular use case,
but shouldn't be specific to an input module. For example, you may create a template that generates
JavaScript for Node.js, and one that generates JavaScript optimized for web browsers. Neither of these concepts 
are specific to a given input module, and they could be reused by others.

Buf maintains several official templates:

* [library/go](https://buf.build/library/templates/go):
generates the module and dependencies using the official Go Protobuf plugin,
[`protoc-gen-go`](https://pkg.go.dev/google.golang.org/protobuf).
This is useful if you want to depend on a package which doesn't contain any Protobuf services.
* [library/go-grpc](https://buf.build/library/templates/go-grpc):
generates the module and dependencies using the official Go Protobuf plugin,
[`protoc-gen-go`](https://pkg.go.dev/google.golang.org/protobuf)
and the official Go gRPC plugin,
[`protoc-gen-go-grpc`](https://pkg.go.dev/google.golang.org/grpc/cmd/protoc-gen-go-grpc).
This is useful if you want to depend on a package which contains Protobuf services,
as well as other definitions.

## Remote Generation Registries

With a specific Template version and a specific Module version, the BSR has enough information
to perform code generation. The output of this operation is stored in a Remote Generation Registry.
This is **extremely** powerful, because producers and consumers of Protobuf-based API
can import type definitions and/or service stubs in their language directly from the registry without having
to deal with code generation.

Initially we are targeting the Go ecosystem. However, most modern language ecosystems have some concept of
a "registry" where you can depend on external code artifacts in a well versioned way.
Examples include: Maven Central, RubyGems, Go modules, PyPI, crates.io, NPM, etc.

Remote generation registries must have a consistent way of versioning the output of code generation,
and it must ensure that it always serves the exact same content once a version has been released.
To accomplish this consistent versioning, the BSR adopts something we call
[Synthetic Versions](#synthetic-versions).

### Synthetic Versions

The challenge with versioning remote generated code, is that it is the product of two logical
inputs: the Protobuf module and the template version. The lowest common denominator of the language
registry ecosystems we surveyed is "semantic versioning without builds or prereleases", so something like
`v1.2.3`.

To ensure that we can create consistent, and lossless synthetic versions, we simplify the versioning schemes
of the two inputs. Both template versions, and Protobuf module versions, can be represented as **monotonically
increasing integers**.

- For hosted Templates we enforce a version of the form `v1`, `v2`, `vn...`.
- For Protobuf modules we use the module reference sequence ID. This ID is an integer that uniquely idenfities a commit. It is calculated by counting the number of commits since the first commit of a module.

With these simplified versioning schemes we create a synthetic version which takes the
following form:

```
[v1].[template_version].[commit_sequence_id]
```

As an example, the version `v1.3.5` represents the 3rd version of a hosted template and the 5th commit
of a Protobuf module.
