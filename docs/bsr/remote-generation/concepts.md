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

```Dockerfile
LABEL "build.buf.plugins.runtime_library_versions.0.name"="google.golang.org/protobuf"
LABEL "build.buf.plugins.runtime_library_versions.0.version"="v1.27.1"
```

A plugin version must be a valid [semantic version](https://semver.org/spec/v2.0.0.html).

## Template

A **template** is a collection of **plugins** and associated configuration. It is used to identify a set of plugins that should be run together, such as `library/protoc-gen-go` and `library/protoc-gen-go-grpc`, where the output of the latter depends on the output of the former. Its primary utility is in our **remote generation registries**, where it is used to easily identify a collection of plugins, that when put together provide some functionality, such as the Go gRPC capabilities afforded by combining the aforementioned plugins.

They belong to an **owner** and can be public or private. Public templates are available to anyone, while private templates are only available to the owner or members of the owning organization.

Buf maintains several official templates:

- https://buf.build/protocolbuffers/templates/js
- https://buf.build/protocolbuffers/templates/go
- https://buf.build/grpc/templates/web
- https://buf.build/grpc/templates/go

A template **version** defines the plugin versions to use. This allows a template owner to keep their template up to date with new versions of plugins in their template. A template version can only be of the form `v[1-9][0-9]*`. The template version makes up part of the **synthetic version** of a remote generation artifact.

Template management is designed to discourage introducing breaking changes to consumers. This is why plugin parameters are defined on the template itself rather than on a per-version basis.

## Remote Generation Registries

A **remote generation registry** is an artifact registry built specifically for integrating the BSR remote generation capabilities with a language's dependency management system. For example, the BSR Go Module Proxy at `go.buf.build` integrates remote generation with the [Go modules ecosystem](https://golang.org/ref/mod).

Upcoming remote generation registries include the [CommonJS Registry](http://wiki.commonjs.org/wiki/Packages/Registry) and others.

## Synthetic Version

A **synthetic version** combines the **template** version and [module](../overview.md#module) version into a [semantic version](https://semver.org/spec/v2.0.0.html). The major version is always 1, the minor version corresponds to the template version (without the `v` prefix), and the patch version corresponds to the **commit sequence ID**. For example, the synthetic version `v1.2.10` describes the artifact generated using `v2` of the template and using the commit sequence ID `10` of the module.

Synthetic versions are used to version **remote generation registry** artifacts. Because template and module updates are minor and patch version updates respectively, preserving backwards compatibility across either update is essential to maintain the semantic versioning contract. This informs the design of the **template** management.
