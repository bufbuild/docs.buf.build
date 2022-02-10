---
id: concepts
title: Key Concepts
---

> Remote code generation is an **experimental feature**. We started with Go and have plans to add support for other languages. [Let us know what language we should tackle next](../../contact.md).

## Plugin

A **plugin** is used by the BSR remote generation to generate assets given Protobuf definitions. They are based on the established concept of Protobuf plugins in local generation, such as [`protoc-gen-go`](https://pkg.go.dev/google.golang.org/protobuf@v1.27.1/cmd/protoc-gen-go).

They belong to an **owner** and may be public or private. Public plugins are available to anyone, while private plugins are only available to the owner or members of the owning organization. Plugins are often referenced together with their owners name, for example, `library/plugins/protoc-gen-go` (or in some contexts just `library/protoc-gen-go`), is used to reference the `protoc-gen-go` plugin maintained by Buf.

A plugin has instantiations at different **versions**. These versions often map directly to the versions of the existing plugin executables. For example, the `library/protoc-gen-go` plugin has a version `v1.27.1-1` matching the [`v1.27.1` release](https://github.com/protocolbuffers/protobuf-go/releases/tag/v1.27.1) of the official Go Protobuf plugin.

Plugin version executables are managed as Docker images. The Docker image is expected to accept a [CodeGeneratorRequest](https://github.com/protocolbuffers/protobuf/blob/bd42fcc7a3e04504df895ce2fd0782c0e84b68a5/src/google/protobuf/compiler/plugin.proto#L68) in Protobuf binary format on standard in, and respond with a [CodeGeneratorResponse](https://github.com/protocolbuffers/protobuf/blob/bd42fcc7a3e04504df895ce2fd0782c0e84b68a5/src/google/protobuf/compiler/plugin.proto#L99) in Protobuf binary format on standard out when run. This matches exactly the contract used with existing Protobuf plugins in the ecosystem today, making migration of existing plugins to BSR hosted plugins easy.

A plugin version is created by pushing a tagged Docker image to the plugins Docker registry repository. For example, assuming the relevant `Dockerfile` and context was in the current directory, to push a new version `v1.1.0` of the plugin `protoc-gen-myplugin` owned by the user `myuser`, the user would run

```terminal
$ docker build -t plugins.buf.build/myuser/protoc-gen-myplugin:v1.1.0 .
```

followed by

```terminal
$ docker push plugins.buf.build/myuser/protoc-gen-myplugin:v1.1.0
```

Pushing plugins to the BSR requires authenticating your Docker CLI using a **token**:

```terminal
$ docker login -u myuser --password-stdin plugins.buf.build
```

A plugin version can describe runtime library dependencies of its generated assets using [Docker labels](https://docs.docker.com/config/labels-custom-metadata/). All labels are prefixed with `build.buf.plugins.runtime_library_versions.` followed by the index of the dependency, followed by the attribute being specified. For example, version `v1.27.1-1` of the `library/protoc-gen-go` plugin declares its runtime dependency on the Go module `google.golang.org/protobuf` using these labels in its `Dockerfile`:

```docker
LABEL "build.buf.plugins.runtime_library_versions.0.name"="google.golang.org/protobuf"
LABEL "build.buf.plugins.runtime_library_versions.0.version"="v1.27.1"
```

You need to give plugins a valid [semantic version](https://semver.org/spec/v2.0.0.html).

## Template

A **template** is a collection of **plugins** and associated configuration. It is used to identify a set of plugins that should be run together, such as `library/protoc-gen-go` and `library/protoc-gen-go-grpc`, where the output of the latter depends on the output of the former. Its primary utility is in our **remote generation registries**, where it is used to easily identify a collection of plugins, that when put together provide some functionality, such as the Go gRPC capabilities afforded by combining the aforementioned plugins.

They belong to an **owner** and can be public or private. Public templates are available to anyone, while private templates are only available to the owner or members of the owning organization.

Buf maintains several official templates:

- https://buf.build/protocolbuffers/templates/js
- https://buf.build/protocolbuffers/templates/go
- https://buf.build/grpc/templates/web
- https://buf.build/grpc/templates/go

A template **version** defines the plugin versions to use. This enables a template owner to keep their template up to date with new versions of plugins in their template. A template version can only be of the form `v[1-9][0-9]*`. The template version makes up part of the **synthetic version** of a remote generation artifact.

Template management is designed to discourage introducing breaking changes to consumers. This is why plugin parameters are defined on the template itself rather than on a per-version basis.

## Remote Generation Registries

A **remote generation registry** is an artifact registry built specifically for integrating the BSR remote generation capabilities with a language's dependency management system. For example, the BSR Go Module Proxy at `go.buf.build` integrates remote generation with the [Go modules ecosystem](https://golang.org/ref/mod).

Upcoming remote generation registries include the [CommonJS Registry](http://wiki.commonjs.org/wiki/Packages/Registry) and others.

## Synthetic version

A **synthetic version** combines the [template](#template) and [module](../overview.md#module) versions into a [semantic version](https://semver.org/spec/v2.0.0.html) of this form:

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Synthetic version syntax"
  examples={["v1.3.5"]}
  segments={[
    {label: "v1", kind: "static"},
    {separator: "."},
    {label: "template version", kind: "variable"},
    {separator: "."},
    {label: "commit sequence ID", kind: "variable"},
  ]
} />

Within this scheme:

* There's always a **v** prefix.
* The major version is always **1**.
* The minor version (**3** in the example) corresponds to the [template](#template) version (without the `v` prefix). Template versions increase monotonically and have the form `v1`, `v2`, `v3`...
* The patch version (**5** in the example) corresponds to the module, which is identified by a [commit sequence ID](#commits) that's incremented each time a new version of a module is pushed.

The synthetic version `v1.2.10`, for example, means that the artifact was generated using `v2` of
the template and using the commit sequence ID `10` for the module.

### Where synthetic versions are used

The BSR applies synthetic versions to all remote-generated code artifacts in the **remote generation
registry**. That currently includes [Go packages](../../tour/use-remote-generation.md) but will be
expanded to other languages.

### Enforcing semantic versioning

Although we describe synthetic versions as [semantic versions](https://semver.org/spec/v2.0.0.html),
the BSR doesn't _enforce_ semantic versioning. If you make breaking changes to an asset and push
that asset to the BSR, the patch version is incremented in spite of the breaking change, which
violates semantic versioning.

In order to preserve semver guarantees in your own generated assets, we recommend performing
[breaking change detection](../../breaking/usage.md) _before_ pushing a new version of a Buf module,
potentially as part of your [CI/CD pipeline](../../ci-cd/setup.md#checks).

### Commits

Every time you push a Buf module to the BSR, a new **commit** is created. Each commit has two pieces
of information attached to it:

* A **commit name**. This is a randomly generated, fixed-size [hexadecimal] string that's visible in
  the BSR's UI. Note that commit IDs are _not_ hashes of the commit's content.
* A **commit sequence ID**. This is a monotonically increasing integer that begins at 1 and is
  incremented with each new module push. Commit sequence IDs are _not_ visible in the BSR UI.

### How we implemented synthetic versions

The challenge with versioning remote-generated code is that unlike versioning schemes that only deal
with one artifact, such as a Python library, BSR versions are the product of two logical inputs:

* The template version
* The Protobuf module

When implementing our versioning scheme, we surveyed some popular language registries and found that
the most common scheme was semantic versioning but _without_ [pre-release and
build](https://www.baeldung.com/cs/semantic-versioning#4-pre-release-and-build) labels. In other
words, we found that versions like `v1.2.3` were common whereas `v1.2.3-alpha.1` were not, and we
opted for the former.

[hexadecimal]: https://en.wikipedia.org/wiki/Hexadecimal
