---
id: configuration
title: Configuration
---

`buf`'s breaking change detector is configured through a [`buf.yaml`](../configuration/v1/buf-yaml.md) file
that is placed at the root of the Protobuf source files it defines. If `buf breaking` is executed for an [input](../reference/inputs.md)
that contains a `buf.yaml` file, its `breaking` configuration will be used for the given operation.

If a `buf.yaml` file is not contained in the input, `buf` operates as if there is a
`buf.yaml` file with the [default values](#default-values).

The following is an example of all available configuration options. For more information on the `buf.yaml`
configuration, please refer to the [reference](../configuration/v1/buf-yaml.md).

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - FILE
  except:
    - RPC_NO_DELETE
  ignore:
    - bat
    - ban/ban.proto
  ignore_only:
    FIELD_SAME_JSON_NAME:
      - foo/foo.proto
      - bar
    WIRE:
      - foo
  ignore_unstable_packages: true
```

### `use`

The `use` key is **optional**, and lists the IDs or categories to use for breaking change detection.
For example, the following selects the `WIRE` breaking category, as well as the `FILE_NO_DELETE` ID:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - WIRE
    - FILE_NO_DELETE
```

**As opposed to [lint rules](../lint/rules.md), breaking rules are not meant to be overly customized.** Breaking
rules are generally meant to work in unison to detect a category of breaking change, as opposed
to merely being independent rules.

Usually, you will use one of the following values for `use`:

- `[FILE]` which will enforce that generated stubs do not break on a per-file basis.
- `[PACKAGE]` which will enforce that generated stubs do not break on a per-package basis.
- `[WIRE]` which will enforce that wire compatibility is not broken.
- `[WIRE_JSON]` which will enforce that wire and JSON wire compatibility are not broken.

See the [overview](overview.md) for a longer description of the purpose of each category.

The default value is the single item `FILE`, which is what we recommend.

### `except`

The `except` key is **optional**, and removes IDs or categories from the `use` list. **We do not recommend using
this option in general**. For example, the following will result in all breaking rules in the `FILE` breaking
category being used except for `FILE_NO_DELETE`:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - FILE
  except:
    - FILE_NO_DELETE
```

### `ignore`

The `ignore` key is **optional**, and allows directories or files to be excluded from all breaking
rules when running `buf breaking`. The specified directory or file paths **must** be relative to the
`buf.yaml`. For example, the breaking result in `foo/bar.proto` will be ignored with the following:

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

### `ignore_only`

The `ignore_only` key is **optional**, and allows directories or files to be excluded from specific breaking
rules when running `buf breaking` by taking a map from breaking rule ID or category to path. As with `ignore`,
the paths **must** be relative to the `buf.yaml`. **We do not recommend this option in general.**

For example, the following sets us specific ignores for the ID `FILE_SAME_TYPE` and the category `WIRE`:

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

### `ignore_unstable_packages`

The `ignore_unstable_packages` key is **optional**, and ignores packages with a last component that is one of
the unstable forms recognized by [`PACKAGE_VERSION_SUFFIX`](../lint/rules.md#package_version_suffix):

  - `v\d+(alpha|beta)\d*`
  - `v\d+p\d+(alpha|beta)\d*`
  - `v\d+test.*`

For example, if this option is set, the following packages will be ignored:

  - `foo.bar.v1alpha`
  - `foo.bar.v1alpha1`
  - `foo.bar.v1beta1`
  - `foo.bar.v1test`

## Default values

If a `buf.yaml` does not exist, or if the `breaking` key is not configured, the following default
configuration is used:

```yaml title="buf.yaml"
version: v1
breaking:
  use:
    - FILE
```
