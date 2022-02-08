---
id: buf-gen-yaml
title: buf.gen.yaml
---

The `buf.gen.yaml` file defines a local generation template, and is used by the `buf generate` command
to generate code for the language(s) of your choice. This file is often used with a [module](../../bsr/overview.md#module)
(or another [input](../../reference/inputs.md)), and is typically placed next to your [`buf.work.yaml`](buf-work-yaml.md) file like so:

```sh
.
├── buf.gen.yaml
├── buf.work.yaml
├── acme
│   └── pet
│       └── v1
│           └── pet.proto
├── buf.lock
└── buf.yaml
```

An example of the `buf.gen.yaml` file used to generate Go/gRPC stubs is shown below:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: go
    out: gen/proto/go
    opt: paths=source_relative
  - remote: buf.build/grpc/plugins/go:v1.2.0-1
    out: gen/proto/go
    opt:
      - paths=source_relative
      - require_unimplemented_servers=false
```

### `version`

The `version` key is **required**, and defines the current configuration version. The only accepted
values are `v1beta1` and `v1`.

### `plugins`

Each entry in the `buf.gen.yaml` `plugins` key is a `protoc` plugin configuration, which is a
program that generates code by interacting with the compiled representation of your module.

#### `name` or `remote`

One of `name` or `remote` for a plugin is **required**.

In the case of `<name>`, it is equal to the value in `protoc-gen-<name>`, which is the traditional naming
convention for `protoc` plugins. To be clear, all `protoc` plugins begin with the `protoc-gen-` prefix.
For example, in the `buf.gen.yaml` example shown above, the `protoc-gen-go` plugins is configured.

By default, a `protoc-gen-<name>` program is expected to be on your `PATH` so that it can be discovered and
executed by `buf`. This can be overridden with the [path](#path) option shown below.

In the case of `<remote>`, this enables you to run `buf generate` with a remote plugin, using the fully-qualified
path to the remote plugin defined via the BSR, `<remote>/<owner>/plugins/<plugin-name>:<plugin-version>`. In the `buf.gen.yaml`
example shown above, the `go` plugin managed by `buf.build/grpc` is being used as a part of the generation,
and does not require a local installation of the `go` plugin. If no version is specified, the generation defaults
to using the latest version available for the requested remote plugin.

#### `out`

The `out` of a plugin is **required**, and controls where the generated files are deposited for a given plugin.
Although absolute paths are supported, this configuration is traditionally a relative output directory that
depends on where `buf generate` is run. For example, running `buf generate` from the root of the `tree`
shown above would result in a new `gen/proto/go` directory within the same root:

```sh
$ buf generate
$ tree
.
├── acme
│   └── pet
│       └── v1
│           └── pet.proto
├── gen
│   └── go
│       └── ...
├── buf.gen.yaml
├── buf.lock
└── buf.yaml
```

#### `opt`

The `opt` of a plugin is **optional**, and specifies one or more `protoc` plugin options for each plugin
independently. In the `buf.gen.yaml` example above, this is relevant for both `protoc-gen-go` and `protoc-gen-go-grpc`.
As you can see, you can provide options as either a single string or a list of strings.

#### `path`

The `path` of a plugin is **optional**, and overrides the default location and explicitly specify where to
locate the `protoc` plugin. For example, if another custom plugin called `protoc-gen-foo` is not located
on your `PATH`, but is found at `bin/proto/protoc-gen-foo`, you can refer to it like so:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: foo
    out: gen/foo
    path: bin/proto/protoc-gen-foo
```

This field is **exclusive** with `remote` and only works with `name` for local plugins.

#### `strategy`

Your `strategy` of a plugin is **optional**, and specifies the generation `strategy` for `buf generate` to use.
For example, we can add a `strategy` to one of the plugins in the configuration shown above like so:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: go
    out: gen/proto/go
    opt: paths=source_relative
  - name: go-grpc
    out: gen/proto/go
    opt:
      - paths=source_relative
      - require_unimplemented_servers=false
    strategy: directory
```

There are two options:

1. `directory` **(default)**

  This results in `buf` splitting the input files by directory and making separate plugin invocations in parallel.
  That's roughly the concurrent equivalent of this operation:

  ```sh
  for dir in $(find . -name '*.proto' -print0 | xargs -0 -n1 dirname | sort | uniq); do
    protoc -I . $(find "${dir}" -name '*.proto')
  done
  ```

  Almost every `protoc` plugin either requires this, so this is the recommended `strategy`. The `directory`
  strategy is used by default if omitted.

2. `all`

  This results in `buf` making a single plugin invocation with all input files, which is roughly
  equivalent to this:

  ```
  $ protoc -I . $(find . -name '*.proto')
  ```

  This is needed for certain plugins that expect all files to be given at once.

### `managed`

The `managed` key is used to configure [Managed Mode] and is an advanced feature. A complete example of the
`managed` configuration with the `protoc-gen-go` plugin is shown below:

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
  cc_enable_arenas: false
  java_multiple_files: false
  java_package_prefix: com
  java_string_check_utf8: false
  optimize_for: CODE_SIZE
  go_package_prefix:
    default: github.com/acme/weather/private/gen/proto/go
    except:
      - buf.build/googleapis/googleapis
    override:
      buf.build/acme/weather: github.com/acme/weather/gen/proto/go
  override:
    JAVA_PACKAGE:
      acme/weather/v1/weather.proto: "org"
plugins:
  - name: go
    out: gen/proto/go
    opt: paths=source_relative
```

#### `enabled`

The `enabled` key is **required** if *any* other `managed` keys are set. Setting `enabled` equal to `true`
enables [Managed Mode](../../generate/managed-mode) according to [default behavior](../../generate/managed-mode.md#default-behavior).

#### `cc_enable_arenas`

The `cc_enable_arenas` key is **optional**, and controls what the [cc_enable_arenas](https://github.com/protocolbuffers/protobuf/blob/51405b6b92c2070c8edea1b44c6770e00f7027be/src/google/protobuf/descriptor.proto#L420)
value is set to in all of the files contained within the generation target input. The only accepted values are `false`
and `true`.

#### `java_multiple_files`

The `java_multiple_files` key is **optional**, and controls what the [java_multiple_files](https://github.com/protocolbuffers/protobuf/blob/51405b6b92c2070c8edea1b44c6770e00f7027be/src/google/protobuf/descriptor.proto#L364)
value is set to in all of the files contained within the generation target input. The only accepted values are `false`
and `true`.

#### `java_package_prefix`

The `java_package_prefix` key is **optional**, and controls what the [java_package](https://github.com/protocolbuffers/protobuf/blob/51405b6b92c2070c8edea1b44c6770e00f7027be/src/google/protobuf/descriptor.proto#L348)
prefix value is set to in all of the files contained within the generation target input. By default, the value is `com`.

#### `java_string_check_utf8`

The `java_string_check_utf8` key is **optional**, and controls what the [java_string_check_utf8](https://github.com/protocolbuffers/protobuf/blob/51405b6b92c2070c8edea1b44c6770e00f7027be/src/google/protobuf/descriptor.proto#L375)
value is set to in all of the files contained within the generation target input. The only accepted values are `false`
and `true`.

#### `optimize_for`

The `optimize_for` key is **optional**, and controls what the [optimize_for](https://github.com/protocolbuffers/protobuf/blob/51405b6b92c2070c8edea1b44c6770e00f7027be/src/google/protobuf/descriptor.proto#L385)
value is set to in all of the files contained within the generation target input. The only accepted values are `SPEED`, `CODE_SIZE` and `LITE_RUNTIME`.
If omitted, the default value, `SPEED`, is used.

#### `go_package_prefix`

The `go_package_prefix` key is **optional**, and controls what the [go_package](https://github.com/protocolbuffers/protobuf/blob/51405b6b92c2070c8edea1b44c6770e00f7027be/src/google/protobuf/descriptor.proto#L392)
value is set to in all the files contained within the generation target input.

##### `default`

The `default` key is **required** if the `go_package_prefix` key is set. The `default` value is used as a prefix for the
`go_package` value set in each of the files. The `default` value **must** be a relative filepath that **must not** jump context
from the current directory, that is they must be subdirectories relative to the current working directory. As an example,
`../external` is invalid.

In the configuration example shown above, the `github.com/acme/weather/gen/proto/go` prefix is *joined* with the given Protobuf
file's relative path from the module root. In the `buf.build/acme/weather` module's case, the `acme/weather/v1/weather.proto`
file would have this `go_package` set:

```protobuf title="acme/weather/v1/weather.proto"
syntax = "proto3";

package acme.weather.v1;

option go_package = "github.com/acme/weather/gen/proto/go/acme/weather/v1;weatherv1";
```

> If the Protobuf file's package declaration conforms to the `PACKAGE_VERSION_SUFFIX` lint rule, the final two path elements are
> concatenated and included after the `;` element in the `go_package` result. The above example generates a Go package with a package
> declaration equal to `weatherv1`, which makes it easier to import Go definitions from a variety of generated packages that would otherwise
> collide (a lot of Protobuf packages contain the `v1` suffix).

##### `except`

The `except` key is **optional**, and removes certain modules from the `go_package` file option override behavior. The `except` values **must**
be valid [module names](../../bsr/overview.md#module).

There are situations where you may want to enable **Managed Mode** for the `go_package` option in *most* of your Protobuf files, but not necessarily
for *all* of your Protobuf files. This is particularly relevant for the `buf.build/googleapis/googleapis` module, which points its `go_package` value to
an [external repository](https://github.com/googleapis/go-genproto). Popular libraries, such as [grpc-go](https://github.com/grpc/grpc-go) depend on these
`go_package` values, so it's important that **Managed Mode** does not overwrite them.

##### `override`

The `override` key is **optional**, and overrides the `go_package` file option value used for specific modules. The `override` keys **must** be valid
module names. Additionally, the corresponding `override` values **must** be a valid [Go import path](https://golang.org/ref/spec#ImportPath)
and **must not** jump context from the current directory. As an example, `../external` is invalid.

This setting is used for [workspace](../../reference/workspaces.md) environments, where you have a module that imports from another module in the same workspace, and
you need to generate the Go code for each module in different directories. This is particularly relevant for repositories that decouple their private API
definitions from their public API definitions (as is the case for `buf`).

#### `override`

This is a list of per-file overrides for each modifier. In the example provided above, an override for `acme/weather/v1/weather.proto` is set for the `java_package_prefix`
modifier to be `org` instead of `com`. This sets `org` as the package prefix for **only** the specific `acme/weather/v1/weather.proto` file and **not** for the rest of the module.
