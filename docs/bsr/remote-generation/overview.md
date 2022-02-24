---
id: overview
title: Overview
description: The BSR supports remote code generation, which means you fetch generated source code like any other dependency.
---

> The [remote code generation](/bsr/remote-generation/overview) feature is currently in **alpha**. We started with Go and have plans to add support for other languages. [Let us know](/contact.md) which language we should tackle next.

A common frustration when working with Protobuf is the dependency on language
specific generated code. Many teams implement custom tooling and scripts
to manage the lifecycle of code generation. It can be an uninteresting challenge to
ensure that every person that works on a given project has all of the code generation
tooling set up locally.

Furthermore, if you have Protobuf-based services your clients shouldn't have to deal
with code generation. They should be able to consume your API immediately. *And* it should
involve nothing more than pulling a generated client from their language's registry, that's it!

import Image from '@site/src/components/Image';

<Image alt="BSR module" src="/img/bsr/remote-code-gen.png" width={75} caption="The Buf Schema Registry's remote generation process" />

## Hosted plugins

Hosted plugins are reusable units of code generation packaged as Docker containers. The entrypoint is
a binary Protobuf encoded
[CodeGeneratorRequest](https://github.com/protocolbuffers/protobuf/blob/b24d0c2b7aeb2923d6e8e0c23946e7e2f493053b/src/google/protobuf/compiler/plugin.proto#L68-L96)
on standard in, and the output is a binary encoded
[CodeGeneratorResponse](https://github.com/protocolbuffers/protobuf/blob/b24d0c2b7aeb2923d6e8e0c23946e7e2f493053b/src/google/protobuf/compiler/plugin.proto#L99-L118)
on standard out. They are designed to be shared, and their packaging should be as generic as possible.

> Buf maintains a number of official plugins for various languages and grpc. See the [official plugins](https://docs.buf.build/bsr/remote-generation/remote-plugin-execution#official-plugins) for more details.

## Hosted templates

Hosted templates represent a collection of one or more plugins that run together to create a single result,
along with the parameters for, and version of, each plugin. A hosted template enables you to include
all the parameters you currently use to generate code locally.

Templates, like plugins, are intended to be shared. They should express a particular use case,
but shouldn't be specific to an input module. For example, you may create a template that generates
JavaScript for Node.js, and one that generates JavaScript optimized for web browsers. Neither of these concepts
are specific to a given input module, and they could be reused by others.

Buf maintains several official templates:

- https://buf.build/protocolbuffers/templates/js
- https://buf.build/protocolbuffers/templates/go
- https://buf.build/grpc/templates/web
- https://buf.build/grpc/templates/go

## Remote generation registries

With a specific Template version and a specific Module version, the BSR has enough information
to perform code generation. The output of this operation is stored in a Remote Generation Registry.
This is **extremely** powerful, because producers and consumers of Protobuf-based API
can import type definitions and/or service stubs in their language directly from the registry without having
to deal with code generation.

Initially we are targeting the Go ecosystem. Most modern language ecosystems, however, have some
concept of a "registry" where you can depend on external code artifacts in a well versioned way.
Examples include: Maven Central, RubyGems, Go modules, PyPI, crates.io, NPM, etc.

Remote generation registries must have a consistent way of versioning the output of code generation,
and it must ensure that it always serves the exact same content once a version has been released.
To accomplish this consistent versioning, the BSR adopts something we call
[synthetic versions](concepts.md#synthetic-versions).
