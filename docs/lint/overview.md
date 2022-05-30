---
id: overview
title: Overview
---

Using a [linter][lint] on your Protobuf sources enables you to enforce consistency and keep your
API definitions in line with your chosen best practices. We recommend enforcing lint
[rules](./rules.md) whether you're working on a small personal project or maintaining a large set of
Protobuf definitions across a major organization, but it's especially important for users and
organizations that continually onboard new engineers who aren't yet experienced with Protobuf schema
design.

The [`buf` CLI][cli] provides linting functionality through the [`buf lint`](./usage.md) command.
When you run `buf lint`, `buf` runs a set of [lint rules](./rules.md) across all of the Protobuf
files covered by a [`buf.yaml`](../configuration/v1/buf-gen-yaml.md) configuration file. By default,
the `buf` CLI uses a curated set of lint rules designed to guarantee consistency and maintainability
across Protobuf schemas of any size and purpose&mdash;but without being so opinionated that it
restricts you from making the design decisions you need to make for your individual APIs.

Some features of the `buf` CLI's linter:

- **[Selectable configuration](./configuration.md)** of the exact lint rules you want, including
  categorization of lint rules into categories. While we recommend using the
  [`DEFAULT`](./rules.md#default) set of lint rules, you're free to go your own way.

- **Editor integration**. The default error output is easily parsed by most editors, which allows
  for a tight feedback loop for lint errors. Currently, we provide
  [Vim and Visual Studio Code integration](../editor-integration.md) but we may support other
  editors in the future, such as Emacs and IntelliJ IDEs.

- **Speed**. `buf`'s [internal Protobuf compiler](../reference/internal-compiler.md) uses all
  available cores to compile your Protobuf schemas while maintaining deterministic output.
  Additionally, it copies files into memory _before_ processing. As an unscientific example, `buf`
  can compile all 2,311 `.proto` files in [`googleapis`][googleapis] in about 0.8 seconds on a
  four-core machine, while it takes [protoc] 4.3 seconds to do so on the same machine. While both
  are fast, the `buf` CLI provides near-instantaneuous feedback, which is especially useful for
  editor integration. `buf`'s speed is directly proportional to the input size, so linting a single
  file only takes a few milliseconds.

[cli]: ../installation.md
[googleapis]: https://github.com/googleapis/googleapis
[lint]: https://en.wikipedia.org/wiki/Lint_(software)
[protoc]: https://github.com/protocolbuffers/protobuf
