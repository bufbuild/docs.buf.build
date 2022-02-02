---
id: introduction
title: Introduction
---

Buf’s long-term goal is to enable [Schema-Driven Development](https://buf.build/blog/api-design-is-stuck-in-the-past): a future where APIs
are defined consistently, in a way that service owners and clients can depend on.

Defining APIs using an [IDL](https://en.wikipedia.org/wiki/Interface_description_language) provides a number of benefits over simply exposing JSON/REST
services, and today, [Protobuf](https://developers.google.com/protocol-buffers) is the most stable, widely-adopted IDL in the industry. However, as it
stands, using Protobuf is much more difficult than using JSON as your data transfer format.

Buf is building tooling to make Protobuf reliable and easy to use for service owners and clients, while keeping it the obvious choice on the technical
merits. Your organization should not have to reinvent the wheel to create, maintain, and consume Protobuf APIs efficiently and effectively. We'll handle
your Protobuf management strategy for you, so you can focus on what matters.

## The problems we aim to solve

Traditionally, adopting Protobuf presents a number of challenges across the API lifecycle. These are the problems we aim to solve:

  - **API designs are often inconsistent**: Writing maintainable, consistent Protobuf APIs isn't as widely understood as writing maintainable JSON/REST-based APIs.
    With no standards enforcement, inconsistency can arise across an organization's Protobuf APIs, and design decisions can inadvertently affect your API's future
    iterability.

  - **Dependency management is usually an afterthought**: Protobuf files are vendored manually, with an error-prone copy-and-paste process from GitHub repositories.
    Before the [BSR](bsr/introduction.md), there was no centralized attempt to track and manage around cross-file dependencies. This is analogous to writing JavaScript without
    `npm`, Rust without `cargo`, Go without modules, and all of the other programming language dependency managers we've all grown so accustomed to.

  - **Forwards and backwards compatibility is not enforced**: While forwards and backwards compatibility is a promise of Protobuf, actually maintaining backwards-compatible
    Protobuf APIs isn't widely practiced, and is hard to enforce.

  - **Stub distribution is a difficult, unsolved process**: Organizations have to choose to either centralize their `protoc` workflow and distribute generated code, or
    require all service clients to run `protoc` independently. Because there is a steep learning curve to using `protoc` (and the associated `protoc` plugins) in a reliable
    manner, organizations often struggle with distributing their Protobuf files and stubs. This creates substantial overhead, and often requires a dedicated team to manage
    the process. Even when using a build system like [Bazel](https://bazel.build), exposing APIs to external customers remains problematic.

  - **The tooling ecosystem is limited**: Lots of easy-to-use tooling exists today for JSON/REST APIs. Mock server generation, fuzz testing, documentation, and other daily
    API concerns are not widely standardized and easy to use for Protobuf APIs. As a result, teams regularly reinvent the wheel and build custom tooling to replicate the
    JSON ecosystem.

## Buf is building a modern Protobuf ecosystem

Our tools address many of the problems above, ultimately allowing you to redirect much of your time and energy from managing Protobuf files to implementing your core features
and infrastructure.

### The `buf` CLI

The `buf` CLI is designed to be extremely simple to use, and helps you create consistent Protobuf APIs that preserve compatibility and comply with design best-practices.
The tool is currently available on an open-source basis. The `buf` CLI incorporates the following components to help you create consistent Protobuf APIs:

- A [linter](lint/overview.md) that enforces good API design choices and structure.
- A [breaking change detector](breaking/overview.md) that enforces compatibility at the source code or wire level.
- A [generator](generate/usage.md) that invokes your `protoc` plugins based on a configurable template.
- A [protoc replacement](generate/high-performance-protoc-replacement.md) that uses Buf's newly-developed [high performance Protobuf compiler](build/internal-compiler.md).

### The Buf Schema Registry (BSR)

The Buf Schema Registry ([BSR](bsr/introduction.md)) is a hosted SaaS platform that serves as your organization’s source of truth for your Protobuf APIs. The BSR
enables you to centrally maintain compatibility and manage dependencies, while enabling your clients to consume APIs reliably and efficiently.
Similar to `npm` for JavaScript, `pip` for Python, or `cargo` for Rust, the BSR _finally_ brings dependency management to your Protobuf APIs.

Over time, our goal is to make the BSR the only tool you need to manage your Protobuf workflow from end to end. To that end, there's a lot we
are planning with the BSR. For a quick overview, see our [roadmap](roadmap.md).

## Where to go from here

To install `buf`, please see the [installation](installation.mdx) page.

Next, we recommend completing the [tour](tour/introduction.md). The tour will give you an overview of most of the existing functionality of Buf, and takes
approximately 20 minutes to complete.

After completing the tour, check out the remainder of the documentation for your specific areas of interest. We've aimed to provide as much documentation
as we can for the various components of Buf to give you a full understanding of Buf's surface area.

Finally, [follow the project on GitHub](https://github.com/bufbuild/buf), and [contact us](contact.md) if you'd like to get involved.
