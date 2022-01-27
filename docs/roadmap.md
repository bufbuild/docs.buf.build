---
id: roadmap
title: Roadmap
---

What you see today is just the start. In fact, the real value will come as we build
products that utilize the BSR as a foundation to understand and reason about API schemas,
including in real time.

Here, we outline some (but not all!) of the products on our roadmap. We'd love your input
and feedback, please [contact us](contact.md) to discuss any of the below, or any other products
you'd like to see.

## BSR

### Remote client and server library generation

One of the promises of BSR is to allow the generation of your APIs on demand. At a high level,
we want to enable modules to have stubs generated on-demand, for every version, for every possible
Protobuf plugin, with consumption via language-native mechanisms.

This feature is currently available for Buf's *experimental* [Go Module Proxy](bsr/remote-generation/overview.md#go-module-proxy).
Given a module (e.g. `buf.build/acme/weather`), you can consume generated code for:

  - Plugin `protoc-gen-go` version `1.4.0`
  - Plugin `protoc-gen-go-grpc` version `1.0.0`

All via a `go` command that results in a Go module:

```sh
$ go get go.buf.build/library/go-grpc/acme/weather
```

Similar mechanisms will exist for other languages, such as:

  - NPM packages
  - Maven repositories
  - Python packages
  - Ruby gems
  - Tarballs

This will enable users to consume Protobuf definitions without ever interacting with `buf`,
instead consuming APIs as if they were third-party libraries in their native coding
language. This can be especially powerful as we move towards a world where Protobuf is used
beyond internal APIs, but for external APIs as well.

### Enforced linting and compatibility

The BSR currently leans on the module author to verify that their proposed commit is backwards-compatible with previous commits
before the module is pushed. It's easy enough to run `buf breaking`, but mistakes happen and users might forget to instrument
this in their CI pipeline.

Instead, we can let users configure backwards-compatibility for the module itself so that it's **enforced on the server side**.
Better yet, the same could be done for `buf lint`, too. This unlocks huge potential with respect to updating dependencies.
By virtue of Protobuf API compatibility, if the latest commit is guaranteed to be compatible with all of its previous commits,
consumers can always resolve the latest commit for each of their dependencies and authors never need to worry about breaking
their customers.

### Solving the diamond dependency problem

It's only a matter of time until the [Diamond Dependency Problem](https://en.wikipedia.org/wiki/Dependency_hell) manifests itself
in dependency management systems. Historically, these issues can only be verified at build time because the dependency management
solution attempts a "best effort", i.e. the developer tries to compile their code after their dependencies have been resolved, but
fails to do so because of backwards-incompatible API changes.

By virtue of Protobuf API compatibility, rules and Buf's powerful compatibility tooling, the BSR is uniquely positioned to
solve this problem. The BSR receives all of the dependencies requested for a specific module, and can systematically
determine the latest version that is compatible with *all* of the provided versions with Buf's compatibility checker. If
such a version does not exist, the BSR can give an informative error that describes exactly *why* the dependencies could
not be resolved, and the developer can simply adjust their requirements as needed to proceed.

### Reflection Service

The BSR holds all of your Protobuf API definitions so it can very easily act as a reflection server for your
Protobuf messages. This typically involves exposing a set of reflection endpoints on *your* server, but this
is no longer required because the BSR has all of your definitions and it can host this functionality for you.

### Fully qualified Protobuf import paths

Today, Protobuf import paths are relative to user specified include directories. This may be
the single most painful lesson for new users to learn, so we want to get rid of it entirely.
Imagine importing `buf.build/googleapis/googleapis/google/api/http.proto` rather than `google/api/http.proto`.
The BSR will support this transition in a backwards compatible manner, so that you can transition
to using fully qualified import paths if you like in your project.

### BSR API

A large part of the BSR API is usable with the `buf` CLI, but we will soon be exposing the BSR API so that
you can build your own tools and integrations with it.

## `buf` CLI

### Formatter

We'll be releasing `buf format` soon that allows for consistent formatting of your Protobuf files. This formatter will also
allow for unified diffs to be printed, instead of editing your files directly.

### Bazel rules

We will support Bazel as a first-class citizen with official Bazel rules.

## Ecosystem

### Better IDE integration

Buf currently supports both a [vim plugin](https://github.com/bufbuild/vim-buf) and a
[VSCode plugin](https://github.com/bufbuild/vscode-buf) to provide Protobuf linting in these editors.
But we recognize that we can do a lot more in this area, such as formatting your Protobuf files
on save (via the formatter mentioned above), and a fully-fledged *Protobuf language server*, which
involves implementing the [Language Server Protocol (LSP)](https://langserver.org).

With this, you will be able to leverage more editor features, such as auto-completion and
jump-to-definition, to further improve your Protobuf productivity.

### Protobuf standard library

You may already be familiar with Protobuf's [Well-Known Types](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf),
but these largely act as thin wrappers around primitive values to support zeroable values, such
as the [BoolValue](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#boolvalue).

These types are a good start, but we can do so much more with a true standard library of common API
definitions. Developers around the world are reinventing the wheel every time they need to define
their `PostalAddress`, `Currency`, and `URI` messages. Buf will address this by defining a generic set of such
types that can be dropped-in to your application so that you can focus on writing your business logic.

### API versioning

We recognize that backwards-incompatible changes are inevitable. API authors should do everything they can to
prevent breaking changes from happening, but everyone makes mistakes and/or justifies that the tradeoff is
worth it (for whatever reason).

With that said, the team is exploring an API transcoding solution inspired by [Stripe's API versioning](https://stripe.com/blog/api-versioning)
strategy. In short, Stripe has built infrastructure that lets them freely make breaking changes without ever
breaking their clients. An API transformation layer sits between their client and their server that translates
old API structures into their current API structures.

The BSR is perfectly positioned to bring this solution to Protobuf users. The BSR tracks the entire history of
your module, and can theoretically apply a series of changes (specified in a changelog) to your API so that
you can stop worrying about API compatibility entirely.
