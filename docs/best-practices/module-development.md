---
id: module-development
title: Module Development
---

The Buf Schema Registry ([BSR](../bsr/overview.md)) automatically enforces that your
[module](../bsr/overview.md#module) compiles when it is pushed, but there are other best practices
that can't be enforced that you should consider when you are developing your modules. We'll go
over what these best practices are, and why they're important to keep in mind.

## Module Layout

The module is a versioned unit of Protobuf files, but it's best to *also* incorporate
a certain level of versioning in its directory and package structure.

Suppose that you are implementing the `buf.build/acme/pkg` module, which only contains a single `.proto`
file initially. Rather than placing this file at the root of the module (adjacent to the
[`buf.yaml`](../configuration/v1/buf-yaml.md) and [`buf.lock`](../configuration/v1/buf-lock.md)
files), this file should still be nested within a directory and defined with a package that attempts to make
it unique across other module dependencies.

<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```
proto/
├── buf.lock
├── buf.yaml
└── pkg.proto
```

</td><td>

```
proto/
├── acme
│   └── pkg
│       └── v1
│           └── pkg.proto
├── buf.lock
└── buf.yaml
```

</td></tr>
</tbody></table>

For those that don't adopt this best practice, those APIs are more prone to *collide* with
other user API definitions. For example, if a consumer needs to import Protobuf definitions
from two modules, both of which define an `api.proto`, then the result module will not
compile. In other words, it's impossible for the compiler to distinguish between what
`api.proto` you are referring to if there are multiple.

> The module layout described here is included in the [`MINIMAL`](../lint/rules.md#minimal) lint
> category.

## Maintain Backwards Compatibility

Do **not** push backwards-incompatible changes to your module.

There are clearly exceptions to this rule for packages in-development (such as `alpha` and `beta`),
but module authors should do everything they can to maintain compatibility in their module.

If, for example, the [Diamond Dependency Problem](https://en.wikipedia.org/wiki/Dependency_hell)
manifests itself, then some users will not be able to compile their module.

> In the future, we plan to enable a configurable (opt-in), module compatibility
> guarantee so that it's *impossible* to push backwards-incompatible changes to your
> module. With this, consumers can freely update to the latest version on any module
> and *never* break their builds. For more, check out the [roadmap](../roadmap.md).

## Package versions

If you absolutely must roll out a breaking change to your API, there are ways you can safely do
so without breaking compatibility with your earlier module versions.

In the [Module Layout](#module-layout) example above, you'll notice the use of
a versioned filepath (it contains a `v1` element). In this case, the filepath reflects
a versioned package that should be used in the Protobuf files in that directory
(`acme.pkg.v1`).

This has two key benefits:

* The Protobuf files you define will not collide with other modules so that they can always be
  compiled together.
* The version element in the filepath makes it easy to roll out incompatible versions in the
  same module because they are consumed from different filepaths.

Suppose that you have a module similar to the one described in [Module Layout](#module-layout),
and you need to make a breaking change to the `acme/pkg/v1/pkg.proto` definitions. Rather
than committing a breaking change to the same file, you can create a new file in a separately
versioned filepath, such as `acme/pkg/v2/pkg.proto`.

This looks like the following:

```
proto/
├── acme
│   └── pkg
│       ├── v1
│       │   └── pkg.proto
│       └── v2
│           └── pkg.proto
├── buf.lock
└── buf.yaml
```

In this case, `acme/pkg/v2/pkg.proto` is incompatible with `acme/pkg/v1/pkg.proto` (the `Object.id` field
was changed):

```protobuf title="acme/pkg/v1/pkg.proto"
syntax = "proto3";

package acme.pkg.v1;

// Object is a generic object that uses
// an int32 for its identifier.
message Object {
    int32 id = 1;
}
```

```protobuf title="acme/pkg/v2/pkg.proto"
syntax = "proto3";

package acme.pkg.v2;

// Object is a generic object that uses
// a string for its identifier.
message Object {
    string id = 1;
}
```

Fortunately, with this structure, the module author can safely push their latest changes to the module
and all of their consumers can continue to compile their modules.

> The package version recommendation described here is described by the [`PACKAGE_VERSION_SUFFIX`](../lint/rules.md#package_version_suffix)
> lint rule.
