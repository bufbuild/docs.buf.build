---
id: buf-yaml
title: buf.yaml
---

The `buf.yaml` file defines a [module](../../bsr/overview.md#modules), and is placed at the root of the Protobuf source files
it defines. The placement of the `buf.yaml` configuration tells `buf` where to search for `.proto` files,
and how to handle imports.

This file contains [lint](../../lint/rules.md) and [breaking change detection](../../breaking/rules.md) rules, and if applicable, the name of your module and a list of dependencies.

## Default values

The `buf.yaml`config file below demonstrates all default values being explicitly set, this file is
the equivalent of no options being set in your `buf.yaml` at all.

```yaml title="buf.yaml"
version: v1
name: ""
deps: []
build:
  excludes: []
lint:
  use:
    - DEFAULT
  enum_zero_value_suffix: _UNSPECIFIED
  rpc_allow_same_request_response: false
  rpc_allow_google_protobuf_empty_requests: false
  rpc_allow_google_protobuf_empty_responses: false
  service_suffix: Service
breaking:
  use:
    - FILE
```

## Fields

### `version`

The `version` key is **required**, and defines the current configuration version. The only accepted
values are `v1beta1` and `v1`.

### `name`

The `name` is **optional**, and uniquely identifies your module. The `name` **must** be a valid [module name](../../bsr/overview.md#modules)
and is directly associated with the repository that owns it.

### `deps`

The `deps` key is **optional**, and declares one or more modules that your module depends on. Each `deps`
entry **must** be a module reference, and, is directly associated with a repository, as well as a
[reference](../../bsr/overview.md#referencing-a-module), which is either a tag or commit. A complete example
of the different `deps` format is shown below:

```yaml title="buf.yaml"
version: v1
name: buf.build/acme/petapis
deps:
  - buf.build/acme/paymentapis                           # The latest commit.
  - buf.build/acme/pkg:47b927cbb41c4fdea1292bafadb8976f  # The '47b927cbb41c4fdea1292bafadb8976f' commit.
  - buf.build/googleapis/googleapis:v1beta1.1.0          # The 'v1beta1.1.0' tag.
```

> Depending on specific references is an advanced feature; you should depend on the latest commit whenever
> possible. In other words, your `deps` don't need to include the `:<reference>` suffix in most cases.
> Please refer to `buf`'s [best practices](../../best-practices/module-development.md) to learn more!

### `build`

The `build` key is **optional**, and is used to control how `buf` builds modules. The `build` section only
has one option:

#### `excludes`

The `excludes` key is **optional**, and lists directories to ignore from `.proto` file discovery. Any directories
added to this list are completely skipped and excluded in the module. **We do not recommend using this
option in general**, however in some situations it is unavoidable.

### `lint`

The `lint` key is **optional**, and specifies the [lint rules](/lint/rules.md) enforced on the files
in the module.

#### `use`

The `use` key is **optional**, and lists the IDs or categories to use for linting. For example,
this config selects the `BASIC` lint category as well as the `FILE_LOWER_SNAKE_CASE` ID:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - BASIC
    - FILE_LOWER_SNAKE_CASE
```

The default `use` value is the single item, `DEFAULT`.

#### `except`

The `except` key is **optional**, and removes IDs or categories from the `use` list. For example,
this config results in all lint rules in the `DEFAULT` lint category being used except for
`ENUM_NO_ALLOW_ALIAS` and all lint rules in the `BASIC` category:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
  except:
    - ENUM_NO_ALLOW_ALIAS
    - BASIC
```

Note that since `DEFAULT` is the default value for `use`, this is equivalent to the above:

```yaml title="buf.yaml"
version: v1
lint:
  except:
    - ENUM_NO_ALLOW_ALIAS
    - BASIC
```

#### `ignore`

The `ignore` key is **optional**, and allows directories or files to be excluded from all lint
rules when running `buf lint`. The specified directory or file paths **must** be relative to the
`buf.yaml`. For example, the lint result in `foo/bar.proto` is ignored with this config:

```yaml title="buf.yaml"
version: v1
lint:
  ignore:
    - foo/bar.proto
```

#### `ignore_only`

The `ignore_only` key is **optional**, and allows directories or files to be excluded from specific
lint rules when running `buf lint` by taking a map from lint rule ID or category to path. As with
`ignore`, the paths **must** be relative to the `buf.yaml`.

For example, this config sets up specific ignores for the ID `ENUM_PASCAL_CASE` and
the category `BASIC`:

```yaml title="buf.yaml"
version: v1
lint:
  ignore_only:
    ENUM_PASCAL_CASE:
      - foo/foo.proto
      - bar
    BASIC:
      - foo
```

#### `allow_comment_ignores`

The `allow_comment_ignores` key is **optional**, and turns on comment-driven ignores. **We do not recommend
using this option in general**, however in some situations it is unavoidable.

```yaml title="buf.yaml"
version: v1
lint:
  allow_comment_ignores: true
```

If this option is set, leading comments can be added within Protobuf files to ignore lint errors
for certain components. If any line in a leading comment starts with `buf:lint:ignore ID`, then `buf`
ignores lint errors for this ID. For example:

```proto
syntax = "proto3";

// buf:lint:ignore PACKAGE_LOWER_SNAKE_CASE
// buf:lint:ignore PACKAGE_VERSION_SUFFIX
package A;
```

#### `enum_zero_value_suffix`

The `enum_zero_value_suffix` key is **optional**, and controls the behavior of the
`ENUM_ZERO_VALUE_SUFFIX` lint rule. By default, this rule verifies that the zero value of all
enums ends in `_UNSPECIFIED`, as recommended by the [Google Protobuf Style Guide](https://developers.google.com/protocol-buffers/docs/style#enums).
But organizations may have a different preferred suffix, for example `_NONE`. To set that:

```yaml title="buf.yaml"
version: v1
lint:
  enum_zero_value_suffix: _NONE
```

That config allows this:

```protobuf
enum Foo {
  FOO_NONE = 0;
}
```

#### `rpc_allow_same_request_response`

The `rpc_allow_same_request_response` key is **optional**, and allows the same message type to be
used for a single RPC's request and response type. **We do not recommend using this option in general**.

#### `rpc_allow_google_protobuf_empty_requests`

The `rpc_allow_google_protobuf_empty_requests` key is **optional**, and allows RPC requests to be
[google.protobuf.Empty](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/empty.proto)
messages. This can be set if you want to allow messages to be void forever, that is, to
never take any parameters. **We do not recommend using this option in general**.

#### `rpc_allow_google_protobuf_empty_responses`

The `rpc_allow_google_protobuf_empty_responses` key is **optional**, and allows RPC responses to be
[google.protobuf.Empty](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/empty.proto)
messages. This can be set if you want to allow messages to never return any parameters. **We do not
recommend using this option in general**.

#### `service_suffix`

The `service_suffix` key is **optional**, and controls the behavior of the `SERVICE_SUFFIX` lint rule.
By default, this rule verifies that all service names are suffixed with `Service`. But organizations
may have a different preferred suffix, for example `API`. To set that:

```yaml title="buf.yaml"
version: v1
lint:
  service_suffix: API
```

That config allows this:

```protobuf
service FooAPI {}
```

### `breaking`

The `breaking` key is **optional**, and specifies the breaking change detection rules enforced on the files
contained within the module.

#### `use`

The `use` key is **optional**, and lists the IDs or categories to use for breaking change detection.
For example, this config selects the `WIRE` breaking category, as well as the `FILE_NO_DELETE` ID:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - WIRE
    - FILE_NO_DELETE
```

The default value is the single item `FILE`, which is what we recommend.

#### `except`

The `except` key is **optional**, and removes IDs or categories from the `use` list. **We do not recommend using
this option in general**. For example, this config results in all breaking rules in the `FILE` breaking
category being used except for `FILE_NO_DELETE`:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - FILE
  except:
    - FILE_NO_DELETE
```

#### `ignore`

The `ignore` key is **optional**, and allows directories or files to be excluded from all breaking
rules when running `buf breaking`. The specified directory or file paths **must** be relative to the
`buf.yaml`. For example, the breaking result in `foo/bar.proto` is ignored with this config:

```yaml title="buf.yaml"
version: v1
breaking:
  ignore:
    - foo/bar.proto
```

This option can be useful for ignoring packages that are in active development but not deployed in production,
especially alpha or beta packages, and we expect `ignore` to be commonly used for this case. For example:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - FILE
  ignore:
    - foo/bar/v1beta1
    - foo/bar/v1beta2
    - foo/baz/v1alpha1
```

#### `ignore_only`

The `ignore_only` key is **optional**, and allows directories or files to be excluded from specific breaking
rules when running `buf breaking` by taking a map from breaking rule ID or category to path. As with `ignore`,
the paths **must** be relative to the `buf.yaml`. **We do not recommend this option in general.**

For example, this config sets us specific ignores for the ID `FILE_SAME_TYPE` and the category `WIRE`:

```yaml title="buf.yaml"
version: v1
breaking:
  ignore_only:
    FILE_SAME_TYPE:
      - foo/foo.proto
      - bar
    WIRE:
      - foo
```

#### `ignore_unstable_packages`

The `ignore_unstable_packages` key is **optional**, and ignores packages with a last component that is one of
the unstable forms recognized by [`PACKAGE_VERSION_SUFFIX`](../../lint/rules.md#package_version_suffix):

  - `v\d+test.*`
  - `v\d+(alpha|beta)\d+`
  - `v\d+p\d+(alpha|beta)\d+`

For example, if this option is set, these packages are ignored:

  - `foo.bar.v1alpha1`
  - `foo.bar.v1beta1`
  - `foo.bar.v1test`

## Reference

If you prefer, you can create a new `buf.yaml` with the reference material described here commented in-line
with the `buf mod init --doc` command. Give it a try!
