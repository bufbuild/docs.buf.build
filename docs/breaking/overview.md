---
id: overview
title: Overview
---

One of the core promises of Protobuf is forwards and backwards compatibility. But making
sure that your Protobuf schema doesn't introduce breaking changes isn't automatic - there are
rules you need to follow to ensure that your schema remains compatible for its lifetime.

`buf` provides a breaking change detector through `buf breaking`, which runs a set of
[breaking rules](rules.md) across the current version of your entire Protobuf schema in comparison
to a past version of your Protobuf schema. The rules are selectable, and split up into logical
categories depending on the nature of breaking changes you care about:

  - `FILE`: Generated source code breaking changes on a per-file basis, that is changes that
    would break the generated stubs where definitions cannot be moved across files. This makes
    sure that for languages such as C++ and Python where header files are included, your source
    code never breaks for a given Protobuf change. This category also verifies wire and JSON
    compatibility.
  - `PACKAGE`: Generated source code breaking changes on a per-package basis, that is changes that
    would break the generated stubs, but only accounting for package-level changes. This is useful
    for languages such as Java (with `option java_multiple_files = true;` set) or Golang where it
    is fine to move Protobuf types across files, as long as they stay within the same Protobuf package.
    This category also verifies wire and JSON compatibility.
  - `WIRE`: Wire breaking changes, that is changes that would break wire compatibility, including
    checks to make sure you reserve deleted types of which re-use in the future could cause
    wire incompatibilities.
  - `WIRE_JSON`: Wire breaking changes and JSON breaking changes, that is changes that would break
    either wire compatibility or JSON compatibility. This mostly extends `WIRE` to include field and
    enum value names.

Other features of `buf`'s breaking change detector include:

- **Selectable configuration** of the exact breaking rules you want, including categorization of breaking
  rules into logical categories. While we recommend using the `FILE` set of breaking rules, `buf` enables 
  you to select the exact set of rules your organization needs.

- **File references**. `buf`'s breaking change detector produces file references to the
  location of the breaking change, including if a reference moves across files between your
  past and current file versions. For example, if a field changes type, `buf` produces
  a reference to the field. If a field is deleted, `buf` produces a reference to the location
  of the message in the current file.

- **Speed**. `buf`'s [internal Protobuf compiler](../build/internal-compiler.md) utilizes all
  available cores to compile your Protobuf schema, while still maintaining deterministic output. Additionally files
  are copied into memory before processing. As an unscientific example, `buf` can compile all 2,311 `.proto` files in
  [googleapis](https://github.com/googleapis/googleapis) in about *0.8s* on a four-core machine, as opposed
  to about 4.3s for `protoc` on the same machine. While both are very fast, this provides instantaneous feedback,
  which is especially useful with Editor integration. `buf`'s speed is directly proportional to the input size, so
  linting a single file only takes a few milliseconds.
