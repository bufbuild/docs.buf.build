---
id: overview
title: Overview
---

A key component of maintaining a consistent Protobuf schema is utilizing a linter to enforce a
common set of rules. This is a good practice whether you're building a personal project,
maintaining a large set of Protobuf definitions across a major organization, or anything in-between.
It's especially important for users and organizations that continually onboard new engineers without
a wealth of experience in Protobuf schema design to make sure that APIs remain consistent and follow
patterns that allow easy maintainability, but is useful even if you have years of Protobuf
experience as a forcing function on your API decisions.

`buf` provides lint functionality through `buf lint`, which runs a set of [lint rules](rules.md) across your
entire Protobuf schema. By default, `buf` uses a carefully curated set of lint rules designed to guarantee
consistency and maintainability across a Protobuf schema of any size and any purpose, but without being
so opinionated as to restrict organizations from making the design decisions they need to make for their
individual APIs.

Features of `buf`'s linter include:

- **Selectable configuration** of the exact lint rules you want, including categorization of lint
  rules into logical categories. While we recommend using the `DEFAULT` set of lint rules, `buf`
  allows you to easily understand and select the exact set of rules your organization needs.

- **Editor integration**. The default error output is easily parsable by any editor, making the
  feedback loop for lint errors very short. Currently, we provide
  [Vim and Visual Studio Code integration](../editor-integration.mdx), but may extend this in the
  future to include other editors such as Emacs and IntelliJ IDEs.

- **Speed**. `buf`'s [internal Protobuf compiler](../build/internal-compiler.md) utilizes all
  available cores to compile your Protobuf schema, while still maintaining deterministic output. Additionally files
  are copied into memory before processing. As an unscientific example, `buf` can compile all 2,311 `.proto` files in
  [googleapis](https://github.com/googleapis/googleapis) in about *0.8s* on a four-core machine, as opposed
  to about 4.3s for `protoc` on the same machine. While both are very fast, this allows for instantaneous feedback,
  which is especially useful with Editor integration. `buf`'s speed is directly proportional to the input size, so
  linting a single file only takes a few milliseconds.
