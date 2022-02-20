---
id: v1beta1-migration-guide
title: Migration guide (v1beta1 to v1)
---

Several changes were made between `v1beta1` and `v1`, but migrating between
them should be straightforward. This guide walks you through exactly what changed and what you need to
update when upgrading from `v1beta1` to `v1`.

## Automatic migration

The `buf beta migrate-v1beta1` command automatically migrates all of your `buf` configuration
files from `v1beta1` to `v1`.

For example, consider this `buf.yaml` with multiple roots:

```yaml title="buf.yaml"
version: v1beta1
build:
  roots:
    - proto
    - vendor/googleapis
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

```sh
.
├── buf.gen.yaml
├── buf.lock
├── buf.yaml
├── proto
│   └── acme
│       └── pet
│           └── v1
│               └── pet.proto
└── vendor
    └── googleapis
        └── google
            └── type
                └── datetime.proto
```

You can automatically migrate all of the files from `v1beta1` to `v1` by simply running
`buf beta migrate-v1beta1` in a directory containing a `buf.yaml`, `buf.lock`, or `buf.gen.yaml`:

```sh
$ buf beta migrate-v1beta1
Successfully migrated your buf.yaml, buf.gen.yaml, and buf.lock to v1.
```

You'll notice that the filenames are equivalent, but the files have been rearranged and a new
[`buf.work.yaml`](v1/buf-work-yaml.md) was created:

```sh
.
├── buf.gen.yaml
├── buf.work.yaml
├── proto
│   ├── acme
│   │   └── pet
│   │       └── v1
│   │           └── pet.proto
│   ├── buf.lock
│   └── buf.yaml
└── vendor
    └── googleapis
        ├── buf.lock
        ├── buf.yaml
        └── google
            └── type
                └── datetime.proto
```

The sections below explain what changed between `v1beta1` and `v1` in more detail.

## `buf.yaml`

The `buf.yaml` configuration file is largely unchanged, but a few significant changes were made to
build roots, as well as lint and breaking rules.

### `build.roots`

The only structural change made to the `buf.yaml` file for `v1` was the removal of `build.roots`. Previously,
users could configure multiple roots for a single `buf.yaml`, such as this:

```yaml title="buf.yaml"
version: v1beta1
build:
  roots:
    - proto
    - vendor/googleapis
```

Now that [workspaces](../reference/workspaces.md) are available, each of the roots can be defined as an independently configured
[module](../bsr/overview.md#modules) that can be imported by others. In the example above, the `proto` and `vendor/googleapis`
roots can be defined as separate modules, as in these configurations:

```yaml title=proto/buf.yaml
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

```yaml title="vendor/googleapis/buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

The workspace is defined with a [`buf.work.yaml`](v1/buf-work-yaml.md), and makes it possible for users to consolidate multiple modules
into a single buildable unit (just like `build.roots` used to do). In the example above, you can define a `buf.work.yaml` at the root
of your VCS repository with this:

```yaml title="buf.work.yaml"
version: v1
directories:
  - proto
  - vendor/googleapis
```

With a workspace, operations like `buf build`, `buf lint`, and `buf breaking` can target the directory
containing the `buf.work.yaml` file to have the same experience before they split their single `buf.yaml`
into multiple `buf.yaml` files. For example, running `buf lint` on a directory [input](../reference/inputs.md)
containing a `buf.work.yaml` lints *all* of the modules listed in the `buf.work.yaml`.

### `MINIMAL` lint category {#minimal}

The rules contained in the `MINIMAL` lint category have been slightly adjusted between `v1beta1` and
`v1`. The difference between them is shown below:

  * Removed
    * `ENUM_NO_ALLOW_ALIAS`
    * `FIELD_NO_DESCRIPTOR`
    * `IMPORT_NO_PUBLIC`
    * `IMPORT_NO_WEAK`
    * `PACKAGE_SAME_CSHARP_NAMESPACE`
    * `PACKAGE_SAME_GO_PACKAGE`
    * `PACKAGE_SAME_JAVA_MULTIPLE_FILES`
    * `PACKAGE_SAME_JAVA_PACKAGE`
    * `PACKAGE_SAME_PHP_NAMESPACE`
    * `PACKAGE_SAME_RUBY_PACKAGE`
    * `PACKAGE_SAME_SWIFT_PREFIX`

With these changes applied, the final result of `MINIMAL` is shown below:

  * `DIRECTORY_SAME_PACKAGE`
  * `PACKAGE_DEFINED`
  * `PACKAGE_DIRECTORY_MATCH`
  * `PACKAGE_SAME_DIRECTORY`

### Lint category consolidation

Several lint categories from `v1beta1` were consolidated into a smaller, more focused set. In `v1`, the only
top-level categories are `MINIMAL`, `BASIC`, and `DEFAULT`. The changes are described below:

 - `FILE_LAYOUT` merged into `MINIMAL`.
 - `PACKAGE_AFFINITY` merged into `BASIC`.
 - `SENSIBLE` merged into `BASIC`.
 - `STYLE_BASIC` merged into `BASIC`.
 - `STYLE_DEFAULT` merged into `DEFAULT`.

### FILE_SAME_PACKAGE breaking rule

The `FILE_SAME_PACKAGE` breaking rule now belongs to the `FILE`, `PACKAGE`, `WIRE_JSON`, and `WIRE` categories.
Previously, the `FILE_SAME_PACKAGE` rule only belonged to the `FILE` category, but this rule actually protects
against `WIRE`-level compatibility because the method path can change (as often happens with gRPC,
for example).

### FILE_SAME_TYPE breaking rule

The `FILE_SAME_TYPE` breaking rule now belongs to the `FILE`, `PACKAGE` categories. Previously, the `FILE_SAME_TYPE`
rule also belonged to the `WIRE` and `WIRE_JSON` categories, but this rule was split into `FILE_WIRE_SAME_TYPE` and
`FILE_WIRE_JSON_SAME_TYPE` to account for these levels, respectively.

### Relative filepaths

If your `buf.yaml` configuration file has multiple `build.roots` and includes `build.excludes`, `lint.ignore[_only]`, or
`breaking.ignore[_only]` values, the relative filepaths should only be copied to the new `buf.yaml` file that defines those
files. For example, suppose that the original `buf.yaml` file was defined like this:

```yaml title="buf.yaml"
version: v1beta1
build:
  roots:
    - proto
    - vendor/googleapis
  excludes:
    - acme/pet/v1/private.proto
lint:
  ignore:
    - google/type/datetime.proto
  ignore_only:
    ENUM_PASCAL_CASE:
      - google/type/money.proto
breaking:
  ignore:
    - acme/pet/v1/incompatible.proto
  ignore_only:
    FIELD_SAME_JSON_NAME:
      - acme/pet/v1/store.proto
```

The `acme/pet/v1/{incompatible,private,store}.proto` files are defined in the `proto` root and the `google/type/{datetime,money}.proto`
files are defined in the `vendor/googleapis` root. When we migrate this configuration to multiple `buf.yaml` files, the `build.excludes`,
`lint.ignore{_only}` and `breaking.ignore{_only}` paths should only be migrated to the relevant `buf.yaml` files,
as in these configurations:

```yaml title="proto/buf.yaml"
version: v1
build:
  excludes:
    - acme/pet/v1/private.proto
breaking:
  ignore:
    - acme/pet/v1/incompatible.proto
  ignore_only:
    FIELD_SAME_JSON_NAME:
      - acme/pet/v1/store.proto
```

```yaml title="vendor/googleapis/buf.yaml"
version: v1
lint:
  ignore:
    - google/type/datetime.proto
  ignore_only:
    ENUM_PASCAL_CASE:
      - google/type/money.proto
```

You'll notice that the filepath doesn't need to be updated because it's already relative to the module root. This transformation
is automatically handled by the `buf beta migrate-v1beta1` command, so you don't need to worry about these nuanced details.

## `buf.gen.yaml`

The `buf.gen.yaml` configuration file is largely unchanged, but a few changes exist for configuring [Managed Mode](../generate/managed-mode.md).

### Managed Mode

Previously, users could enable **Managed Mode** and configure specific file options in their `buf.gen.yaml`,
as in this example config:

```yaml title="buf.gen.yaml"
version: v1beta1
managed: true
options:
  optimize_for: CODE_SIZE
```

The `buf.gen.yaml` configuration updates this so that **Managed Mode** and its corresponding file option overrides are encapsulated
under the `managed` key.

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
  optimize_for: CODE_SIZE
```

Note that `managed.enabled` **must** be set to `true` if any other `managed` overrides are set.
